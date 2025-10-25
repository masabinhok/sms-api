import { Body, Controller,  Get,  Post, Req, Res, UseGuards } from '@nestjs/common';
import { Param, Put, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'apps/libs/dtos/login.dto';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from 'apps/libs/guards/refresh-token.guard';
import { GetUser } from 'apps/libs/decorators/get-user.decorator';
import { AuthGuard } from 'apps/libs/guards/auth.guard';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';
import { PasswordChangeDto } from 'apps/libs/dtos/password-change.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth, 
  ApiCookieAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { 
  LoginResponseDto, 
  LogoutResponseDto, 
  RefreshTokenResponseDto, 
  UserProfileDto, 
  ErrorResponseDto,
  ApiResponseDto,
  AdminCreateProfileDto
} from 'apps/libs/dtos/response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with username, password, and role. Sets HTTP-only cookies for access and refresh tokens.'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Tokens set in cookies.',
    type: LoginResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid credentials or validation errors',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication failed',
    type: ErrorResponseDto
  })
  @Post('/login')
  async handleUserLogin(@Body() loginDto: LoginDto, @Res({passthrough: true}) res : Response) {
    const {accessToken, refreshToken, passwordChangeCount} = await this.authService.handleUserLogin(loginDto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Logged In Successfully',
      requiresPasswordChange: passwordChangeCount === 0,
      passwordChangeCount
    };
    
  }

  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and clear authentication cookies. Requires valid refresh token.'
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Logout successful. Cookies cleared.',
    type: LogoutResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    type: ErrorResponseDto
  })
  @UseGuards(RefreshTokenGuard)
  @Post('/logout')
  async handleUserLogout(
    @GetUser('sub') userId: string,
    @Res({passthrough: true}) res : Response
  ) {
    await this.authService.handleUserLogout(userId);
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return {
      message: 'Logged Out Successfully',
    };
  }

  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access and refresh tokens using valid refresh token. Updates cookies with new tokens.'
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful. New tokens set in cookies.',
    type: RefreshTokenResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
    type: ErrorResponseDto
  })
  @UseGuards(RefreshTokenGuard)
  @Post('/refresh')
  async handleUserRefresh(
    @GetUser('sub') userId: string,
    @Res({passthrough: true}) res : Response,
    @Req() req : Request,
  ) {
     const rt = req.cookies['refresh_token'];
    const { accessToken, refreshToken } = await this.authService.handleUserRefresh(
      userId,
      rt,
    );
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Token Refreshed Successfully',
    };
  }

  @ApiOperation({
    summary: 'Change user password',
    description: 'Allow authenticated users to change their password. Requires current password verification.'
  })
  @ApiCookieAuth('access_token')
  @ApiBody({ type: PasswordChangeDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: ApiResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Invalid current password or validation errors',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @UseGuards(AuthGuard)
  @Post('/change-password')
  async handlePasswordChange(
    @GetUser('sub') userId: string,
    @Body() passwordChangeDto: PasswordChangeDto){
    return this.authService.handlePasswordChange(passwordChangeDto, userId);
  }

  @ApiOperation({
    summary: 'Create admin profile',
    description: 'Create a new admin user profile. Only accessible by existing admins.'
  })
  @ApiCookieAuth('access_token')
  @ApiBody({ type: AdminCreateProfileDto })
  @ApiResponse({
    status: 201,
    description: 'Admin profile created successfully',
    type: ApiResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Validation errors or email already exists',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({
    description: 'Admin role required',
    type: ErrorResponseDto
  })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Post('/create-admin')
  async createAdminProfile(
    @Body() data: {name: string, email: string},
    @GetUser('sub') userId: string,
    @GetUser('username') username: string,
    @GetUser('role') role: string
  ){
    return this.authService.createAdminProfile(data, userId, username, role);
  }

  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile information of the currently authenticated user.'
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @UseGuards(AuthGuard)
  @Get('/me')
  async getMe(
    @GetUser('sub') userId: string
  ){
    return this.authService.getMe(userId);
  }

  // Admin management endpoints (proxy to auth microservice)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get('/admins')
  async listAdmins(@Req() req: Request) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    return this.authService.listAdmins({ page, limit, search });
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Get('/admins/:id')
  async getAdmin(@Param('id') id: string) {
    return this.authService.getAdmin(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Put('/admins/:id')
  async updateAdmin(
    @Param('id') id: string, 
    @Body() body: any,
    @GetUser('sub') userId: string,
    @GetUser('username') username: string,
    @GetUser('role') role: string
  ) {
    return this.authService.updateAdmin(id, body, userId, username, role);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SUPERADMIN')
  @Delete('/admins/:id')
  async deleteAdmin(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @GetUser('username') username: string,
    @GetUser('role') role: string
  ) {
    return this.authService.deleteAdmin(id, userId, username, role);
  }

}
