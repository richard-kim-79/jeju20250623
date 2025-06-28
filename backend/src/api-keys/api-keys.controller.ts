import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('API 키')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'API 키 발급' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '제주 SNS API 키' }
      },
      required: ['name']
    }
  })
  @ApiResponse({ status: 201, description: 'API 키 발급 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async generateApiKey(@Body() body: { name: string }, @Request() req) {
    const apiKey = await this.apiKeysService.generateApiKey(req.user.id, body.name);
    return {
      message: 'API 키가 성공적으로 발급되었습니다.',
      apiKey,
      name: body.name
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 API 키 목록 조회' })
  @ApiResponse({ status: 200, description: 'API 키 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async getMyApiKeys(@Request() req) {
    const apiKeys = await this.apiKeysService.getUserApiKeys(req.user.id);
    return {
      apiKeys
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'API 키 폐기' })
  @ApiResponse({ status: 200, description: 'API 키 폐기 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  async revokeApiKey(@Param('id') id: string, @Request() req) {
    const success = await this.apiKeysService.revokeApiKey(req.user.id, +id);
    if (success) {
      return { message: 'API 키가 성공적으로 폐기되었습니다.' };
    } else {
      return { message: 'API 키를 찾을 수 없거나 권한이 없습니다.' };
    }
  }
} 