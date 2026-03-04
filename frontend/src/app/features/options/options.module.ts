import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { OptionsRoutingModule } from './options-routing.module';
import { OptionsComponent } from './options.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [
        OptionsComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        OptionsRoutingModule,
        SharedModule
    ]
})
export class OptionsModule { }
