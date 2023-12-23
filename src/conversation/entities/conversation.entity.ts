// Conversation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ConversationParticipant } from './conversation.participant.entity';
import { ConversationMessage } from './conversation.message.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => ConversationParticipant)
  @JoinTable({ name: 'conversation_participants' })
  participants: ConversationParticipant[];

  @OneToMany(() => ConversationMessage, (message) => message.conversation)
  @JoinColumn({ name: 'messages' })
  messages: ConversationMessage[];
}
