import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'options', pathMatch: 'full' },
    { path: 'options', loadChildren: () => import('./features/options/options.module').then(m => m.OptionsModule) },
    { path: '**', redirectTo: 'options' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
