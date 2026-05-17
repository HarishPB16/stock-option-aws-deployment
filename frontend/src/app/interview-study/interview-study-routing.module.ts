import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MbdProjectComponent } from '../interviewStudy/mbd-project/mbd-project.component';
import { AngularStudyComponent } from '../interviewStudy/angular-study/angular-study.component';
import { AwsStudyComponent } from '../interviewStudy/aws-study/aws-study.component';
import { GitStudyComponent } from '../interviewStudy/git-study/git-study.component';
import { NodejsStudyComponent } from '../interviewStudy/nodejs-study/nodejs-study.component';
import { MongoDbStudyComponent } from '../interviewStudy/mongo-db-study/mongo-db-study.component';
import { PythonStudyComponent } from '../interviewStudy/python-study/python-study.component';
import { CiCdComponent } from '../interviewStudy/ci-cd/ci-cd.component';
import { PromptStudyComponent } from '../interviewStudy/prompt-study/prompt-study.component';
import { ReactStudyComponent } from '../interviewStudy/react-study/react-study.component';
import { SqlStudyComponent } from '../interviewStudy/sql-study/sql-study.component';
import { TypeScriptStudyComponent } from '../interviewStudy/type-script-study/type-script-study.component';

const routes: Routes = [
  { path: 'mbd-project', component: MbdProjectComponent },
  { path: 'angular-study', component: AngularStudyComponent },
  { path: 'aws-study', component: AwsStudyComponent },
  { path: 'git-study', component: GitStudyComponent },
  { path: 'nodejs-study', component: NodejsStudyComponent },
  { path: 'mongodb-study', component: MongoDbStudyComponent },
  { path: 'python-study', component: PythonStudyComponent },
  { path: 'cicd-study', component: CiCdComponent },
  { path: 'react-study', component: ReactStudyComponent },
  { path: 'sql-study', component: SqlStudyComponent },
  { path: 'typescript-study', component: TypeScriptStudyComponent },
  { path: 'git-study', component: GitStudyComponent },
  { path: 'nodejs-study', component: NodejsStudyComponent },
  { path: 'mongodb-study', component: MongoDbStudyComponent },
  { path: 'prompt-study', component: PromptStudyComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InterviewStudyRoutingModule { }
