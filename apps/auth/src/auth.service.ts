import { Inject, Injectable } from '@nestjs/common';
import { HandleStudentCreatedDto } from 'apps/libs/shared/dtos/handle-student-created.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma.service';
import { HandleTeacherCreatedDto } from 'apps/libs/shared/dtos/handle-teacher-created.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, 
    @Inject('EMAIL_SERVICE') private emailClient: ClientProxy
  ) {}

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
          profileType: 'STUDENT',
          profileEmail: email
        }
      });

      // TODO: Email the username and password to the student's email address
      this.emailClient.emit('send.credentials', { email, username, password, fullName });

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
          profileType: 'TEACHER',
          profileEmail: email
        }
      });

      // TODO: Email the username and password to the teacher's email address
           this.emailClient.emit('send.credentials', { email, username, password, fullName });
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        throw new Error('Username or email already exists');
      }
      
      throw new Error('Failed to create user credentials');
    }
  } 
}

 