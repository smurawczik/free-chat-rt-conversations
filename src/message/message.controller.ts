import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Post } from '@nestjs/common';
import { Queue } from 'bull';
import { CreateMessageDto } from './dto/create-message.dto';
import { MESSAGE_QUEUE_NAME } from './message.constants';

@Controller('message')
export class MessageController {
  constructor(
    @InjectQueue(MESSAGE_QUEUE_NAME) private readonly messageQueue: Queue,
  ) {}

  @Post()
  async saveMessage(@Body() createMessageDto: CreateMessageDto) {
    await this.messageQueue.add('save-message', {
      messageData: createMessageDto,
    });
  }
}
