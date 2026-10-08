import {MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';

@WebSocketGateway(3001, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true }
})
export class ChatsGateway {
  @WebSocketServer()
  server: any;

  @SubscribeMessage('connect')
  handleMessage(@MessageBody() message: string) {
    this.server.emit('connect', message);
  }
}
