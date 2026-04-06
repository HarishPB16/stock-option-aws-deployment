import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { YoutubeComponent } from './youtube.component';

const routes: Routes = [
  { path: '', component: YoutubeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class YoutubeRoutingModule { }
