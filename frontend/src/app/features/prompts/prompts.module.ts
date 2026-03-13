import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PromptsRoutingModule } from './prompts-routing.module';
import { PromptsComponent } from './prompts.component';


@NgModule({
  declarations: [
    PromptsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PromptsRoutingModule
  ]
})
export class PromptsModule { }
