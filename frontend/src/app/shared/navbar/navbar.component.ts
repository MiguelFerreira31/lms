import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar color="primary">
      <span routerLink="/dashboard" style="cursor:pointer">LMS Lite</span>
      <span class="spacer"></span>
      <button mat-button routerLink="/cursos"><mat-icon>school</mat-icon> Cursos</button>
      <button mat-button routerLink="/matriculas"><mat-icon>assignment</mat-icon> Minhas Matrículas</button>
      <button mat-button routerLink="/admin/cursos" *ngIf="auth.isAdmin()">
        <mat-icon>admin_panel_settings</mat-icon> Admin
      </button>
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item disabled>{{ auth.currentUser()?.nome }}</button>
        <button mat-menu-item (click)="auth.logout()"><mat-icon>logout</mat-icon> Sair</button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: ['.spacer { flex: 1 1 auto; }']
})
export class NavbarComponent {
  auth = inject(AuthService);
}
