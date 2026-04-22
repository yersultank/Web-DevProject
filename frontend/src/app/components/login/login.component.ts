import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  isLoginMode = true;
  loading     = false;
  errorMsg    = '';
  successMsg  = '';

  // Shared between login and register
  username = '';
  password = '';

  // Register-only fields
  full_name      = '';
  phone          = '';
  department     = '';
  position       = '';
  office_address = '';

  constructor(private authService: AuthService, private router: Router) {}

  switchToLogin(): void {
    this.isLoginMode = true;
    this.errorMsg    = '';
    this.successMsg  = '';
  }

  switchToRegister(): void {
    this.isLoginMode = false;
    this.errorMsg    = '';
    this.successMsg  = '';
  }

  onSubmit(): void {
    this.isLoginMode ? this.login() : this.register();
  }

  private login(): void {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMsg = 'Please enter username and password.';
      return;
    }
    this.loading  = true;
    this.errorMsg = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: res => {
        this.loading = false;
        this.router.navigate([res.user.is_staff ? '/dashboard' : '/my-assets']);
      },
      error: err => {
        this.loading = false;
        if (err.status === 401) {
          this.errorMsg = 'Invalid username or password.';
        } else if (err.status === 0) {
          this.errorMsg = 'Cannot reach server. Is Django running?';
        } else {
          this.errorMsg = 'Login failed. Please try again.';
        }
      }
    });
  }

  private register(): void {
    if (!this.username.trim() || !this.password.trim() ||
        !this.full_name.trim() || !this.phone.trim() ||
        !this.department.trim() || !this.position.trim() || !this.office_address.trim()) {
      this.errorMsg = 'Please fill in all fields.';
      return;
    }

    this.loading  = true;
    this.errorMsg = '';

    const payload = {
      username:       this.username.trim(),
      password:       this.password.trim(),
      full_name:      this.full_name.trim(),
      phone:          this.phone.trim(),
      department:     this.department.trim(),
      position:       this.position.trim(),
      office_address: this.office_address.trim(),
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'Account created! You can now sign in.';
        // Keep username, clear the rest so user just hits Sign In
        this.password = '';
        this.full_name = this.phone = this.department = this.position = this.office_address = '';
        setTimeout(() => { this.isLoginMode = true; this.successMsg = ''; }, 1800);
      },
      error: err => {
        this.loading = false;
        if (err.status === 400 && err.error) {
          // Show the first field-level error from the server
          const firstKey = Object.keys(err.error)[0];
          const msg = err.error[firstKey];
          this.errorMsg = Array.isArray(msg) ? msg[0] : String(msg);
        } else {
          this.errorMsg = 'Registration failed. Try again later.';
        }
      }
    });
  }
}
