import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // 댓글 목록 조회
  async getComments(postId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId, parentId: null }, // 최상위 댓글만 조회
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profileImage: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: { postId, parentId: null },
      }),
    ]);

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 댓글 작성
  async createComment(userId: number, postId: number, content: string, parentId?: number) {
    // 게시글 존재 확인
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 대댓글인 경우 부모 댓글 존재 확인
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('부모 댓글을 찾을 수 없습니다.');
      }
    }

    // 댓글 생성
    const comment = await this.prisma.comment.create({
      data: {
        content,
        userId,
        postId,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    // 게시글 작성자에게 알림 전송 (자신의 게시글이 아닌 경우)
    if (post.userId !== userId) {
      await this.notificationsService.createNotification({
        type: 'comment',
        title: '새 댓글',
        message: `${comment.user.username}님이 회원님의 게시글에 댓글을 남겼습니다.`,
        recipientId: post.userId,
        senderId: userId,
        data: {
          postId,
          commentId: comment.id,
          commentContent: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        },
      });
    }

    return comment;
  }

  // 댓글 수정
  async updateComment(userId: number, commentId: number, content: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }

    return await this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
  }

  // 댓글 삭제
  async deleteComment(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    // 댓글 작성자 또는 게시글 작성자만 삭제 가능
    if (comment.userId !== userId && comment.post.userId !== userId) {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    return { message: '댓글이 삭제되었습니다.' };
  }

  // 댓글 좋아요
  async likeComment(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    // 이미 좋아요를 눌렀는지 확인
    const existingLike = await this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingLike) {
      // 좋아요 취소
      await this.prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });

      return { message: '댓글 좋아요가 취소되었습니다.', liked: false };
    } else {
      // 좋아요 추가
      await this.prisma.commentLike.create({
        data: {
          userId,
          commentId,
        },
      });

      // 댓글 작성자에게 알림 전송 (자신의 댓글이 아닌 경우)
      if (comment.userId !== userId) {
        await this.notificationsService.createNotification({
          type: 'comment_like',
          title: '댓글 좋아요',
          message: `누군가 회원님의 댓글에 좋아요를 눌렀습니다.`,
          recipientId: comment.userId,
          senderId: userId,
          data: {
            commentId,
            commentContent: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
          },
        });
      }

      return { message: '댓글에 좋아요를 눌렀습니다.', liked: true };
    }
  }

  // 내 댓글 목록 조회
  async getMyComments(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { userId },
        include: {
          post: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: { userId },
      }),
    ]);

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
} 