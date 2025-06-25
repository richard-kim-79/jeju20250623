import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('댓글')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('post/:postId')
  @ApiOperation({ summary: '게시글 댓글 목록 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 댓글 수 (기본값: 10)' })
  @ApiResponse({ status: 200, description: '댓글 목록 조회 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async getComments(
    @Param('postId') postId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.commentsService.getComments(
      parseInt(postId),
      parseInt(page),
      parseInt(limit),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({ status: 201, description: '댓글 작성 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async createComment(
    @Request() req,
    @Body() body: { content: string; postId: number; parentId?: number },
  ) {
    return await this.commentsService.createComment(
      req.user.id,
      body.postId,
      body.content,
      body.parentId,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 수정' })
  @ApiResponse({ status: 200, description: '댓글 수정 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async updateComment(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return await this.commentsService.updateComment(
      req.user.id,
      parseInt(id),
      body.content,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({ status: 200, description: '댓글 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async deleteComment(@Request() req, @Param('id') id: string) {
    return await this.commentsService.deleteComment(req.user.id, parseInt(id));
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 좋아요/취소' })
  @ApiResponse({ status: 200, description: '댓글 좋아요/취소 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없음' })
  async likeComment(@Request() req, @Param('id') id: string) {
    return await this.commentsService.likeComment(req.user.id, parseInt(id));
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 댓글 목록 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 댓글 수 (기본값: 10)' })
  @ApiResponse({ status: 200, description: '내 댓글 목록 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async getMyComments(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.commentsService.getMyComments(
      req.user.id,
      parseInt(page),
      parseInt(limit),
    );
  }
} 