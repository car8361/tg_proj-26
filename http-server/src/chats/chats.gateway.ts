import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {HttpException, UsePipes, ValidationPipe} from "@nestjs/common";

@UsePipes(new ValidationPipe({
  whitelist: true,
  exceptionFactory: (errors) => new WsException(errors),
}))
@WebSocketGateway(3001, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    server.use(async (socket: Socket, next) => {
      try {
        const verified = socket.request.session.verified;
        if (!verified) {
          socket.emit("kicked", {reason: "You aren't logged in or verified"});
          next(new Error('Unauthorized'));
        }
        const userId = socket.request.session.userId;
      } catch {
        socket.emit("kicked", {reason: "Server error"})
        next(new Error('Unauthorized'));
      }
    });
  }

  handleConnection(@ConnectedSocket() client: Socket) {
     try {
       const verified = client.request.session.verified;
       if (!verified) {
         client.emit("kicked", {reason: "You were logged out"});
         client.disconnect(true);
       }
     } catch {
       client.emit("kicked", {reason: "Server error"});
       client.disconnect(true);
     }
  }

  @SubscribeMessage("join")
  async joinRoom(@ConnectedSocket() client: Socket) {
    const userId = client.request.session.userId;
    await client.join(`chat:${userId.toString()}`);
    return { ok: true };
  }

  async broadcastMessage(roomId: string[], senderName: string, message: string) {
    try {
      this.server.to(roomId).emit('message', {senderName, message});
    } catch (err) {
      console.error(err);
      throw new HttpException("Internal Server Error", 500); //potřebuje změnu
    }
  }
}
