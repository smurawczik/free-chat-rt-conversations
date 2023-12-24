import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MESSAGE_QUEUE_NAME } from './message.constants';
import { MessageController } from './message.controller';
import { MessageProcessor } from './message.processor';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    BullModule.registerQueue({
      name: MESSAGE_QUEUE_NAME,
    }),
  ],
  controllers: [MessageController],
  providers: [MessageProcessor, MessageService],
  exports: [BullModule],
})
export class MessageModule {}
