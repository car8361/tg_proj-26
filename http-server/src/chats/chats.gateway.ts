import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {ChatsService} from "./chats.service.js";

@WebSocketGateway(3001, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor (private readonly chatsService: ChatsService) {}

  handleConnection(client: Socket) {
     try {
       const userId = client.data.userId
       if (!userId) {
         return;
       }
     } catch {
       client.disconnect();
     }
  }

  async broadcastMessage() {

  }
}
