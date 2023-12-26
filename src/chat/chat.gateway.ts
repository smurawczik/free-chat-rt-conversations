import { HttpService } from '@nestjs/axios';
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
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    private readonly httpService: HttpService,

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
  async handleJoinChatRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const validatedUser = await this.handleAuthValidation(client);

    if (!validatedUser) {
      return;
    }

    client.join(data.roomId);
    client.emit('joined-chat-room', { roomId: data.roomId });
  }

  @SubscribeMessage('leave-chat-room')
  async handleLeaveChatRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    client.emit('left-chat-room', { roomId: data.roomId });
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      message: string;
      sender: ConversationParticipant;
      timestamp: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const validatedUser = await this.handleAuthValidation(client);

    if (!validatedUser) {
      return;
    }

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

  async handleAuthValidation(@ConnectedSocket() client: Socket) {
    try {
      const { data, status } = await this.httpService.axiosRef.post(
        'http://localhost:3000/auth/verify',
        {
          accessToken: client.handshake.headers.cookie?.split('=')[1],
        },
      );

      return Boolean(data.id && (status === 200 || status === 201));
    } catch (error) {
      return false;
    }
  }
}
