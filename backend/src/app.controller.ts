import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PostsService } from './posts/posts.service';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private jwtService: JwtService,
    private readonly postsService: PostsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('test')
  getTest() {
    return { message: '테스트 성공!', timestamp: new Date().toISOString() };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(@Request() req) {
    return { message: '인증된 사용자만 접근 가능', user: req.user };
  }

  @Post('test-login')
  async testLogin(@Body() body: { email: string; password: string }) {
    try {
      // 데이터베이스에서 사용자 확인
      const user = await this.prisma.user.findUnique({
        where: { email: body.email },
      });

      if (user && user.password === body.password) {
        const token = this.jwtService.sign({ 
          userId: user.id, 
          email: user.email 
        });

        return {
          message: '로그인이 완료되었습니다.',
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
        };
      } else {
        throw new Error('이메일 또는 비밀번호가 잘못되었습니다.');
      }
    } catch (error) {
      throw new Error('로그인에 실패했습니다.');
    }
  }

  @Post('test-signup')
  async testSignup(@Body() body: { email: string; password: string; username: string }) {
    // 간단한 테스트용 회원가입
    const token = this.jwtService.sign({ 
      userId: 1, 
      email: body.email 
    });

    return {
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: 1,
        email: body.email,
        username: body.username,
      },
    };
  }

  @Get('posts')
  async getPosts() {
    return this.postsService.findAll();
  }

  @Post('comments/test')
  async createTestComment(@Body() body: { content: string; postId: number }) {
    // 테스트용 댓글 생성 (인증 없이)
    try {
      const comment = await this.prisma.comment.create({
        data: {
          content: body.content,
          userId: 1, // 테스트 사용자 ID
          postId: body.postId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return {
        message: '댓글이 성공적으로 작성되었습니다.',
        comment,
      };
    } catch (error) {
      return {
        error: '댓글 작성에 실패했습니다.',
        details: error.message,
      };
    }
  }

  @Get('comments/post/:postId')
  async getCommentsByPost(@Param('postId') postId: string) {
    try {
      const comments = await this.prisma.comment.findMany({
        where: {
          postId: parseInt(postId),
          parentId: null, // 최상위 댓글만
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        comments,
        total: comments.length,
      };
    } catch (error) {
      return {
        error: '댓글 조회에 실패했습니다.',
        details: error.message,
      };
    }
  }
}
