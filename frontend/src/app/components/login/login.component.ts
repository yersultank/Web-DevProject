import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  // Импортируем FormsModule для работы ngModel и CommonModule для базовых функций
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Internal Asset Tracker</h2>
        <p>Please enter your credentials</p>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <input type="text" [(ngModel)]="loginData.username" name="username" 
                   placeholder="Username" required>
          </div>

          <div class="form-group">
            <input type="password" [(ngModel)]="loginData.password" name="password" 
                   placeholder="Password" required>
          </div>

          <div class="form-group">
            <input type="text" [(ngModel)]="loginData.branchCode" name="branch" 
                   placeholder="Branch Code (e.g. KBTU-01)">
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="loginData.remember" name="remember"> 
              Remember this device
            </label>
          </div>

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Logging in...' : 'Sign In' }}
          </button>
        </form>

        @if (errorMessage) {
          <div class="error-message">
            {{ errorMessage }}
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f4f7f6; font-family: sans-serif; }
    .login-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 320px; }
    .form-group { margin-bottom: 1rem; }
    input[type="text"], input[type="password"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; }
    .error-message { color: red; margin-top: 10px; font-size: 14px; text-align: center; }
  `]
})
export class LoginComponent {
  // Объект для сбора данных из 4 полей
  loginData = {
    username: '',
    password: '',
    branchCode: '',
    remember: false
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  onLogin() {
    this.loading = true;
    this.errorMessage = '';

    // Вызов сервиса (APIs via services)
    this.authService.login({
      username: this.loginData.username,
      password: this.loginData.password
    }).subscribe({
      next: () => {
        this.loading = false;
        // После успеха идем в Dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        // Детальная обработка ошибок (Handle API errors)
        if (err.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else if (err.status === 0) {
          this.errorMessage = 'Server is unreachable. Is Django running?';
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
      }
    });
  }
}