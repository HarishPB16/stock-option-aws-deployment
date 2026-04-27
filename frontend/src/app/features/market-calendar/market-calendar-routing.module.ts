import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketCalendarComponent } from './market-calendar.component';

const routes: Routes = [
  { path: '', component: MarketCalendarComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketCalendarRoutingModule { }
