import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromptsComponent } from './prompts.component';
import { YoutubeAdminComponent } from './components/youtube-admin/youtube-admin.component';

const routes: Routes = [
  { path: '', component: PromptsComponent },
  { path: 'youtube', component: YoutubeAdminComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromptsRoutingModule { }
