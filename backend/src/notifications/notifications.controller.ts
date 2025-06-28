import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('알림')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 알림 목록 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 알림 수' })
  @ApiResponse({ status: 200, description: '알림 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async getMyNotifications(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.notificationsService.getUserNotifications(
      req.user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: '읽지 않은 알림 개수 조회' })
  @ApiResponse({ status: 200, description: '읽지 않은 알림 개수 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: '알림 읽음 처리' })
  @ApiResponse({ status: 200, description: '알림 읽음 처리 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    await this.notificationsService.markAsRead(+id, req.user.id);
    return { message: '알림이 읽음 처리되었습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-all-read')
  @ApiBearerAuth()
  @ApiOperation({ summary: '모든 알림 읽음 처리' })
  @ApiResponse({ status: 200, description: '모든 알림 읽음 처리 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: '모든 알림이 읽음 처리되었습니다.' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '알림 삭제' })
  @ApiResponse({ status: 200, description: '알림 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async deleteNotification(@Param('id') id: string, @Request() req) {
    await this.notificationsService.deleteNotification(+id, req.user.id);
    return { message: '알림이 삭제되었습니다.' };
  }
} 