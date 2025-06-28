import { io, Socket } from 'socket.io-client';

class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io('http://localhost:3000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('WebSocket 연결됨');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket 연결 해제됨');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket 연결 오류:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 사용자 룸에 참가
  joinUserRoom(userId: number) {
    if (this.socket) {
      this.socket.emit('join', { userId });
    }
  }

  // 알림 읽음 처리
  markAsRead(notificationId: number) {
    if (this.socket) {
      this.socket.emit('markAsRead', { notificationId });
    }
  }

  // 모든 알림 읽음 처리
  markAllAsRead() {
    if (this.socket) {
      this.socket.emit('markAllAsRead');
    }
  }
}

// 싱글톤 인스턴스
const socketManager = new SocketManager();
export default socketManager; 