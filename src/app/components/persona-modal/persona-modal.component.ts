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
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 860px; background: #ffffff; color: #0f172a;">
        <!-- Modal Header -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 46px; height: 46px; border-radius: 10px; background: #f0f9ff; border: 1px solid #bae6fd; display: flex; align-items: center; justify-content: center; color: #0284c7;">
              <app-icon name="user" [size]="24"></app-icon>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a;">{{ worker.fullName }}</h3>
                <span class="badge" [ngClass]="worker.accessStatus === 'ALLOWED' ? 'badge-emerald' : 'badge-rose'">
                  <app-icon [name]="worker.accessStatus === 'ALLOWED' ? 'check-circle' : 'alert-triangle'" [size]="12"></app-icon>
                  {{ worker.accessStatus === 'ALLOWED' ? 'Saha Girişi İzinli' : 'Saha Girişi Askıda' }}
                </span>
              </div>
              <p style="font-size: 0.84rem; color: #64748b; margin-top: 2px;">
                {{ worker.role }} &bull; <span style="color: #0284c7; font-weight: 600;">{{ worker.subcontractorName }}</span>
              </p>
            </div>
          </div>
          <button (click)="close()" style="background: transparent; border: none; color: #64748b; cursor: pointer; padding: 6px; border-radius: 6px; transition: color 0.15s;" onmouseover="this.style.color='#0f172a'" onmouseout="this.style.color='#64748b'">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Modal Body -->
        <div style="padding: 24px; display: flex; flex-direction: column; gap: 22px;">
          <!-- Temel Bilgi Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">
            <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.04em;">T.C. Kimlik No</span>
              <p class="font-mono-numbers" style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-top: 4px;">{{ worker.tcNumber }}</p>
            </div>
            <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.04em;">PDKS Kart Kimliği</span>
              <p class="font-mono-numbers" style="font-size: 0.95rem; font-weight: 700; color: #0284c7; margin-top: 4px;">{{ worker.pdksBadgeId }}</p>
            </div>
            <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.04em;">Görevli Fabrika / Tesis</span>
              <p style="font-size: 0.95rem; font-weight: 700; color: #0f172a; margin-top: 4px;">{{ worker.plant }}</p>
            </div>
            <div style="padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.04em;">Kan Grubu & Acil Durum</span>
              <p style="font-size: 0.88rem; font-weight: 700; color: #e11d48; margin-top: 4px;">{{ worker.bloodGroup }} &bull; {{ worker.emergencyContact }}</p>
            </div>
          </div>

          <!-- İSG & Özlük Belge Karnesi -->
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 8px;">
                <app-icon name="shield-check" [size]="18" customClass="text-emerald-600"></app-icon>
                İSG & Özlük Dosyası Uyumluluk Karnesi
              </h4>
              <span class="badge badge-blue">
                Uyum Skoru: %{{ worker.complianceRate }}
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

          <!-- Güvenlik & Denetim Notu -->
          <div style="padding: 16px; border-left: 4px solid #0284c7; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd; border-left-width: 4px;">
            <div style="display: flex; gap: 12px;">
              <app-icon name="brain" [size]="20" customClass="text-sky-600"></app-icon>
              <div>
                <p style="font-size: 0.85rem; font-weight: 700; color: #0369a1;">Merkezi Güvenlik & PDKS Doğrulaması</p>
                <p style="font-size: 0.8rem; color: #475569; margin-top: 3px; line-height: 1.5;">
                  Bu personelin SGK işe giriş kaydı ve turnike PDKS yetkileri sistem tarafından eşleştirilmiştir. Taşeron firmanın aylık bordro yüklemesi ve yapay zeka maaş/mesai denetimi onaylandığı sürece fabrika turnikelerinden geçişine izin verilir.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: flex-end; gap: 12px; background: #f8fafc;">
          <button class="btn-secondary" (click)="printReport()">
            <app-icon name="download" [size]="16"></app-icon>
            Persona Raporunu Yazdır / İndir
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
