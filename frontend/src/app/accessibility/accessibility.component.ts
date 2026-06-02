import {
  Component, inject, OnInit, OnDestroy, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityService } from './accessibility.service';

@Component({
  selector: 'app-accessibility',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accessibility.component.html',
  styleUrls: ['./accessibility.component.scss'],
})
export class AccessibilityComponent implements OnInit, OnDestroy {
  svc = inject(AccessibilityService);

  ngOnInit(): void {
    this.svc.init();
  }

  ngOnDestroy(): void {
    this.svc.resetAll();
  }

  // ─── Focus trap ─────────────────────────────────────────────────────────────
  @HostListener('keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.svc.panelOpen()) {
      this.svc.closePanel();
      const toggle = document.getElementById('acc-toggle') as HTMLElement | null;
      toggle?.focus();
      return;
    }

    if (e.key !== 'Tab' || !this.svc.panelOpen()) return;

    const panel = document.getElementById('acc-painel');
    if (!panel) return;

    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]),[href],input,[tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
