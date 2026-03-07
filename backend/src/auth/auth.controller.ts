import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, Get, UseGuards, Request as Req } from '@nestjs/common';
import { ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';
import { registerSchema, loginSchema } from './dto/auth.schema';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new YupValidationPipe(registerSchema))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Test User' },
        email: { type: 'string', example: 'test@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  async register(@Body() body: any) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new YupValidationPipe(loginSchema))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getProfile(@Req() req: any) {
    return req.user;
  }
}