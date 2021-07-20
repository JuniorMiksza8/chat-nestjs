import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets'
import { randomUUID } from 'crypto'

import { Socket, Server } from 'socket.io'

@WebSocketGateway()
export default class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  sockets: any[] = []

  @SubscribeMessage('message')
  message(client: Socket, data: any) {
    this.server.emit('message', data)
  }

  handleDisconnect(socket: Socket) {
    this.sockets = this.sockets.filter(
      (value: any) => value.socket.id !== socket.id,
    )
  }

  handleConnection(socket: Socket) {
    const user = {
      id: randomUUID(),
      username: socket.handshake.query.username,
      color: socket.handshake.query.color,
      socket,
    }

    this.sockets.push(user)

    socket.emit('connection', {
      user: { id: user.id, username: user.username, color: user.color },
    })

    this.server.emit(
      'roomRefresh',
      this.sockets.map((user: any) => {
        return { id: user.id, username: user.username, color: user.color }
      }),
    )
  }
}
