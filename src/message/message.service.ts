import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { Message } from './entities/message.entity';
import { MESSAGE_QUEUE_NAME } from './message.constants';

@Injectable()
export class MessageService {
  constructor(
    @InjectQueue(MESSAGE_QUEUE_NAME) private readonly messageQueue: Queue,
  ) {}

  async saveMessage(messageDto: Message) {
    await this.messageQueue.add('save-message', {
      message: messageDto,
    });
  }
}
