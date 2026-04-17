import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromptsComponent } from './prompts.component';
import { YoutubeAdminComponent } from './components/youtube-admin/youtube-admin.component';
import { CategoryFormComponent } from './components/category-form/category-form.component';
import { GamesAdminComponent } from './components/games-admin/games-admin.component';
import { OptionCalculatorComponent } from './components/option-calculator/option-calculator.component';

const routes: Routes = [
  { path: '', component: PromptsComponent },
  { path: 'youtube', component: YoutubeAdminComponent },
  { path: 'category', component: CategoryFormComponent },
  { path: 'games', component: GamesAdminComponent },
  { path: 'calculator', component: OptionCalculatorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromptsRoutingModule { }
