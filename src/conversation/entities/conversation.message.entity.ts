// Message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ConversationParticipant } from './conversation.participant.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class ConversationMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: string;

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
