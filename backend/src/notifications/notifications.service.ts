import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface CreateNotificationData {
  type: 'like' | 'comment' | 'comment_like' | 'follow' | 'system';
  title: string;
  message: string;
  recipientId: number;
  senderId?: number;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: CreateNotificationData) {
    return this.prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        recipientId: data.recipientId,
        senderId: data.senderId,
        data: data.data,
      },
      include: {
        recipient: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async getUserNotifications(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { recipientId: userId },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { recipientId: userId },
      }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: userId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async deleteNotification(notificationId: number, userId: number) {
    return this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        recipientId: userId,
      },
    });
  }

  // 시스템 알림 생성
  async createSystemNotification(userId: number, title: string, message: string, data?: any) {
    return this.createNotification({
      type: 'system',
      title,
      message,
      recipientId: userId,
      data,
    });
  }

  // 좋아요 알림 생성
  async createLikeNotification(postId: number, postTitle: string, recipientId: number, senderId: number) {
    return this.createNotification({
      type: 'like',
      title: '새로운 좋아요',
      message: `당신의 게시글 "${postTitle}"에 좋아요가 눌렸습니다.`,
      recipientId,
      senderId,
      data: { postId },
    });
  }

  // 댓글 알림 생성
  async createCommentNotification(postId: number, postTitle: string, recipientId: number, senderId: number) {
    return this.createNotification({
      type: 'comment',
      title: '새로운 댓글',
      message: `당신의 게시글 "${postTitle}"에 댓글이 달렸습니다.`,
      recipientId,
      senderId,
      data: { postId },
    });
  }

  // 팔로우 알림 생성
  async createFollowNotification(recipientId: number, senderId: number) {
    return this.createNotification({
      type: 'follow',
      title: '새로운 팔로워',
      message: '새로운 사용자가 당신을 팔로우했습니다.',
      recipientId,
      senderId,
    });
  }
} 