import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchOptionsComponent } from './search-options.component';

const routes: Routes = [
    { path: '', component: SearchOptionsComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SearchRoutingModule { }
