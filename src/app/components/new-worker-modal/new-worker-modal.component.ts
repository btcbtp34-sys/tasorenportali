import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubcontractorCompany } from '../../models/subcontractor.model';
import { SubcontractorService } from '../../services/subcontractor.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-new-worker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()" style="max-width: 600px; background: #ffffff; color: #0f172a;">
        <!-- Header -->
        <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 10px; background: #f0f9ff; border: 1px solid #bae6fd; display: flex; align-items: center; justify-content: center; color: #0284c7;">
              <app-icon name="user" [size]="22"></app-icon>
            </div>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: #0f172a;">Yeni Alt Taşeron Personel Kaydı</h3>
              <p style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">
                Fabrika ve saha tesislerinde görevlendirilecek taşeron çalışanını ekleyin
              </p>
            </div>
          </div>
          <button (click)="close()" style="background: transparent; border: none; color: #64748b; cursor: pointer; padding: 6px;">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Body -->
        <div style="padding: 24px; display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
              Bağlı Olduğu Taşeron Şirket:
            </label>
            <select [(ngModel)]="subcontractorId" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.85rem; outline: none;">
              <option *ngFor="let c of companies" [value]="c.id">{{ c.name }} ({{ c.plant }})</option>
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                Ad Soyad:
              </label>
              <input type="text" [(ngModel)]="fullName" placeholder="Örn: Mehmet Ali Kaya" style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.85rem; outline: none;">
            </div>

            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                T.C. Kimlik Numarası:
              </label>
              <input type="text" [(ngModel)]="tcNumber" placeholder="11 haneli TC no" style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.85rem; font-family: var(--font-mono); outline: none;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                Görevi / Meslek Unvanı:
              </label>
              <input type="text" [(ngModel)]="role" placeholder="Örn: Sertifikalı Kaynakçı, Boru Ustası" style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.85rem; outline: none;">
            </div>

            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                Çalışacağı Tesis / Fabrika:
              </label>
              <select [(ngModel)]="plant" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.85rem; outline: none;">
                <option value="Dilovası Çelik Boru Tesisleri">Dilovası Çelik Boru Tesisleri</option>
                <option value="Gebze 1 Fabrikası - ERW Hattı">Gebze 1 Fabrikası - ERW Hattı</option>
                <option value="İskenderun ERW Spiral Tesisleri">İskenderun ERW Spiral Tesisleri</option>
                <option value="Gebze 2 Profil & Dilme Tesisi">Gebze 2 Profil & Dilme Tesisi</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                Kan Grubu:
              </label>
              <select [(ngModel)]="bloodGroup" style="width: 100%; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.85rem; outline: none;">
                <option value="A Rh+">A Rh+</option>
                <option value="A Rh-">A Rh-</option>
                <option value="B Rh+">B Rh+</option>
                <option value="B Rh-">B Rh-</option>
                <option value="0 Rh+">0 Rh+</option>
                <option value="0 Rh-">0 Rh-</option>
                <option value="AB Rh+">AB Rh+</option>
                <option value="AB Rh-">AB Rh-</option>
              </select>
            </div>

            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: #334155; display: block; margin-bottom: 6px;">
                Acil Durum İletişim:
              </label>
              <input type="text" [(ngModel)]="emergencyContact" placeholder="Örn: Ayşe Kaya (Eşi) - 0532..." style="width: 100%; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; padding: 10px 12px; font-size: 0.85rem; outline: none;">
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: flex-end; gap: 12px; background: #f8fafc;">
          <button class="btn-secondary" (click)="close()">
            Vazgeç
          </button>
          <button class="btn-primary" (click)="saveWorker()">
            <app-icon name="check-circle" [size]="16"></app-icon>
            Personeli Kaydet & Yetkilendir
          </button>
        </div>
      </div>
    </div>
  `
})
export class NewWorkerModalComponent {
  @Input() companies: SubcontractorCompany[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  subcontractorId: string = 'sub-1';
  fullName: string = '';
  tcNumber: string = '';
  role: string = 'Sertifikalı Boru Kaynakçısı';
  plant: string = 'Dilovası Çelik Boru Tesisleri';
  bloodGroup: string = 'A Rh+';
  emergencyContact: string = 'Aile Yakını';

  constructor(private subService: SubcontractorService) {}

  saveWorker(): void {
    if (!this.fullName || !this.tcNumber) return;
    const comp = this.companies.find(c => c.id === this.subcontractorId);

    this.subService.addWorker({
      subcontractorId: this.subcontractorId,
      subcontractorName: comp ? comp.name : 'Demiray Montaj',
      fullName: this.fullName,
      tcNumber: this.tcNumber,
      role: this.role,
      plant: this.plant,
      bloodGroup: this.bloodGroup,
      emergencyContact: this.emergencyContact
    });

    this.saved.emit();
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
