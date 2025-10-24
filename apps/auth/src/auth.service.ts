import { Inject, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { HandleStudentCreatedDto } from 'apps/libs/dtos/handle-student-created.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';
import { HandleTeacherCreatedDto } from 'apps/libs/dtos/handle-teacher-created.dto';
import { ClientProxy } from '@nestjs/microservices';
import { LoginDto } from 'apps/libs/dtos/login.dto';
import { Role, User } from '../generated/prisma';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordChangeDto } from '../dtos/password-change.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, 
    @Inject('EMAIL_SERVICE') private emailClient: ClientProxy,
    private jwtService: JwtService,
    private config: ConfigService
  ) {}

  async handleSchoolCreated(payload: {schoolId: string; name: string, userId: string}) {
    try{
      const {schoolId, userId} = payload;

      const updatedAdmin = await this.prisma.user.update({
        where: {id: userId},
        data: {
          schoolId
        }
      });

      if(!updatedAdmin){
        throw new Error('Admin not found to associate school');
      }

    }catch(error){
      console.error('Error handling school created event:', error);
      throw new Error('Failed to handle school created event');
    }
  }


  async createAdminProfile(payload : {name: string, email: string}) {
    try {
      const {name, email} = payload;
      // Generate fake admin data
      const adminData = {
        username: `admin-${name}`,
        password: 'admin123', // Default password
        email: email,
        fullName: `System Administrator ${name}`,
        profileId: `admin-${name}-001`, // Unique admin profile ID
      };

      // Check if admin already exists
      const existingAdmin = await this.prisma.user.findFirst({
        where: { 
          role: 'ADMIN',
          username: adminData.username
         }
      });

      if (existingAdmin) {
      
        return { 
          message: 'Admin already exists', 
          username: existingAdmin.username 
        };
      }

      

      // Hash the password
      const hashedPassword = await this.generateHash(adminData.password);

      // Create admin user
       await this.prisma.user.create({
        data: {
          username: adminData.username,
          passwordHash: hashedPassword,
          role: 'ADMIN',
          profileId: adminData.profileId,
          profileEmail: adminData.email,
        }
      });

   

      this.emailClient.emit('user.created', { 
        email: adminData.email, 
        username: adminData.username, 
        password: adminData.password, 
        fullName: adminData.fullName 
      });

      return {
        success: true,
        message: 'Admin profile created successfully',
        adminData: {
          username: adminData.username,
          email: adminData.email,
          fullName: adminData.fullName
        }
      };

    } catch (error) {
      console.error('Error creating admin profile:', error);
      
      if (error.code === 'P2002') {
        throw new Error('Admin username already exists');
      }
      
      throw new Error(`Failed to create admin profile: ${error.message}`);
    }
  }


  
  
  generateUsername(fullName: string, dob: string, studentId: string): string {
    const namePart = fullName.split(' ').map(n => n[0].toUpperCase()).join('');

    const dateOnly = dob.split('T')[0]; // "2000-01-01"
    const [year, month, day] = dateOnly.split('-');
    const datePart = month + day; // "0101"

    return studentId.slice(-4) + namePart + datePart;
  }

  generatePassword(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const password = Array.from(
      { length: 8 }, 
      () => characters[Math.floor(Math.random() * characters.length)]).join('');
    return password;
  }

  async generateHash(password: string): Promise<string> {
    const saltOrRounds = 10;
    // Remove redundant salt generation - bcrypt.hash() handles this automatically
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  private async generateUniqueUsername(fullName: string, dob: string, studentId: string): Promise<string> {
    let username = this.generateUsername(fullName, dob, studentId);
    let counter = 0;

    // Check for existing username and replace first digit with counter if needed
    while (
      await this.prisma.user.findUnique({
        where: {
          username
        }
      })
    ) {
      counter++;
      const baseUsername = this.generateUsername(fullName, dob, studentId);
      // Replace the first character with the counter to maintain same length
      username = counter.toString() + baseUsername.slice(1);
    }

    return username;
  }

  async handleStudentCreated(payload: HandleStudentCreatedDto) {
    try {
      // Logic to generate login credentials for student
      const { studentId, fullName, dob, email } = payload;
  
      
      // Generate unique username to avoid collisions
      const username = await this.generateUniqueUsername(fullName, dob, studentId);
      const password = this.generatePassword();

      // Hash the password
      const hashedPassword = await this.generateHash(password);
     

      await this.prisma.user.create({
        data: {
          username,
          passwordHash: hashedPassword,
          role: 'STUDENT',
          profileId: studentId,
          profileEmail: email
        }
      });

      // TODO: Email the username and password to the student's email address
      this.emailClient.emit('user.created', { email, username, password, fullName });

    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        throw new Error('Username or email already exists');
      }
      
      throw new Error('Failed to create user credentials');
    }
  } 

  async handleTeacherCreated(payload: HandleTeacherCreatedDto) {
    try {
      // Logic to generate login credentials for teacher
      const { teacherId, fullName, dob, email } = payload;
  
      
      // Generate unique username to avoid collisions
      const username = await this.generateUniqueUsername(fullName, dob, teacherId);
      const password = this.generatePassword();

      // Hash the password
      const hashedPassword = await this.generateHash(password);
     

      await this.prisma.user.create({
        data: {
          username,
          passwordHash: hashedPassword,
          role: 'TEACHER',
          profileId: teacherId,
          profileEmail: email
        }
      });

      // TODO: Email the username and password to the teacher's email address
           this.emailClient.emit('user.created', { email, username, password, fullName });
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        throw new Error('Username or email already exists');
      }
      
      throw new Error('Failed to create user credentials');
    }
  } 

  // generate tokens
    async generateTokens(
    userId: string,
    username: string,
    role: Role,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = {
      sub: userId,
      username,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRE'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRE'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  //update refresh token
    async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await this.generateHash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashedToken,
      },
    });
  }

  // login
  async handleUserLogin(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    passwordChangeCount: number;
  }> {
    const { username, password, role} = loginDto;
    const user = await this.prisma.user.findFirst({
      where: { 
        username,
        role
       }
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new RpcException({
        status: 401,
        message: 'Invalid username or password or role.'
      });
    }

    const tokens = await this.generateTokens(user.id, username, user.role);

    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      ...tokens,
      passwordChangeCount: user.passwordChangeCount
    };
  }

  // refresh token
 async handleUserRefresh(
    userId: string,
    token: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      }
    })

    if (!user || !user.refreshToken) throw new RpcException({
      status: 403,
      message: 'Forbidden: Invalid refresh token'
    });

    const matches = await bcrypt.compare(token, user.refreshToken);

    if (!matches) throw new RpcException({
      status: 401,
      message: 'Invalid token'
    });

    const tokens = await this.generateTokens(userId, user.username, user.role);
    await this.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }

  // logout
   async handleUserLogout(userId: string): Promise<{success: boolean, message: string}> {
    const loggedOutUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });

    if(!loggedOutUser){
      throw new RpcException({
        status: 400,
        message: 'No user to Logout'
      });
    }

    return {
      success: true,
      message: 'User logged out successfully'
    };
  }

  async handlePasswordChange(data: PasswordChangeDto): Promise<{success: boolean, message: string}> {
    const {userId, oldPassword, newPassword} = data;

    // Check if new password is the same as old password
    if (oldPassword === newPassword) {
      throw new RpcException({
        status: 400,
        message: 'New password must be different from the old password'
      });
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if(!user) {
      throw new RpcException({
        status: 401,
        message: 'User not found'
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if(!isOldPasswordValid) {
      throw new RpcException({
        status: 401,
        message: 'Incorrect old password'
      });
    }

    const hashedPassword = await this.generateHash(newPassword);

    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId
      }, 
      data: {
        passwordHash: hashedPassword,
        passwordChangeCount: user.passwordChangeCount + 1,
        // Clear refresh token to force re-login with new password
        refreshToken: null
      }
    });

    if(!updatedUser) {
      throw new RpcException({
        status: 400,
        message: 'Failed to update password'
      });
    }
    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  // Admin CRUD implementations
  async listAdmins(payload: { page?: number; limit?: number; search?: string }) {
    const page = payload.page ?? 1;
    const limit = payload.limit ?? 10;
    const where: any = { role: 'ADMIN' };
    if (payload.search) {
      where.OR = [
        { username: { contains: payload.search, mode: 'insensitive' } },
        { profileEmail: { contains: payload.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map(u => ({ id: u.id, username: u.username, email: u.profileEmail, createdAt: u.createdAt })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      }
    };
  }

  async getAdmin(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'ADMIN') {
      throw new RpcException({ status: 404, message: 'Admin not found' });
    }
  return { id: user.id, username: user.username, email: user.profileEmail, createdAt: user.createdAt };
  }

  async updateAdmin(id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'ADMIN') {
      throw new RpcException({ status: 404, message: 'Admin not found' });
    }

    const updated = await this.prisma.user.update({ where: { id }, data: {
      profileEmail: data.email ?? user.profileEmail,
    }});

    return { id: updated.id, username: updated.username, email: updated.profileEmail, createdAt: updated.createdAt };
  }

  async deleteAdmin(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'ADMIN') {
      throw new RpcException({ status: 404, message: 'Admin not found' });
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: 'Admin deleted' };
  }
 

  async getSafeUser(user: User){
    const {passwordHash, refreshToken, ...safeUser} = user;

    return safeUser;
  }


   async handleGetMe(userId: string){
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    //already authenticated, but also double check 
    if(!user){
      throw new RpcException({
        status: 400, 
        message: 'User not found!'
      })
    }
    //extract sensitive info like passwordHash and refreshToken
    const safeUser = await this.getSafeUser(user);

    return {
      success: true, 
      message: 'User found successfully.',
      user: safeUser
    }
  }

}