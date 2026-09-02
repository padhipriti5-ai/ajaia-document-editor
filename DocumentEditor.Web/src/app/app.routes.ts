import { Routes } from '@angular/router';
import { SharedDocumentComponent } from './shared-document/shared-document.component';

export const routes: Routes = [
    {
        path: 'shared/:token',
        component: SharedDocumentComponent
    }
];