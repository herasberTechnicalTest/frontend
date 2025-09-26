import { Routes } from '@angular/router';
import {LoginComponent} from './auth/features/login/login';
import {RegisterComponent} from './auth/features/register/register';
import {ProfessionalsList} from './professional/features/list/professionals-list/professionals-list';
import {ProfessionalDetail} from './professional/features/detail/professional-detail/professional-detail';
import {authGuard} from './auth/core/guards/auth-guard';
import {ProfileEditor} from './professional/features/profile-editor/profile-editor/profile-editor';

export const routes: Routes = [
  { path: '', redirectTo: 'pros', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Login' },
  { path: 'register', component: RegisterComponent, title: 'Register' },
  { path: 'pros', component: ProfessionalsList, title: 'Profesionales' },
  { path: 'pros/:id', component: ProfessionalDetail, title: 'Perfil' },
  { path: 'me/profile', component: ProfileEditor, canActivate: [authGuard], title: 'Mi perfil' },
  { path: '**', redirectTo: 'pros' }
];
