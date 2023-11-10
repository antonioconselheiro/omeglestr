import { MessageAuthor } from './message-author.enum';

export interface IMessage {
  time: number
  message: string;
  from: MessageAuthor;
}
