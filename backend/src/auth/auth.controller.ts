import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        username: { type: 'string', example: '사용자명' }
      },
      required: ['email', 'password', 'username']
    }
  })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일 또는 사용자명' })
  async signup(@Body() body: { email: string; password: string; username: string }) {
    const user = await this.authService.signup(body.email, body.password, body.username);
    return {
      message: '회원가입이 완료되었습니다.',
      user
    };
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' }
      },
      required: ['email', 'password']
    }
  })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '이메일 또는 비밀번호 오류' })
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.authService.login(body.email, body.password);
    return {
      message: '로그인이 완료되었습니다.',
      ...result
    };
  }

  @Post('social-login')
  @ApiOperation({ summary: '소셜 로그인 (Firebase ID 토큰)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string', example: 'firebase-id-token' }
      },
      required: ['idToken']
    }
  })
  @ApiResponse({ status: 200, description: '소셜 로그인 성공' })
  @ApiResponse({ status: 401, description: '토큰 검증 실패' })
  async socialLogin(@Body() body: { idToken: string }) {
    const result = await this.authService.verifyFirebaseToken(body.idToken);
    return {
      message: '소셜 로그인이 완료되었습니다.',
      ...result
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async getProfile(@Request() req) {
    const profile = await this.authService.getProfile(req.user.id);
    return {
      profile
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '프로필 수정' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: '새로운사용자명' },
        profileImage: { type: 'string', example: 'https://example.com/image.jpg' }
      }
    }
  })
  @ApiResponse({ status: 200, description: '프로필 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 409, description: '이미 존재하는 사용자명' })
  async updateProfile(
    @Request() req,
    @Body() body: { username?: string; profileImage?: string }
  ) {
    const profile = await this.authService.updateProfile(req.user.id, body);
    return {
      message: '프로필이 수정되었습니다.',
      profile
    };
  }
}
