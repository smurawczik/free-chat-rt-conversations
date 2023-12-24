import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/message/entities/message.entity';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation.participant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationParticipant, Message]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 3,
        baseURL: `http://${configService.get<string>(
          'USER_SERVICE_HOST',
        )}:3001`,
        withCredentials: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [TypeOrmModule],
})
export class ConversationModule {}
