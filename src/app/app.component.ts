import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorMessagesObservable } from '@shared/error-handling/error-messages.observable';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();

  constructor(
    private error$: ErrorMessagesObservable,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.error$.subscribe(message => this.toastrService.error(message)));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
