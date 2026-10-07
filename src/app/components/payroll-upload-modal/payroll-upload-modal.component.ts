import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkerPersona } from '../../models/subcontractor.model';
import { SubcontractorService } from '../../services/subcontractor.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-payroll-upload-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 680px; background: #ffffff; color: #0f172a;">
        <!-- Header -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #f0f9ff; border: 1px solid #bae6fd; display: flex; align-items: center; justify-content: center; color: #0284c7;">
              <app-icon name="upload-cloud" [size]="22"></app-icon>
            </div>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a;">Taşeron Personel Bordro Yükleme</h3>
              <p style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">
                PDF Bordro Belgesini yükleyin &bull; AI OCR & SAP Çapraz Denetimi otomatik çalışır
              </p>
            </div>
          </div>
          <button (click)="close()" style="background: transparent; border: none; color: #64748b; cursor: pointer; padding: 6px;">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Body -->
        <div style="padding: 24px; display: flex; flex-direction: column; gap: 18px;">
          <!-- 1. Kişi ve Dönem Seçimi -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                Taşeron Çalışanı Seçin:
              </label>
              <select [(ngModel)]="selectedWorkerId" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.85rem; outline: none;">
                <option *ngFor="let worker of workers" [value]="worker.id">
                  {{ worker.fullName }} ({{ worker.subcontractorName.split(' ')[0] }})
                </option>
              </select>
            </div>

            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                Bordro Dönemi:
              </label>
              <select [(ngModel)]="period" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.85rem; outline: none;">
                <option value="2026 / 10">Ekim 2026</option>
                <option value="2026 / 09">Eylül 2026</option>
                <option value="2026 / 08">Ağustos 2026</option>
              </select>
            </div>
          </div>

          <!-- 2. Belge Alanı -->
          <div style="border: 2px dashed #93c5fd; border-radius: 12px; padding: 24px 20px; text-align: center; background: #f0f9ff; position: relative; overflow: hidden;">
            <div *ngIf="isAnalyzing" class="ai-scan-line"></div>
            
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
              <div style="width: 50px; height: 50px; border-radius: 9999px; background: #e0f2fe; display: flex; align-items: center; justify-content: center; color: #0284c7;">
                <app-icon name="file-text" [size]="24"></app-icon>
              </div>
              <div>
                <p style="font-size: 0.92rem; font-weight: 700; color: #0f172a;">{{ fileName }}</p>
                <p style="font-size: 0.78rem; color: #64748b; margin-top: 4px;">PDF, e-Bordro veya Taranmış Resmi Bordro Belgesi (Maks: 15 MB)</p>
              </div>
              <span class="badge badge-blue">
                <app-icon name="sparkles" [size]="12"></app-icon>
                AI OCR & Barkod Doğrulama Aktif
              </span>
            </div>
          </div>

          <!-- 3. AI Simülasyon Test Senaryosu Seçimi -->
          <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <label style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; font-weight: 700; margin-bottom: 8px; display: block;">
              Hızlı Test Senaryosu (AI OCR Parametreleri):
            </label>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 6px 10px;" (click)="setPreset('makas')">
                <app-icon name="alert-triangle" [size]="13" customClass="text-rose-600"></app-icon>
                Yüksek Makas (%28 Kesinti)
              </button>
              <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 6px 10px;" (click)="setPreset('eksik-mesai')">
                <app-icon name="clock" [size]="13" customClass="text-amber-600"></app-icon>
                Eksik Fazla Mesai (18 Saat Gasp)
              </button>
              <button type="button" class="btn-secondary" style="font-size: 0.78rem; padding: 6px 10px;" (click)="setPreset('uyumlu')">
                <app-icon name="check-circle" [size]="13" customClass="text-emerald-600"></app-icon>
                Uyumlu Bordro (Eksiksiz)
              </button>
            </div>
          </div>

          <!-- 4. Taranacak Net Maaş ve Mesai Girdileri -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                Bordrodaki Net Ücret Tutarı (₺):
              </label>
              <input type="number" [(ngModel)]="netPay" style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.95rem; font-family: var(--font-mono); outline: none;" placeholder="38000">
              <span style="font-size: 0.72rem; color: #64748b; margin-top: 3px; display: block;">Banka hesabına yatan net tutar</span>
            </div>

            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                Bordroda Ödenen Fazla Mesai (Saat):
              </label>
              <input type="number" [(ngModel)]="overtimeHours" style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.95rem; font-family: var(--font-mono); outline: none;" placeholder="0">
              <span style="font-size: 0.72rem; color: #64748b; margin-top: 3px; display: block;">Bordro tahakkuk satırı</span>
            </div>
          </div>

          <!-- Yükleme Durum Mesajı -->
          <div *ngIf="isAnalyzing" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; gap: 12px;">
            <app-icon name="brain" [size]="20" customClass="text-sky-600"></app-icon>
            <div>
              <p style="font-size: 0.82rem; font-weight: 700; color: #1e40af;">Yapay Zeka OCR ve SAP Karşılaştırması Yapılıyor...</p>
              <p style="font-size: 0.75rem; color: #475569;">Bordro PDF metinleri taranıyor, PDKS kayıtları ve SAP hakediş bütçesi çapraz karşılaştırılıyor.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: flex-end; gap: 12px; background: #f8fafc;">
          <button class="btn-secondary" (click)="close()" [disabled]="isAnalyzing">
            Vazgeç
          </button>
          <button class="btn-primary" (click)="uploadAndAnalyze()" [disabled]="isAnalyzing">
            <app-icon name="sparkles" [size]="16"></app-icon>
            {{ isAnalyzing ? 'AI Taraması Sürüyor...' : 'Bordroyu Yükle & AI ile Analiz Et' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class PayrollUploadModalComponent {
  @Input() workers: WorkerPersona[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() uploaded = new EventEmitter<void>();

  selectedWorkerId: string = '';
  period: string = '2026 / 10';
  fileName: string = 'taseron_resmi_bordro_2026_10.pdf';
  netPay: number = 38500;
  overtimeHours: number = 6.0;
  isAnalyzing: boolean = false;

  constructor(private subService: SubcontractorService) {
    if (this.workers.length > 0) {
      this.selectedWorkerId = this.workers[0].id;
    }
  }

  ngOnInit(): void {
    if (!this.selectedWorkerId && this.workers.length > 0) {
      this.selectedWorkerId = this.workers[0].id;
    }
  }

  setPreset(preset: 'makas' | 'eksik-mesai' | 'uyumlu'): void {
    if (preset === 'makas') {
      this.netPay = 37000;
      this.overtimeHours = 4.0;
      this.fileName = 'taseron_bordro_dusuk_maas_makas.pdf';
    } else if (preset === 'eksik-mesai') {
      this.netPay = 44000;
      this.overtimeHours = 0.0;
      this.fileName = 'taseron_bordro_sifir_mesai.pdf';
    } else {
      this.netPay = 48500;
      this.overtimeHours = 18.0;
      this.fileName = 'taseron_bordro_tam_uyumlu.pdf';
    }
  }

  uploadAndAnalyze(): void {
    if (!this.selectedWorkerId) return;
    this.isAnalyzing = true;

    this.subService.analyzeAndAddPayroll(
      this.selectedWorkerId,
      this.period,
      this.fileName,
      this.netPay,
      this.overtimeHours
    ).subscribe({
      next: () => {
        this.isAnalyzing = false;
        this.uploaded.emit();
        this.close();
      },
      error: () => {
        this.isAnalyzing = false;
      }
    });
  }

  close(): void {
    this.closed.emit();
  }
}
