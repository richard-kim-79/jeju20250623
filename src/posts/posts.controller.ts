import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Post()
  create(@Body() body: { content: string; userId: number }) {
    return this.postsService.create(body.content, body.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body() body: { userId: number }) {
    return this.postsService.remove(+id, body.userId);
  }
} 