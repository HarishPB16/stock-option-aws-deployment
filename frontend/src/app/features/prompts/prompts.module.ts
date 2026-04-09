import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PromptsRoutingModule } from './prompts-routing.module';
import { PromptsComponent } from './prompts.component';
import { SubMenuComponent } from './components/sub-menu/sub-menu.component';
import { StudyComponent } from './components/study/study.component';
import { IqComponent } from './components/iq/iq.component';
import { YoutubeAdminComponent } from './components/youtube-admin/youtube-admin.component';
import { CategoryFormComponent } from './components/category-form/category-form.component';

import { GamesAdminComponent } from './components/games-admin/games-admin.component';
import { ContentAdminComponent } from './components/content-admin/content-admin.component';

@NgModule({
  declarations: [
    PromptsComponent,
    SubMenuComponent,
    StudyComponent,
    IqComponent,
    YoutubeAdminComponent,
    CategoryFormComponent,
    GamesAdminComponent,
    ContentAdminComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    PromptsRoutingModule
  ]
})
export class PromptsModule { }
