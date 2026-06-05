import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatSnackBarModule, MatTabsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snack = inject(MatSnackBar);

  loginForm = this.fb.group({ email: ['', [Validators.required, Validators.email]], senha: ['', Validators.required] });
  registerForm = this.fb.group({ nome: ['', Validators.required], email: ['', [Validators.required, Validators.email]], senha: ['', [Validators.required, Validators.minLength(6)]] });
  loading = false;
  year = new Date().getFullYear();

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
    this.auth.login(this.loginForm.value as any).subscribe({
      next: () => this.router.navigateByUrl(returnUrl),
      error: () => { this.snack.open('Email ou senha inválidos', 'Fechar', { duration: 3000 }); this.loading = false; }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.auth.register(this.registerForm.value as any).subscribe({
      next: () => { this.snack.open('Conta criada! Faça login.', 'OK', { duration: 3000 }); this.loading = false; },
      error: () => { this.snack.open('Erro ao criar conta', 'Fechar', { duration: 3000 }); this.loading = false; }
    });
  }
}
