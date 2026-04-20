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
/**
 * Handles user authentication form submission for the student demo application.
 */
export class LoginComponent {
  /** Controls whether the form is in Login or Sign Up mode. */
  isLoginMode = true;

  /** Form state bound to the login template controls. */
  loginData = {
    username: '',
    password: '',
    // branchCode removed as it lacks backend functionality
    remember: false
  };

  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  /**
   * Switches between Login and Sign Up modes and clears previous errors.
   */
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  /**
   * Sends credentials to the backend and routes to dashboard on success.
   */
  onLogin() {
    // Defense note: this line starts the loading state while waiting for API response.
    this.loading = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = {
      username: this.loginData.username,
      password: this.loginData.password
    };

    if (this.isLoginMode) {
      // --- LOGIN MODE ---
      // Defense note: all backend calls stay inside AuthService, not the component.
      this.authService.login(credentials).subscribe({
        next: () => {
          this.loading = false;
          // Defense note: successful login redirects user to dashboard screen.
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.handleError(err);
        }
      });
    } else {
      // --- SIGN UP MODE ---
      // Defense note: calls the registration method from AuthService.
      this.authService.register(credentials).subscribe({
        next: () => {
          this.loading = false;
          alert('Registration successful! You can now log in.');
          this.isLoginMode = true; // Switch back to login mode after success
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = 'Registration failed. User might already exist.';
          console.error('Registration error:', err);
        }
      });
    }
  }

  /**
   * Centralized error handling for backend communication issues.
   */
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