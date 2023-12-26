import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { MessageService } from './message/message.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: `${configService.get<string>('DB_HOST')}`,
        port: 3306,
        username: 'docker',
        password: 'docker',
        database: 'conversations',
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        synchronize: true,
        dropSchema: true,
        autoLoadEntities: true,
        // logging: true,
      }),
      inject: [ConfigService],
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
      limiter: {
        max: 100,
        duration: 1000,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 2,
      },
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: 5000,
        maxRedirects: 3,
        baseURL: `http://${configService.get<string>(
          'USER_SERVICE_HOST',
        )}:3000`,
        withCredentials: true,
      }),
      inject: [ConfigService],
    }),
    ConversationModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChatGateway, MessageService],
})
export class AppModule {}
