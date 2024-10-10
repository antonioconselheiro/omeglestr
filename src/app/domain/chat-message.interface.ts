import { MessageAuthor } from './message-author.enum';

export interface ChatMessage {
  time: number
  text: string;
  author: MessageAuthor;
}
