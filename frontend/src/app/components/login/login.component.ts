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
  /** Form state bound to the login template controls. */
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

    // Defense note: all backend calls stay inside AuthService, not the component.
    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        // Defense note: successful login redirects user to dashboard screen.
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
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