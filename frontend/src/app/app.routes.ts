import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
// 1. Импортируй компонент (убедись, что ты его создал через ng generate)
import {DashboardComponent} from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // 2. Добавь эту строку:
  { path: 'dashboard', component: DashboardComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // 3. (Опционально) Добавь "заглушку" для несуществующих страниц
  { path: '**', redirectTo: 'login' } 
];