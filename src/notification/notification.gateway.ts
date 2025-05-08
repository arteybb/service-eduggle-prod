import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, string>();
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers.set(userId, client.id);
      console.log(`User ${userId} connected`);
    } else {
      console.log('No userId provided');
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.onlineUsers.entries()].find(
      ([_, id]) => id === client.id,
    )?.[0];
    if (userId) {
      this.onlineUsers.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  sendToUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      const socketId = this.onlineUsers.get(userId);
      if (socketId) {
        this.server.to(socketId).emit('notification', notification);
      }
    });
  }
  sendUnreadCountToUsers(userIds: string[], unreadCount: number) {
    userIds.forEach((userId) => {
      const socketId = this.onlineUsers.get(userId);
      if (socketId) {
        this.server.to(socketId).emit('unreadCount', { unreadCount });
      }
    });
  }
}
