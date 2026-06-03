import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './api';

class SocketService {
  private socket: Socket | null = null;
  private currentUserId: string | null = null;

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentUserId = userId;

      this.socket = io(SOCKET_URL, {
        path: '/ms/socket.io',
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Socket 连接成功');
        // 加入用户房间
        this.socket?.emit('join', userId);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket 连接错误:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket 断开连接');
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
    }
  }

  // 发送消息
  sendMessage(data: {
    fromUserId: string;
    toUserId: string;
    content?: string;
    messageType?: string;
    imageUrl?: string;
    imageSize?: number;
    voiceUrl?: string;
    voiceDuration?: number;
    voiceSize?: number;
  }) {
    this.socket?.emit('sendMessage', data);
  }

  // 撤回消息
  recallMessage(data: {
    messageId: string;
    userId: string;
    targetUserId: string;
  }) {
    this.socket?.emit('recallMessage', data);
  }

  // 删除消息
  deleteMessage(data: {
    messageId: string;
    userId: string;
  }) {
    this.socket?.emit('deleteMessage', data);
  }

  // 标记已读
  markAsRead(data: {
    userId: string;
    friendUserId: string;
  }) {
    this.socket?.emit('markAsRead', data);
  }

  // 正在输入
  emitTyping(data: {
    fromUserId: string;
    toUserId: string;
  }) {
    this.socket?.emit('typing', data);
  }

  stopTyping(data: {
    fromUserId: string;
    toUserId: string;
  }) {
    this.socket?.emit('stopTyping', data);
  }

  // 消息送达确认
  messageAck(data: {
    messageIds: string[];
    userId: string;
  }) {
    this.socket?.emit('messageAck', data);
  }

  // 事件监听器
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();
