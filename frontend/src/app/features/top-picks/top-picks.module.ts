import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TopPicksComponent } from './top-picks.component';

const routes: Routes = [
  { path: '', component: TopPicksComponent }
];

@NgModule({
  declarations: [TopPicksComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class TopPicksModule { }
