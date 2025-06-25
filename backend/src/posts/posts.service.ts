import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../s3/s3.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
// import { SearchService } from '../search/search.service';

interface CreatePostData {
  title: string;
  content: string;
  location?: string;
  userId: number;
  files?: Express.Multer.File[];
}

interface SearchOptions {
  query?: string;
  category?: string;
  location?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private notificationsGateway: NotificationsGateway,
    // private searchService: SearchService
  ) {}

  async create(data: CreatePostData) {
    const { title, content, location, userId, files = [] } = data;
    
    // S3에 이미지 업로드
    const imageUrls: string[] = [];
    for (const file of files) {
      try {
        const url = await this.s3Service.uploadFile(file, 'posts');
        imageUrls.push(url);
      } catch (error) {
        console.error('S3 업로드 실패:', error);
        // S3 업로드 실패 시에도 게시글은 생성
      }
    }
    
    const post = await this.prisma.post.create({
      data: {
        title,
        content,
        location,
        userId,
        photos: {
          create: imageUrls.map(url => ({ url }))
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        photos: true,
      },
    });

    // Elasticsearch에 인덱싱 (임시 비활성화)
    // try {
    //   await this.searchService.indexPost(post.id);
    // } catch (error) {
    //   console.error('Elasticsearch 인덱싱 실패:', error);
    // }

    return post;
  }

  async findAll() {
    return this.prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        photos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async search(options: SearchOptions) {
    const { query, category, location, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // 카테고리별 필터링 (간단한 키워드 매칭)
    if (category && category !== 'all') {
      const categoryKeywords = {
        food: ['맛집', '음식', '식당', '카페', '레스토랑'],
        travel: ['관광', '여행', '올레', '해변', '산'],
        weather: ['날씨', '기후', '온도'],
        culture: ['문화', '박물관', '전시', '축제'],
        activity: ['액티비티', '스포츠', '레저', '체험']
      };

      if (categoryKeywords[category]) {
        where.OR = [
          ...(where.OR || []),
          ...categoryKeywords[category].map(keyword => ({
            OR: [
              { title: { contains: keyword, mode: 'insensitive' } },
              { content: { contains: keyword, mode: 'insensitive' } },
            ]
          }))
        ];
      }
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          photos: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where })
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        photos: true,
      },
    });
  }

  async likePost(postId: number, userId: number) {
    // 게시글 존재 확인
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    // 자신의 게시글에는 좋아요를 할 수 없음
    if (post.userId === userId) {
      throw new Error('자신의 게시글에는 좋아요를 할 수 없습니다.');
    }

    // 좋아요 알림 전송
    try {
      await this.notificationsGateway.sendLikeNotification(
        postId,
        post.title,
        post.userId, // 게시글 작성자
        userId // 좋아요 누른 사용자
      );
    } catch (error) {
      console.error('알림 전송 실패:', error);
    }

    return {
      message: '좋아요가 처리되었습니다.',
      postId,
      likedBy: userId
    };
  }

  async remove(id: number, userId: number) {
    // 게시글 소유자 확인
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        photos: true,
      },
    });

    if (!post || post.userId !== userId) {
      throw new Error('게시글을 삭제할 권한이 없습니다.');
    }

    // S3에서 이미지 삭제
    for (const photo of post.photos) {
      try {
        await this.s3Service.deleteFile(photo.url);
      } catch (error) {
        console.error('S3 삭제 실패:', error);
      }
    }

    // Elasticsearch에서 삭제
    // try {
    //   await this.searchService.deletePost(id);
    // } catch (error) {
    //   console.error('Elasticsearch 삭제 실패:', error);
    // }

    return this.prisma.post.delete({
      where: { id },
    });
  }
}
