import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MbdProjectComponent } from '../interviewStudy/mbd-project/mbd-project.component';

const routes: Routes = [
  { path: 'mbd-project', component: MbdProjectComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterviewStudyRoutingModule { }
