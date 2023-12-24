import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationParticipant } from 'src/conversation/entities/conversation.participant.entity';
import { Message } from 'src/message/entities/message.entity';
import { MessageService } from 'src/message/message.service';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    private readonly messageService: MessageService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    client.emit('handshake', 'Successfully connected to server');
    this.logger.log(`Client connected: ${client.id}: args: ${args}`);
  }

  @SubscribeMessage('join-chat-room')
  handleJoinChatRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    client.emit('joined-chat-room', { roomId: data.roomId });
  }

  @SubscribeMessage('leave-chat-room')
  handleLeaveChatRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    client.emit('left-chat-room', { roomId: data.roomId });
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      message: string;
      sender: ConversationParticipant;
      timestamp: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const message = this.messageRepository.create({
      id: uuidv4(),
      timestamp: new Date().toUTCString(),
      sender: { id: data.sender.id },
      conversation: { id: data.roomId },
      message: data.message,
    });

    this.messageService.saveMessage(message);

    client.to(data.roomId).emit('receive-message', {
      roomId: data.roomId,
      message: {
        id: message.id,
        sender: data.sender,
        message: data.message,
        timestamp: message.timestamp,
      },
    });
  }
}
