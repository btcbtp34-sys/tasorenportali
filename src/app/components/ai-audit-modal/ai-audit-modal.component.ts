import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollAudit } from '../../models/subcontractor.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-ai-audit-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="modal-overlay" *ngIf="audit" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 960px; background: #ffffff; color: #0f172a;">
        <!-- Header -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 46px; height: 46px; border-radius: 10px; background: #f0f9ff; border: 1px solid #bae6fd; display: flex; align-items: center; justify-content: center; color: #0284c7;">
              <app-icon name="brain" [size]="24"></app-icon>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <h3 style="font-size: 1.2rem; font-weight: 700; color: #0f172a;">AI Bordro & Hakediş Çapraz Denetim Raporu</h3>
                <span class="badge" [ngClass]="{
                  'badge-rose': audit.marginRiskLevel === 'HIGH_RISK_CUT',
                  'badge-amber': audit.marginRiskLevel === 'ELEVATED',
                  'badge-emerald': audit.marginRiskLevel === 'NORMAL'
                }">
                  <app-icon [name]="audit.marginRiskLevel === 'HIGH_RISK_CUT' ? 'alert-triangle' : (audit.marginRiskLevel === 'ELEVATED' ? 'clock' : 'check-circle')" [size]="12"></app-icon>
                  {{ audit.marginRiskLevel === 'HIGH_RISK_CUT' ? 'Yüksek Makas / Kırım Riski' : (audit.marginRiskLevel === 'ELEVATED' ? 'İnceleme Gerektirir' : 'Sözleşme ile Uyumlu') }}
                </span>
              </div>
              <p style="font-size: 0.84rem; color: #64748b; margin-top: 3px;">
                Çalışan: <strong style="color: #0f172a;">{{ audit.workerName }}</strong> ({{ audit.tcNumber }}) &bull; Taşeron: <span style="color: #0284c7; font-weight: 600;">{{ audit.subcontractorName }}</span> &bull; Dönem: {{ audit.period }}
              </p>
            </div>
          </div>
          <button (click)="close()" style="background: transparent; border: none; color: #64748b; cursor: pointer; padding: 6px;">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Body -->
        <div style="padding: 24px; display: flex; flex-direction: column; gap: 22px;">

          <!-- 1. HAKEDİŞ VS TAŞERON MAAŞ MAKAS ÇÖZÜMLEMESİ (100 veriyorum, 80 veriyor şartı) -->
          <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                <app-icon name="scale" [size]="18" customClass="text-sky-600"></app-icon>
                Finansal Hakediş & Bordro Karşılaştırması
              </h4>
              <span style="font-size: 0.8rem; color: #64748b;">
                AI OCR Güven Skoru: <strong style="color: #059669;">%{{ audit.ocrConfidence }}</strong>
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
              <!-- Ana Firma SAP Hak Edişi -->
              <div style="background: #ffffff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 0.72rem; text-transform: uppercase; color: #1e40af; font-weight: 800; letter-spacing: 0.05em;">ANA FİRMA HAKEDİŞ (SAP)</span>
                  <span class="badge badge-blue font-mono-numbers">100 Birim</span>
                </div>
                <div class="font-mono-numbers" style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin-top: 8px;">
                  {{ audit.sapAgreedRate.toLocaleString('tr-TR') }} ₺
                </div>
                <p style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
                  Ana firmanın taşerona işçi adına tahsis ettiği birim hakediş maliyeti.
                </p>
              </div>

              <!-- Taşeronun Personele Yatırdığı Net Ücret -->
              <div style="background: #ffffff; border: 1px solid #fecdd3; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 0.72rem; text-transform: uppercase; color: #be123c; font-weight: 800; letter-spacing: 0.05em;">TAŞERON NET ÖDEME (AI OCR)</span>
                  <span class="badge font-mono-numbers" [ngClass]="audit.spreadPercentage > 15 ? 'badge-rose' : 'badge-emerald'">
                    {{ (100 - audit.spreadPercentage).toFixed(1) }} Birim
                  </span>
                </div>
                <div class="font-mono-numbers" style="font-size: 1.6rem; font-weight: 800; color: #e11d48; margin-top: 8px;">
                  {{ audit.aiExtractedNetPay.toLocaleString('tr-TR') }} ₺
                </div>
                <p style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
                  Yüklenen resmi bordrodan taranan net banka transfer tutarı.
                </p>
              </div>

              <!-- Makas / Kesinti / Kırım Tutarı -->
              <div style="background: #ffffff; border: 1px solid #fde68a; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-size: 0.72rem; text-transform: uppercase; color: #b45309; font-weight: 800; letter-spacing: 0.05em;">MAKAS & KIRIM FARKI</span>
                  <span class="badge badge-amber font-mono-numbers">-%{{ audit.spreadPercentage }}</span>
                </div>
                <div class="font-mono-numbers" style="font-size: 1.6rem; font-weight: 800; color: #d97706; margin-top: 8px;">
                  -{{ audit.spreadAmount.toLocaleString('tr-TR') }} ₺
                </div>
                <p style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">
                  Taşeron firma kesintisi / işçi aleyhine oluşan makas.
                </p>
              </div>
            </div>

            <!-- Görsel İlerleme Çubuğu -->
            <div style="margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px;">
                <span style="color: #475569;">Personele Yansıyan Net Pay: <strong style="color: #0284c7;">%{{ (100 - audit.spreadPercentage).toFixed(1) }}</strong></span>
                <span style="color: #e11d48;">Taşeron Marjı: <strong>%{{ audit.spreadPercentage }}</strong> (Sözleşme Limiti: Maksimum %15)</span>
              </div>
              <div style="height: 10px; border-radius: 9999px; background: #e2e8f0; overflow: hidden; display: flex;">
                <div [style.width.%]="100 - audit.spreadPercentage" style="background: linear-gradient(90deg, #0284c7, #38bdf8);"></div>
                <div [style.width.%]="audit.spreadPercentage" [style.background]="audit.spreadPercentage > 15 ? '#e11d48' : '#d97706'"></div>
              </div>
            </div>
          </div>

          <!-- 2. FAZLA MESAİ (PDKS VS BORDRO) ÇAPRAZ DENETİMİ -->
          <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                <app-icon name="clock" [size]="18" customClass="text-amber-600"></app-icon>
                Fazla Mesai Doğrulama (PDKS Turnike Kaydı vs. Bordro Tahakkuku)
              </h4>
              <span class="badge" [ngClass]="{
                'badge-emerald': audit.overtimeCompliance === 'COMPLIANT',
                'badge-rose': audit.overtimeCompliance === 'UNPAID',
                'badge-amber': audit.overtimeCompliance === 'PARTIAL_PAID'
              }">
                {{ audit.overtimeCompliance === 'COMPLIANT' ? 'Mesai Tam Ödendi' : (audit.overtimeCompliance === 'PARTIAL_PAID' ? 'Kısmi Ödendi / Eksik Var' : 'Fazla Mesai Gaspı / Hiç Ödenmedi') }}
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
              <div style="padding: 12px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 600;">PDKS Turnike Mesaisi</span>
                <p class="font-mono-numbers" style="font-size: 1.25rem; font-weight: 800; color: #0284c7; margin-top: 4px;">
                  {{ audit.pdksRecordedOvertimeHours }} Saat
                </p>
                <span style="font-size: 0.72rem; color: #64748b;">Turnike kayıtlarından teyitli</span>
              </div>

              <div style="padding: 12px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Bordroda Ödenen Mesai</span>
                <p class="font-mono-numbers" style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-top: 4px;">
                  {{ audit.payrollPaidOvertimeHours }} Saat
                </p>
                <span style="font-size: 0.72rem; color: #64748b;">Taşeronun bildirdiği</span>
              </div>

              <div style="padding: 12px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Eksik Kalan Mesai</span>
                <p class="font-mono-numbers" style="font-size: 1.25rem; font-weight: 800;" [style.color]="audit.missingOvertimeHours > 0 ? '#e11d48' : '#059669'" style="margin-top: 4px;">
                  {{ audit.missingOvertimeHours }} Saat
                </p>
                <span style="font-size: 0.72rem; color: #64748b;">Tahakkuk ettirilmemiş</span>
              </div>

              <div style="padding: 12px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="font-size: 0.72rem; color: #64748b; text-transform: uppercase; font-weight: 600;">Tahmini İşçi Hak Kaybı</span>
                <p class="font-mono-numbers" style="font-size: 1.25rem; font-weight: 800; color: #e11d48; margin-top: 4px;">
                  {{ audit.missingOvertimeAmountEst.toLocaleString('tr-TR') }} ₺
                </p>
                <span style="font-size: 0.72rem; color: #64748b;">(Saatlik x 1.5 Katsayı)</span>
              </div>
            </div>
          </div>

          <!-- 3. AI OCR DİJİTAL BELGE KANITI & KUTUCUKLARI -->
          <div style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 0.82rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                <app-icon name="file-text" [size]="16" customClass="text-sky-600"></app-icon>
                AI OCR Ayrıştırılan Veri Blokları (Dosya: {{ audit.payrollFileName }})
              </span>
              <span style="font-size: 0.75rem; color: #64748b;">Yükleme Zamanı: {{ audit.uploadDate }}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;">
              <div style="padding: 10px; background: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0; border-left: 3px solid #0284c7;">
                <span style="font-size: 0.7rem; color: #64748b; font-weight: 600;">OCR Net Ücret Alanı:</span>
                <p class="font-mono-numbers" style="font-size: 0.82rem; color: #0f172a; margin-top: 2px;">{{ audit.ocrBoundingBoxes?.netPayBox }}</p>
              </div>
              <div style="padding: 10px; background: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0; border-left: 3px solid #d97706;">
                <span style="font-size: 0.7rem; color: #64748b; font-weight: 600;">OCR Fazla Mesai Alanı:</span>
                <p class="font-mono-numbers" style="font-size: 0.82rem; color: #0f172a; margin-top: 2px;">{{ audit.ocrBoundingBoxes?.overtimeBox }}</p>
              </div>
              <div style="padding: 10px; background: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0; border-left: 3px solid #059669;">
                <span style="font-size: 0.7rem; color: #64748b; font-weight: 600;">Banka Havale Doğrulama:</span>
                <p class="font-mono-numbers" style="font-size: 0.82rem; color: #0f172a; margin-top: 2px;">{{ audit.ocrBoundingBoxes?.ibanBox }}</p>
              </div>
            </div>
            <div *ngIf="audit.auditNotes" style="margin-top: 12px; font-size: 0.82rem; color: #0369a1; background: #f0f9ff; padding: 10px 14px; border-radius: 6px; border: 1px solid #bae6fd;">
              <strong style="color: #0284c7;">Denetçi / Sistem Notu:</strong> {{ audit.auditNotes }}
            </div>
          </div>
        </div>

        <!-- Footer / Aksiyonlar (YENİLENMİŞ, NET VE ŞIK BUTONLAR) -->
        <div style="padding: 18px 24px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; gap: 16px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.84rem; font-weight: 600; color: #475569;">Mevcut Denetim Durumu:</span>
            <span class="badge" [ngClass]="{
              'badge-rose': audit.auditStatus === 'UYUSMAZLIK_IHTAR',
              'badge-amber': audit.auditStatus === 'IK_INCELEMEDE',
              'badge-emerald': audit.auditStatus === 'ONAYLANDI'
            }" style="padding: 5px 12px; font-size: 0.8rem;">
              {{ audit.auditStatus === 'UYUSMAZLIK_IHTAR' ? 'İhtarname Düzenlendi' : (audit.auditStatus === 'IK_INCELEMEDE' ? 'İK İncelemesinde' : 'Bordro Onaylandı') }}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn-danger" (click)="setStatus('UYUSMAZLIK_IHTAR')" style="padding: 10px 18px; font-size: 0.85rem;">
              <app-icon name="alert-triangle" [size]="16"></app-icon>
              <span>Taşerona İhtar Gönder</span>
            </button>
            <button class="btn-secondary" (click)="setStatus('IK_INCELEMEDE')" style="padding: 10px 18px; font-size: 0.85rem;">
              <app-icon name="clock" [size]="16"></app-icon>
              <span>İK Komisyonuna Sevk Et</span>
            </button>
            <button class="btn-emerald" (click)="setStatus('ONAYLANDI')" style="padding: 10px 18px; font-size: 0.85rem;">
              <app-icon name="check-circle" [size]="16"></app-icon>
              <span>Bordroyu Onayla</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AiAuditModalComponent {
  @Input() audit: PayrollAudit | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() statusChanged = new EventEmitter<{ id: string; status: PayrollAudit['auditStatus'] }>();

  close(): void {
    this.closed.emit();
  }

  setStatus(status: PayrollAudit['auditStatus']): void {
    if (this.audit) {
      this.statusChanged.emit({ id: this.audit.id, status });
      this.audit.auditStatus = status;
    }
  }
}
