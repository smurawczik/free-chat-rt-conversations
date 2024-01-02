import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { Message } from './entities/message.entity';
import { MESSAGE_QUEUE_NAME } from './message.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Processor(MESSAGE_QUEUE_NAME)
export class MessageProcessor {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  private readonly logger = new Logger(MessageProcessor.name);

  @Process('save-message')
  handleTranscode(job: Job<{ message: Message }>) {
    try {
      this.logger.debug('saving message to database');
      this.messageRepository.save({
        id: job.data.message.id,
        message: job.data.message.message,
        timestamp: new Date(),
        conversation: job.data.message.conversation,
        sender: job.data.message.sender,
        audioPath: job.data.message.audioPath,
      });
      this.logger.debug('saving complete');
    } catch (error) {
      console.log(error);
    }
  }
}
