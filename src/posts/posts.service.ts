import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(content: string, userId: number) {
    return this.prisma.post.create({
      data: {
        content,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        photos: true,
      },
    });
  }

  async findAll() {
    return this.prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        photos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        photos: true,
      },
    });
  }

  async remove(id: number, userId: number) {
    // 게시글 소유자 확인
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== userId) {
      throw new Error('게시글을 삭제할 권한이 없습니다.');
    }

    return this.prisma.post.delete({
      where: { id },
    });
  }
} 