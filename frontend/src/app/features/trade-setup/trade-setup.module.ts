import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradeSetupRoutingModule } from './trade-setup-routing.module';
import { TradeSetupComponent } from './trade-setup.component';

@NgModule({
  declarations: [
    TradeSetupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TradeSetupRoutingModule
  ]
})
export class TradeSetupModule { }
