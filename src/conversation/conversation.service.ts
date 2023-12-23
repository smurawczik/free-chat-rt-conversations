import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation } from './entities/conversation.entity';
import { ConversationMessage } from './entities/conversation.message.entity';
import { ConversationParticipant } from './entities/conversation.participant.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(ConversationParticipant)
    private conversationParticipantRepository: Repository<ConversationParticipant>,

    @InjectRepository(ConversationMessage)
    private conversationMessageRepository: Repository<ConversationMessage>,

    private readonly httpService: HttpService,
  ) {}

  private logger = new Logger('ConversationService');

  create(createConversationDto: CreateConversationDto) {
    console.log(createConversationDto);

    return 'This action adds a new conversation';
  }

  async findOrCreate(createConversationDto: CreateConversationDto) {
    try {
      const conversation = await this.conversationRepository
        .createQueryBuilder('conversation')
        .innerJoin('conversation.participants', 'participant')
        .where('participant.id IN (:...ids)', {
          ids: [
            createConversationDto.firstParticipant,
            createConversationDto.secondParticipant,
          ],
        })
        .groupBy('conversation.id')
        .having('COUNT(conversation.id) = :count', { count: 2 })
        .getOne();

      if (conversation) {
        this.logger.log('Conversation already exists');

        return this.conversationRepository.findOne({
          where: { id: conversation.id },
          relations: ['participants', 'messages'],
        });
      }

      const [{ data: user1 }, { data: user2 }] = await Promise.all([
        this.httpService.axiosRef.get<ConversationParticipant>(
          `/user/${createConversationDto.firstParticipant}`,
        ),
        this.httpService.axiosRef.get<ConversationParticipant>(
          `/user/${createConversationDto.secondParticipant}`,
        ),
      ]);

      const participant1 = this.conversationParticipantRepository.create({
        ...user1,
      });
      const participant2 = this.conversationParticipantRepository.create({
        ...user2,
      });
      const [savedParticipant1, savedParticipant2] =
        await this.conversationParticipantRepository.save([
          participant1,
          participant2,
        ]);

      const newConversation = this.conversationRepository.create();
      newConversation.participants = [savedParticipant1, savedParticipant2];
      newConversation.messages = [];

      return this.conversationRepository.save(newConversation);
    } catch (error) {
      console.log({ error });

      throw new HttpException(
        'Error creating conversation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} conversation`;
  }
}
