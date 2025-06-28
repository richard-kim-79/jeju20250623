import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards, 
  UseInterceptors, 
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Request
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('게시글')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회' })
  @ApiResponse({ status: 200, description: '게시글 목록 조회 성공' })
  findAll() {
    return this.postsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: '게시글 검색' })
  @ApiQuery({ name: 'query', required: false, description: '검색어' })
  @ApiQuery({ name: 'category', required: false, description: '카테고리 (food, travel, weather, culture, activity)' })
  @ApiQuery({ name: 'location', required: false, description: '위치' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 게시글 수' })
  @ApiResponse({ status: 200, description: '검색 결과' })
  search(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.search({
      query,
      category,
      location,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 상세 조회' })
  @ApiResponse({ status: 200, description: '게시글 상세 조회 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 좋아요' })
  @ApiResponse({ status: 200, description: '좋아요 처리 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  likePost(@Param('id') id: string, @Request() req) {
    return this.postsService.likePost(+id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 5))
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 작성' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '제주 올레길 추천' },
        content: { type: 'string', example: '제주 올레 7코스는 정말 아름다워요!' },
        location: { type: 'string', example: '제주 올레 7코스' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['title', 'content']
    }
  })
  @ApiResponse({ status: 201, description: '게시글 작성 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  async create(
    @Body() body: { title: string; content: string; location?: string },
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif)' }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Express.Multer.File[],
    @Request() req
  ) {
    return this.postsService.create({
      title: body.title,
      content: body.content,
      location: body.location,
      userId: req.user.id,
      files: files || []
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 삭제' })
  @ApiResponse({ status: 200, description: '게시글 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 필요' })
  @ApiResponse({ status: 403, description: '삭제 권한 없음' })
  remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(+id, req.user.id);
  }
}
