import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkerPersona } from '../../models/subcontractor.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-persona-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="modal-overlay" *ngIf="worker" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 920px; background: #ffffff; color: #0f172a; max-height: 90vh; overflow-y: auto;">
        <!-- Modal Header -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; position: sticky; top: 0; z-index: 10;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 50px; height: 50px; border-radius: 12px; background: #f0f9ff; border: 1px solid #bae6fd; display: flex; align-items: center; justify-content: center; color: #0284c7; box-shadow: 0 2px 4px rgba(2,132,199,0.1);">
              <app-icon name="user" [size]="26"></app-icon>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; letter-spacing: -0.01em;">{{ worker.fullName }}</h3>
                <span class="badge" [ngClass]="worker.accessStatus === 'ALLOWED' ? 'badge-emerald' : 'badge-rose'">
                  <app-icon [name]="worker.accessStatus === 'ALLOWED' ? 'check-circle' : 'alert-triangle'" [size]="12"></app-icon>
                  {{ worker.accessStatus === 'ALLOWED' ? 'Saha Girişi İzinli' : 'Giriş Askıda' }}
                </span>
                <span class="badge" [ngClass]="worker.marginRiskLevel === 'HIGH_RISK_CUT' ? 'badge-rose' : 'badge-emerald'">
                  {{ worker.marginRiskLevel === 'HIGH_RISK_CUT' ? 'Yüksek Kırım Uyarısı' : 'Hakediş Uyumlu' }}
                </span>
              </div>
              <p style="font-size: 0.85rem; color: #64748b; margin-top: 3px;">
                {{ worker.role }} &bull; <span style="color: #0284c7; font-weight: 600;">{{ worker.subcontractorName }}</span>
              </p>
            </div>
          </div>
          <button (click)="close()" style="background: #f1f5f9; border: 1px solid #e2e8f0; color: #64748b; cursor: pointer; padding: 7px; border-radius: 8px; transition: all 0.15s;" onmouseover="this.style.color='#0f172a'; this.style.borderColor='#cbd5e1'" onmouseout="this.style.color='#64748b'; this.style.borderColor='#e2e8f0'">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Modal Body -->
        <div style="padding: 24px; display: flex; flex-direction: column; gap: 24px;">

          <!-- ========================================================================= -->
          <!-- 1. HAKEDİŞ & TAŞERON KIRIM / MAKAS DENETİM KARTI (ASIL İSTENEN MANTIK) -->
          <!-- ========================================================================= -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1.5px solid #cbd5e1; border-radius: 14px; padding: 20px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; gap: 9px;">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #0284c7; color: #ffffff; display: flex; align-items: center; justify-content: center;">
                  <app-icon name="scale" [size]="18"></app-icon>
                </div>
                <div>
                  <h4 style="font-size: 1rem; font-weight: 800; color: #0f172a; margin: 0;">Hakediş & Taşeron Kırım Analizi</h4>
                  <p style="font-size: 0.76rem; color: #64748b; margin: 2px 0 0 0;">Ana firma ödemesi ile taşeronun çalışana yatırdığı net ücretin çapraz karşılaştırması</p>
                </div>
              </div>

              <span class="badge" [ngClass]="worker.spreadPercentage > 15 ? 'badge-rose' : 'badge-emerald'" style="font-size: 0.8rem; padding: 4px 10px;">
                Fark Oranı: {{ worker.spreadPercentage }}%
              </span>
            </div>

            <!-- 3'lü Hakediş Karşılaştırma Kutuları -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px;">
              <!-- Kutu 1: Ana Firmanın Taşerona Yatırdığı Para -->
              <div style="background: #ffffff; border: 1.5px solid #bae6fd; border-radius: 10px; padding: 14px; position: relative;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 0.75rem; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.03em;">1. Firmamızın Taşerona Yatırdığı</span>
                  <app-icon name="building" [size]="15" customClass="text-sky-600"></app-icon>
                </div>
                <div class="font-mono-numbers" style="font-size: 1.35rem; font-weight: 800; color: #0f172a;">
                  {{ worker.companyPaidRate.toLocaleString('tr-TR') }} ₺
                </div>
                <div style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">
                  Sözleşme Hakediş Tutarı
                </div>
              </div>

              <!-- Kutu 2: Taşeronun Çalışana Ödediği Para -->
              <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 0.75rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.03em;">2. Taşeronun Çalışana Ödediği</span>
                  <app-icon name="user" [size]="15" customClass="text-slate-600"></app-icon>
                </div>
                <div class="font-mono-numbers" style="font-size: 1.35rem; font-weight: 800; color: #0f172a;">
                  {{ worker.workerActualPay.toLocaleString('tr-TR') }} ₺
                </div>
                <div style="font-size: 0.72rem; color: #64748b; margin-top: 4px;">
                  İşçinin Bordrodaki Net Hakedişi
                </div>
              </div>

              <!-- Kutu 3: Aradaki Fark (Eksi Olarak Net Gösterim) -->
              <div style="background: #ffffff; border: 1.5px solid #fecdd3; border-radius: 10px; padding: 14px; position: relative;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <span style="font-size: 0.75rem; font-weight: 800; color: #e11d48; text-transform: uppercase; letter-spacing: 0.03em;">3. Aradaki Fark (Taşeron Payı)</span>
                  <app-icon name="alert-triangle" [size]="15" customClass="text-rose-600"></app-icon>
                </div>
                <div class="font-mono-numbers" style="font-size: 1.35rem; font-weight: 800; color: #e11d48;">
                  {{ worker.spreadAmount.toLocaleString('tr-TR') }} ₺
                </div>
                <div style="font-size: 0.72rem; color: #e11d48; font-weight: 700; margin-top: 4px;">
                  {{ worker.spreadPercentage }}% Kırım / Kesinti
                </div>
              </div>
            </div>

            <!-- Canlı Hakediş & Kırım Açıklama Çubuğu -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem;">
                <span style="display: flex; align-items: center; gap: 6px; color: #475569; font-weight: 600;">
                  <app-icon name="scale" [size]="15" customClass="text-sky-600"></app-icon>
                  <span><strong>Hakediş & Kırım Dengesi:</strong> Firmamız işçi için <strong>{{ worker.companyPaidRate.toLocaleString('tr-TR') }} ₺</strong> aktarırken, işçiye net <strong>{{ worker.workerActualPay.toLocaleString('tr-TR') }} ₺</strong> yansıtılmıştır.</span>
                </span>
                <span class="currency-val" style="color: #e11d48;">
                  Fark: {{ worker.spreadAmount.toLocaleString('tr-TR') }} ₺ ({{ worker.spreadPercentage }}%)
                </span>
              </div>

              <!-- İki Parçalı Orantı Barı -->
              <div style="height: 12px; background: #fee2e2; border-radius: 6px; overflow: hidden; display: flex; border: 1px solid #fecdd3;">
                <div
                  [style.width.%]="(worker.workerActualPay / worker.companyPaidRate) * 100"
                  style="background: #0284c7; height: 100%; transition: width 0.3s;"
                  title="İşçiye Ödenen Kısım"
                ></div>
                <div
                  [style.width.%]="((worker.companyPaidRate - worker.workerActualPay) / worker.companyPaidRate) * 100"
                  style="background: #e11d48; height: 100%; transition: width 0.3s;"
                  title="Taşeron Tarafından Kesilen Kısım"
                ></div>
              </div>

              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; color: #64748b;">
                <span style="display: flex; align-items: center; gap: 5px;">
                  <span style="width: 8px; height: 8px; border-radius: 2px; background: #0284c7; display: inline-block;"></span>
                  İşçiye Yansıyan Pay: %{{ ((worker.workerActualPay / worker.companyPaidRate) * 100) | number:'1.1-1' }}
                </span>
                <span style="display: flex; align-items: center; gap: 5px;">
                  <span style="width: 8px; height: 8px; border-radius: 2px; background: #e11d48; display: inline-block;"></span>
                  Taşeron Kesintisi (Kırım): {{ worker.spreadPercentage }}%
                </span>
              </div>
            </div>

            <!-- Fazla Mesai PDKS vs Bordro Şeridi -->
            <div *ngIf="worker.pdksOvertimeHours !== undefined" style="margin-top: 12px; padding: 12px 14px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #9a3412;">
                <app-icon name="clock" [size]="16" customClass="text-amber-600"></app-icon>
                <span><strong>Fazla Mesai Çapraz Teyidi:</strong> PDKS Turnike Mesaisi: <strong>{{ worker.pdksOvertimeHours }} sa</strong> &bull; Taşeronun Bordroda Ödediği: <strong>{{ worker.paidOvertimeHours }} sa</strong></span>
              </div>
              <div>
                <span *ngIf="worker.missingOvertimeHours && worker.missingOvertimeHours > 0" class="badge badge-rose font-mono-numbers">
                  <app-icon name="alert-triangle" [size]="11"></app-icon>
                  {{ worker.missingOvertimeHours }} sa Eksik Ödendi (-{{ worker.missingOvertimeAmount?.toLocaleString('tr-TR') }} ₺)
                </span>
                <span *ngIf="!worker.missingOvertimeHours || worker.missingOvertimeHours === 0" class="badge badge-emerald">
                  <app-icon name="check-circle" [size]="11"></app-icon>
                  Mesai Eksiksiz Ödendi
                </span>
              </div>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- 2. TEMEL ÇALIŞAN & TESİS KİMLİK KARTLARI -->
          <!-- ========================================================================= -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
            <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.04em;">T.C. Kimlik No</span>
              <p class="font-mono-numbers" style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-top: 4px;">{{ worker.tcNumber }}</p>
            </div>
            <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.04em;">PDKS Kart Kimliği</span>
              <p class="font-mono-numbers" style="font-size: 0.95rem; font-weight: 700; color: #0284c7; margin-top: 4px;">{{ worker.pdksBadgeId }}</p>
            </div>
            <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.04em;">Görevli Tesis / Fabrika</span>
              <p style="font-size: 0.92rem; font-weight: 700; color: #0f172a; margin-top: 4px;">{{ worker.plant }}</p>
            </div>
            <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.04em;">Kan Grubu & Acil Durum</span>
              <p style="font-size: 0.88rem; font-weight: 700; color: #e11d48; margin-top: 4px;">{{ worker.bloodGroup }} &bull; {{ worker.emergencyContact }}</p>
            </div>
          </div>

          <!-- ========================================================================= -->
          <!-- 3. İSG & ÖZLÜK BELGE KARNESİ -->
          <!-- ========================================================================= -->
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                <app-icon name="shield-check" [size]="18" customClass="text-emerald-600"></app-icon>
                İSG & Özlük Dosyası Uyumluluk Karnesi
              </h4>
              <span class="badge badge-blue">
                Özlük Uyum Skoru: %{{ worker.complianceRate }}
              </span>
            </div>

            <div style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #ffffff;">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Belge Türü</th>
                    <th>Belge / Ruhsat No</th>
                    <th>Kurum / OSGB</th>
                    <th>Geçerlilik Bitiş</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let doc of worker.documents">
                    <td>
                      <div style="font-weight: 600; color: #0f172a;">{{ doc.title }}</div>
                      <div style="font-size: 0.75rem; color: #64748b;">Düzenleme: {{ doc.issueDate }}</div>
                    </td>
                    <td class="font-mono-numbers" style="font-size: 0.82rem; color: #475569;">{{ doc.documentNumber }}</td>
                    <td style="font-size: 0.82rem; color: #334155;">{{ doc.issuer }}</td>
                    <td class="font-mono-numbers" style="font-size: 0.85rem; font-weight: 600; color: #0f172a;">
                      {{ doc.expiryDate }}
                    </td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'badge-emerald': doc.status === 'VALID',
                        'badge-amber': doc.status === 'EXPIRING_SOON',
                        'badge-rose': doc.status === 'EXPIRED' || doc.status === 'MISSING'
                      }">
                        <app-icon [name]="doc.status === 'VALID' ? 'check-circle' : 'alert-triangle'" [size]="11"></app-icon>
                        {{ doc.status === 'VALID' ? 'Geçerli' : (doc.status === 'EXPIRING_SOON' ? 'Süresi Yakın' : 'Süresi Dolmuş') }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 4. Güvenlik & Denetim Notu -->
          <div style="padding: 16px; border-left: 4px solid #0284c7; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd; border-left-width: 4px;">
            <div style="display: flex; gap: 12px;">
              <app-icon name="brain" [size]="20" customClass="text-sky-600"></app-icon>
              <div>
                <p style="font-size: 0.85rem; font-weight: 700; color: #0369a1;">Hakediş ve Turnike Giriş Güvenlik Protokolü</p>
                <p style="font-size: 0.8rem; color: #475569; margin-top: 3px; line-height: 1.5;">
                  İşçiye taşeron tarafından ödenen ücret ile firmamızın yatırdığı hakediş bedeli arasındaki fark sistem tarafından otomatik denetlenir. Yüksek kırım tespit edilen taşeronların hakediş ödemeleri komisyon incelemesine alınır.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: flex-end; gap: 12px; background: #f8fafc; position: sticky; bottom: 0;">
          <button class="btn-secondary" (click)="printReport()">
            <app-icon name="download" [size]="16"></app-icon>
            Hakediş & Persona Raporunu Yazdır
          </button>
          <button class="btn-primary" (click)="close()">
            Kapat
          </button>
        </div>
      </div>
    </div>
  `
})
export class PersonaModalComponent {
  @Input() worker: WorkerPersona | null = null;
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  printReport(): void {
    window.print();
  }
}
