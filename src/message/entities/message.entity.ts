// Message.entity.ts
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { ConversationParticipant } from 'src/conversation/entities/conversation.participant.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  timestamp: Date;

  @ManyToOne(
    () => ConversationParticipant,
    (participant) => participant.messages,
  )
  @JoinColumn({ name: 'senderId' })
  sender: ConversationParticipant;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  message: string;
}
