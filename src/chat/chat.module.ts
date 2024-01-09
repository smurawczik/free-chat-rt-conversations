import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/message/entities/message.entity';
import { MessageModule } from 'src/message/message.module';
import { MessageService } from 'src/message/message.service';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 3,
        baseURL: `${configService.get<string>('GATEWAY_API_URL')}`,
        withCredentials: true,
      }),
      inject: [ConfigService],
    }),
    MessageModule,
  ],
  providers: [ChatGateway, MessageService],
  exports: [TypeOrmModule],
})
export class ChatModule {}
