import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PromptsRoutingModule } from './prompts-routing.module';
import { PromptsComponent } from './prompts.component';
import { SubMenuComponent } from './components/sub-menu/sub-menu.component';
import { StudyComponent } from './components/study/study.component';
import { IqComponent } from './components/iq/iq.component';
import { YoutubeAdminComponent } from './components/youtube-admin/youtube-admin.component';

@NgModule({
  declarations: [
    PromptsComponent,
    SubMenuComponent,
    StudyComponent,
    IqComponent,
    YoutubeAdminComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PromptsRoutingModule
  ]
})
export class PromptsModule { }
