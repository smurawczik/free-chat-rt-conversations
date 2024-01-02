import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MESSAGE_QUEUE_NAME } from './message.constants';
import { MessageController } from './message.controller';
import { MessageProcessor } from './message.processor';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    BullModule.registerQueue({
      name: MESSAGE_QUEUE_NAME,
    }),
    MulterModule.register({
      dest: './upload',
      storage: diskStorage({
        destination: './upload',
        filename: (req, file, cb) => {
          cb(
            null,
            `${Date.now()}-${file.originalname}.${
              file.mimetype.split('/')[1] ?? 'mp3'
            }`,
          );
        },
      }),
    }),
  ],
  controllers: [MessageController],
  providers: [MessageProcessor, MessageService],
  exports: [BullModule],
})
export class MessageModule {}
