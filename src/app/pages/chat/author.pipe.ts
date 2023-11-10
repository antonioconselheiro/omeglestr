import { Pipe, PipeTransform } from '@angular/core';
import { MessageAuthor } from 'src/app/domain/message-author.enum';

@Pipe({
  name: 'author'
})
export class AuthorPipe implements PipeTransform {

  authorTypes: {
    [key in MessageAuthor]: string
  } = {
    [MessageAuthor.STRANGE]: 'Stranger',
    [MessageAuthor.YOU]: 'You'
  };

  transform(value: MessageAuthor): string {
    return this.authorTypes[value];
  }

}
