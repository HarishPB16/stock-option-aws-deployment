import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromptsComponent } from './prompts.component';
import { YoutubeAdminComponent } from './components/youtube-admin/youtube-admin.component';
import { CategoryFormComponent } from './components/category-form/category-form.component';

const routes: Routes = [
  { path: '', component: PromptsComponent },
  { path: 'youtube', component: YoutubeAdminComponent },
  { path: 'category', component: CategoryFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromptsRoutingModule { }
