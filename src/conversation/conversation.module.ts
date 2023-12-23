import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationMessage } from './entities/conversation.message.entity';
import { ConversationParticipant } from './entities/conversation.participant.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      ConversationParticipant,
      ConversationMessage,
    ]),
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
