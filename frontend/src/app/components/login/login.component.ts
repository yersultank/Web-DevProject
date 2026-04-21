import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginCredentials } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  isLoginMode = true;

  loginData = {
    username: '',
    password: '',
    remember: false
  };

  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  onLogin() {
    this.loading = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = {
      username: this.loginData.username,
      password: this.loginData.password
    };

    if (this.isLoginMode) {
      this.authService.login(credentials).subscribe({
        next: (res) => {
          this.loading = false;
          this.router.navigate([res.user.is_staff ? '/dashboard' : '/my-assets']);
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    } else {
      this.authService.register(credentials).subscribe({
        next: () => {
          this.loading = false;
          alert('Registration successful! You can now log in.');
          this.isLoginMode = true;
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Registration failed. User might already exist.';
          console.error('Registration error:', err);
        }
      });
    }
  }

  private handleError(err: any) {
    if (err.status === 401) {
      this.errorMessage = 'Invalid username or password.';
    } else if (err.status === 0) {
      this.errorMessage = 'Server is unreachable. Is Django running?';
    } else {
      this.errorMessage = 'An unexpected error occurred.';
    }
  }
}