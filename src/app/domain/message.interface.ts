import { MessageAuthor } from './message-author.enum';

export interface IMessage {
  time: number
  text: string;
  author: MessageAuthor;
}
