import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MbdProjectComponent } from '../interviewStudy/mbd-project/mbd-project.component';
import { AngularStudyComponent } from '../interviewStudy/angular-study/angular-study.component';

const routes: Routes = [
  { path: 'mbd-project', component: MbdProjectComponent },
  { path: 'angular-study', component: AngularStudyComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterviewStudyRoutingModule { }
