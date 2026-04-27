import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarketCalendarRoutingModule } from './market-calendar-routing.module';
import { MarketCalendarComponent } from './market-calendar.component';

@NgModule({
  declarations: [
    MarketCalendarComponent
  ],
  imports: [
    CommonModule,
    MarketCalendarRoutingModule
  ]
})
export class MarketCalendarModule { }
