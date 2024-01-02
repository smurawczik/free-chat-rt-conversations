import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { createReadStream } from 'fs';
import { join } from 'path';
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

  @Post('audio')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return file.path;
  }

  @Post('file')
  getFile(@Body() { audioPath }: { audioPath: string }): StreamableFile {
    const file = createReadStream(join(process.cwd(), audioPath));
    return new StreamableFile(file);
  }
}
