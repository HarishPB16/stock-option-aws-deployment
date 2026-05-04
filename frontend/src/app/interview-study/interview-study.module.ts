import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InterviewStudyRoutingModule } from './interview-study-routing.module';
import { MbdProjectComponent } from '../interviewStudy/mbd-project/mbd-project.component';

@NgModule({
  declarations: [
    MbdProjectComponent
  ],
  imports: [
    CommonModule,
    InterviewStudyRoutingModule
  ]
})
export class InterviewStudyModule { }
