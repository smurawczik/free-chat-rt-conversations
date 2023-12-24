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
import { Message } from 'src/message/entities/message.entity';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => ConversationParticipant)
  @JoinTable({ name: 'conversation_has_participants' })
  participants: ConversationParticipant[];

  @OneToMany(() => Message, (message) => message.conversation)
  @JoinColumn({ name: 'messages' })
  messages: Message[];
}
