import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionStockDetailComponent } from './components/option-stock-detail/option-stock-detail.component';

@NgModule({
    declarations: [
        OptionStockDetailComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        OptionStockDetailComponent
    ]
})
export class SharedModule { }
