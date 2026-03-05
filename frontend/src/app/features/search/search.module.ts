import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SearchRoutingModule } from './search-routing.module';
import { SearchOptionsComponent } from './search-options.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [
        SearchOptionsComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SearchRoutingModule,
        SharedModule
    ]
})
export class SearchModule { }
