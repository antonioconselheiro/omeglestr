import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './pages/chat/chat.component';

const routes: Routes = [
  {
    path: 'chat',
    component: ChatComponent
  },

  {
    path: '',
    redirectTo: 'chat',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: !!import.meta.env.NG_APP_USE_HASH })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
