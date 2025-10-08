import { Body, Controller,  Get,  Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'apps/libs/dtos/login.dto';
import { Request, Response } from 'express';
import { RefreshTokenGuard } from 'apps/libs/guards/refresh-token.guard';
import { GetUser } from 'apps/libs/decorators/get-user.decorator';
import { AuthGuard } from 'apps/libs/guards/auth.guard';
import { RolesGuard } from 'apps/libs/guards/roles.guard';
import { Roles } from 'apps/libs/decorators/roles.decorator';
import { PasswordChangeDto } from 'apps/libs/dtos/password-change.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async handleUserLogin(@Body() loginDto: LoginDto, @Res({passthrough: true}) res : Response) {
    const {accessToken, refreshToken} = await this.authService.handleUserLogin(loginDto);

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
    };
    
  }

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

  @UseGuards(AuthGuard)
  @Post('/change-password')
  async handlePasswordChange(
    @GetUser('sub') userId: string,
    @Body() passwordChangeDto: PasswordChangeDto){
    return this.authService.handlePasswordChange(passwordChangeDto, userId);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('/admin')
  async createAdminProfile(@Body() data: {name: string, email: string}){
    return this.authService.createAdminProfile(data);
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  async getMe(
    @GetUser('sub') userId: string
  ){
    return this.authService.getMe(userId);
  }

}
