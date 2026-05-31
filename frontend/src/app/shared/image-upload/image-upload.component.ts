import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div>
      <div class="relative group cursor-pointer"
           (click)="fileInput.click()"
           (dragover)="$event.preventDefault()"
           (drop)="onDrop($event)">

        <div [class]="containerClass"
             class="bg-gray-100 border-2 border-dashed border-gray-300
                    group-hover:border-[#0054A6] overflow-hidden transition-colors
                    flex items-center justify-center relative">

          <!-- Preview da imagem -->
          <img *ngIf="displayUrl()" [src]="displayUrl()!"
               alt="Preview" class="w-full h-full object-cover absolute inset-0">

          <!-- Placeholder -->
          <div *ngIf="!displayUrl()" class="text-center p-4 z-10">
            <mat-icon class="text-gray-400" style="font-size:40px;height:40px;width:40px">add_photo_alternate</mat-icon>
            <p class="text-gray-400 text-xs mt-1 leading-tight">{{ placeholder }}</p>
          </div>

          <!-- Overlay de hover -->
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                      transition-opacity flex items-center justify-center z-20">
            <mat-icon class="text-white">edit</mat-icon>
          </div>

          <!-- Spinner de upload -->
          <div *ngIf="loading" class="absolute inset-0 bg-white/80 flex items-center justify-center z-30">
            <mat-spinner diameter="32"></mat-spinner>
          </div>
        </div>
      </div>

      <p *ngIf="erro()" class="text-red-500 text-xs mt-1.5">{{ erro() }}</p>

      <input #fileInput type="file" accept="image/jpeg,image/png,image/webp"
             class="hidden" (change)="onFileChange($event)">
    </div>
  `
})
export class ImageUploadComponent {
  @Input() currentUrl: string | null | undefined = null;
  @Input() placeholder = 'Clique ou arraste uma imagem';
  @Input() shape: 'circle' | 'rect' = 'rect';
  @Input() loading = false;
  @Output() fileSelected = new EventEmitter<File>();

  private localPreview = signal<string | null>(null);
  erro = signal<string | null>(null);

  private readonly MAX_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

  get containerClass(): string {
    return this.shape === 'circle'
      ? 'w-24 h-24 rounded-full'
      : 'w-full h-48 rounded-xl';
  }

  displayUrl(): string | null {
    return this.localPreview() ?? this.currentUrl ?? null;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processar(file);
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processar(file);
  }

  private processar(file: File) {
    this.erro.set(null);
    if (!this.ALLOWED.includes(file.type)) {
      this.erro.set('Formato inválido. Use JPEG, PNG ou WebP.');
      return;
    }
    if (file.size > this.MAX_SIZE) {
      this.erro.set('Arquivo muito grande. Máximo 5MB.');
      return;
    }
    this.localPreview.set(URL.createObjectURL(file));
    this.fileSelected.emit(file);
  }
}
