import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule) },
    { path: 'search-options', loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule) },
    { path: 'history', loadChildren: () => import('./features/history/history.module').then(m => m.HistoryModule) },
    { path: 'prompts', loadChildren: () => import('./features/prompts/prompts.module').then(m => m.PromptsModule) },
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
