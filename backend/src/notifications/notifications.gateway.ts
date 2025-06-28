import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

@WebSocketGateway({
  cors: {
    origin: "http://localhost:3001",
    credentials: true
  }
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<number, string>(); // userId -> socketId

  constructor(private notificationsService: NotificationsService) {}

  async handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);
    
    // JWT 토큰을 통해 사용자 인증
    const token = client.handshake.auth.token;
    if (token) {
      try {
        // 토큰 검증 로직 (간단한 예시)
        // 실제로는 JWT 서비스를 사용해야 함
        const userId = this.extractUserIdFromToken(token);
        if (userId) {
          client.userId = userId;
          this.connectedUsers.set(userId, client.id);
          console.log(`User ${userId} connected with socket ${client.id}`);
        }
      } catch (error) {
        console.error('Token validation failed:', error);
      }
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: { userId: number }) {
    if (client.userId === data.userId) {
      this.connectedUsers.set(data.userId, client.id);
      client.join(`user_${data.userId}`);
      console.log(`User ${data.userId} joined their room`);
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: number }
  ) {
    if (client.userId) {
      await this.notificationsService.markAsRead(data.notificationId, client.userId);
      client.emit('notificationMarkedAsRead', { notificationId: data.notificationId });
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userId) {
      await this.notificationsService.markAllAsRead(client.userId);
      client.emit('allNotificationsMarkedAsRead');
    }
  }

  // 다른 사용자에게 알림 전송
  async sendNotificationToUser(userId: number, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('newNotification', notification);
    }
  }

  // 특정 사용자에게 시스템 알림 전송
  async sendSystemNotification(userId: number, title: string, message: string, data?: any) {
    const notification = await this.notificationsService.createSystemNotification(userId, title, message, data);
    await this.sendNotificationToUser(userId, notification);
  }

  // 좋아요 알림 전송
  async sendLikeNotification(postId: number, postTitle: string, recipientId: number, senderId: number) {
    const notification = await this.notificationsService.createLikeNotification(postId, postTitle, recipientId, senderId);
    await this.sendNotificationToUser(recipientId, notification);
  }

  // 댓글 알림 전송
  async sendCommentNotification(postId: number, postTitle: string, recipientId: number, senderId: number) {
    const notification = await this.notificationsService.createCommentNotification(postId, postTitle, recipientId, senderId);
    await this.sendNotificationToUser(recipientId, notification);
  }

  // 팔로우 알림 전송
  async sendFollowNotification(recipientId: number, senderId: number) {
    const notification = await this.notificationsService.createFollowNotification(recipientId, senderId);
    await this.sendNotificationToUser(recipientId, notification);
  }

  // 연결된 사용자 수 반환
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // 특정 사용자가 연결되어 있는지 확인
  isUserConnected(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  private extractUserIdFromToken(token: string): number | null {
    try {
      // 간단한 토큰 파싱 (실제로는 JWT 서비스 사용)
      // 여기서는 예시로 간단하게 처리
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return decoded.sub || null;
    } catch (error) {
      return null;
    }
  }
} 