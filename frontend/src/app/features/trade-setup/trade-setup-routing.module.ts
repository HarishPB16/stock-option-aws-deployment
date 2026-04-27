import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradeSetupComponent } from './trade-setup.component';

const routes: Routes = [
  { path: '', component: TradeSetupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradeSetupRoutingModule { }
