import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LandingComponent } from './components/landing/landing.component';
const authGuard = () => {
  return localStorage.getItem('access_token')
    ? true
    : inject(Router).createUrlTree(['/login']);
};

export const routes: Routes = [
  { path: '',          component: LandingComponent },
  { path: 'login',     component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'my-assets',
    canActivate: [authGuard],
    loadComponent: () => import('./components/my-assets/my-assets.component').then(m => m.MyAssetsComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'my-history',
    canActivate: [authGuard],
    loadComponent: () => import('./components/user-history/user-history.component').then(m => m.UserHistoryComponent)
  },
  {
    path: 'history',
    canActivate: [authGuard],
    loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent)
  },
  {
    path: 'user/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./components/admin-user-profile/admin-user-profile.component').then(m => m.AdminUserProfileComponent)
  },
  { path: '**', redirectTo: 'login' }
];