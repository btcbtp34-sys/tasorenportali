import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubcontractorService } from './services/subcontractor.service';
import {
  SubcontractorCompany,
  WorkerPersona,
  PdksRecord,
  PayrollAudit
} from './models/subcontractor.model';
import { IconComponent } from './components/icon/icon.component';
import { PersonaModalComponent } from './components/persona-modal/persona-modal.component';
import { AiAuditModalComponent } from './components/ai-audit-modal/ai-audit-modal.component';
import { PayrollUploadModalComponent } from './components/payroll-upload-modal/payroll-upload-modal.component';
import { NewWorkerModalComponent } from './components/new-worker-modal/new-worker-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    PersonaModalComponent,
    AiAuditModalComponent,
    PayrollUploadModalComponent,
    NewWorkerModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Taşeron Portali | Yönetim, PDKS & AI Bordro Denetim Sistemi';

  // Aktif Sekme (Taşeron Listesi Ana Giriş Ekranı)
  activeTab: 'subcontractors' | 'workers' | 'ai-audits' | 'pdks' | 'reports' = 'subcontractors';

  // Seçili Taşeron (Taşerondan İşçilere Geçiş Filtresi)
  selectedCompanyForWorkers: SubcontractorCompany | null = null;

  // Taşeron Görünüm Modu (Grid veya Tablo)
  subcontractorViewMode: 'grid' | 'table' = 'grid';

  // Veriler
  companies: SubcontractorCompany[] = [];
  workers: WorkerPersona[] = [];
  pdksRecords: PdksRecord[] = [];
  audits: PayrollAudit[] = [];
  isSapSyncing: boolean = false;

  // Filtreler
  selectedPlant: string = 'ALL';
  auditFilter: 'ALL' | 'RISK_ONLY' | 'OVERTIME_ONLY' | 'APPROVED' = 'ALL';
  searchQuery: string = '';

  // Taşeronlar Ekranı Dropdown Filtreleri
  companySelectedPlant: string = 'ALL';
  companySelectedStatus: string = 'ALL';
  companySelectedRisk: string = 'ALL';

  // Çalışanlar Ekranı Dropdown Filtreleri
  workerSelectedCompanyId: string = 'ALL';
  workerSelectedRole: string = 'ALL';
  workerRiskFilter: 'ALL' | 'HIGH_RISK_CUT' | 'NORMAL' | 'OVERTIME_ISSUE' = 'ALL';
  workerSelectedPlant: string = 'ALL';

  // Modallar
  selectedPersona: WorkerPersona | null = null;
  selectedAudit: PayrollAudit | null = null;
  showUploadModal: boolean = false;
  showNewWorkerModal: boolean = false;

  // Bildirim Banner
  toastMessage: string | null = null;
  toastType: 'success' | 'info' | 'warning' = 'info';

  constructor(public subService: SubcontractorService) {}

  ngOnInit(): void {
    this.subService.companies$.subscribe(data => (this.companies = data));
    this.subService.workers$.subscribe(data => (this.workers = data));
    this.subService.pdks$.subscribe(data => (this.pdksRecords = data));
    this.subService.audits$.subscribe(data => (this.audits = data));
    this.subService.isSapSyncing$.subscribe(val => (this.isSapSyncing = val));
  }

  // Dinamik Rol & Tesis Listeleri
  get uniqueRoles(): string[] {
    const set = new Set<string>();
    this.workers.forEach(w => {
      if (w.role) set.add(w.role);
    });
    return Array.from(set);
  }

  get uniquePlants(): string[] {
    const set = new Set<string>();
    this.workers.forEach(w => {
      if (w.plant) set.add(w.plant);
    });
    return Array.from(set);
  }

  // SAP Senkronizasyonu
  syncSap(): void {
    this.subService.syncFromSap().subscribe(() => {
      this.showToast('SAP ERP (MM/PM/HCM) verileri canlı olarak eşitlendi.', 'success');
    });
  }

  // PDKS Verilerini Taşeronlara İletme
  transferPdks(): void {
    this.subService.sendPdksToSubcontractor().subscribe(count => {
      this.showToast(
        `${count > 0 ? count + ' yeni ' : ''}PDKS turnike ve fazla mesai kaydı alt taşeron firmalara güvenli iletildi.`,
        'success'
      );
    });
  }

  // Bildirim gösterme
  showToast(msg: string, type: 'success' | 'info' | 'warning' = 'info'): void {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  // Filtrelenmiş Bordro Denetimleri
  get filteredAudits(): PayrollAudit[] {
    return this.audits.filter(a => {
      const matchPlant =
        this.selectedPlant === 'ALL' ||
        this.workers.find(w => w.id === a.workerId)?.plant === this.selectedPlant;

      const matchSearch =
        !this.searchQuery ||
        a.workerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.tcNumber.includes(this.searchQuery) ||
        a.subcontractorName.toLowerCase().includes(this.searchQuery.toLowerCase());

      let matchFilter = true;
      if (this.auditFilter === 'RISK_ONLY') {
        matchFilter = a.marginRiskLevel === 'HIGH_RISK_CUT';
      } else if (this.auditFilter === 'OVERTIME_ONLY') {
        matchFilter = a.missingOvertimeHours > 0;
      } else if (this.auditFilter === 'APPROVED') {
        matchFilter = a.auditStatus === 'ONAYLANDI';
      }

      return matchPlant && matchSearch && matchFilter;
    });
  }

  // Filtrelenmiş Çalışanlar (Dropdown ve Hiyerarşik Firma Filtreleri)
  get filteredWorkers(): WorkerPersona[] {
    return this.workers.filter(w => {
      // 1. Firma Filtresi
      let matchCompany = true;
      if (this.workerSelectedCompanyId !== 'ALL') {
        matchCompany = w.subcontractorId === this.workerSelectedCompanyId;
      } else if (this.selectedCompanyForWorkers) {
        matchCompany =
          w.subcontractorId === this.selectedCompanyForWorkers.id ||
          w.subcontractorName === this.selectedCompanyForWorkers.name;
      }

      // 2. Rol / Görev Filtresi
      const matchRole = this.workerSelectedRole === 'ALL' || w.role === this.workerSelectedRole;

      // 3. Tesis Filtresi
      const matchPlant = this.workerSelectedPlant === 'ALL' || w.plant === this.workerSelectedPlant;

      // 4. Kırım / Kesinti Risk Filtresi
      let matchRisk = true;
      if (this.workerRiskFilter === 'HIGH_RISK_CUT') {
        matchRisk = w.marginRiskLevel === 'HIGH_RISK_CUT';
      } else if (this.workerRiskFilter === 'NORMAL') {
        matchRisk = w.marginRiskLevel === 'NORMAL';
      } else if (this.workerRiskFilter === 'OVERTIME_ISSUE') {
        matchRisk = !!(w.missingOvertimeHours && w.missingOvertimeHours > 0);
      }

      // 5. Genel Arama (Ad Soyad, TC, Firma)
      const matchSearch =
        !this.searchQuery ||
        w.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        w.tcNumber.includes(this.searchQuery) ||
        w.subcontractorName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        w.role.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchCompany && matchRole && matchPlant && matchRisk && matchSearch;
    });
  }

  // Filtrelenmiş Taşeron Şirketler (Dropdown Destekli)
  get filteredCompanies(): SubcontractorCompany[] {
    return this.companies.filter(c => {
      // 1. Tesis Filtresi
      const matchPlant =
        this.companySelectedPlant === 'ALL' ||
        c.plant.includes(this.companySelectedPlant) ||
        c.plant === this.companySelectedPlant;

      // 2. Statü Filtresi
      const matchStatus =
        this.companySelectedStatus === 'ALL' || c.status === this.companySelectedStatus;

      // 3. Kırım / Kesinti Risk Seviyesi
      let matchRisk = true;
      if (this.companySelectedRisk === 'HIGH_CUT') {
        matchRisk = c.avgSpreadPercentage <= -20;
      } else if (this.companySelectedRisk === 'COMPLIANT') {
        matchRisk = c.avgSpreadPercentage > -15;
      }

      // 4. Arama Metni
      const matchSearch =
        !this.searchQuery ||
        c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.sapVendorId.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.contractCode.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.supervisorName.toLowerCase().includes(this.searchQuery.toLowerCase());

      return matchPlant && matchStatus && matchRisk && matchSearch;
    });
  }

  resetCompanyFilters(): void {
    this.companySelectedPlant = 'ALL';
    this.companySelectedStatus = 'ALL';
    this.companySelectedRisk = 'ALL';
    this.searchQuery = '';
  }

  // Filtrelenmiş PDKS Kayıtları
  get filteredPdks(): PdksRecord[] {
    return this.pdksRecords.filter(p => {
      const matchSearch =
        !this.searchQuery ||
        p.workerName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.tcNumber.includes(this.searchQuery) ||
        p.subcontractorName.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchSearch;
    });
  }

  // Metrik Hesaplamaları
  get totalActiveWorkers(): number {
    return this.companies.reduce((sum, c) => sum + c.activeWorkerCount, 0);
  }

  get highRiskAuditCount(): number {
    return this.audits.filter(a => a.marginRiskLevel === 'HIGH_RISK_CUT').length;
  }

  get missingOvertimeCount(): number {
    return this.audits.filter(a => a.missingOvertimeHours > 0).length;
  }

  get totalMissingOvertimeHours(): number {
    return this.audits.reduce((sum, a) => sum + a.missingOvertimeHours, 0);
  }

  get avgMarginSpread(): number {
    if (this.audits.length === 0) return 0;
    const sum = this.audits.reduce((acc, a) => acc + a.spreadPercentage, 0);
    return Number((sum / this.audits.length).toFixed(1));
  }

  // Denetim Durum Güncellemesi
  onAuditStatusChanged(evt: { id: string; status: PayrollAudit['auditStatus'] }): void {
    this.subService.updateAuditStatus(evt.id, evt.status);
    this.showToast('Bordro denetim kararı güncellendi.', 'success');
  }

  // Modal Açıcılar
  openPersona(worker: WorkerPersona): void {
    this.selectedPersona = worker;
  }

  openAudit(audit: PayrollAudit): void {
    this.selectedAudit = audit;
  }

  openUploadModal(): void {
    this.showUploadModal = true;
  }

  openNewWorker(): void {
    this.showNewWorkerModal = true;
  }

  onPayrollUploaded(): void {
    this.showToast('Bordro başarıyla yüklendi! AI analizi tamamlandı ve listeye eklendi.', 'success');
  }

  onWorkerSaved(): void {
    this.showToast('Yeni çalışan persona kartı oluşturuldu ve yetkilendirildi.', 'success');
  }

  exportReport(): void {
    this.showToast('Taşeron Denetim Raporu PDF/Excel olarak hazırlandı.', 'info');
  }

  filterByCompanyWorkers(company: SubcontractorCompany | string): void {
    if (typeof company === 'string') {
      const found = this.companies.find(c => c.name === company);
      this.selectedCompanyForWorkers = found || null;
      this.workerSelectedCompanyId = found ? found.id : 'ALL';
    } else {
      this.selectedCompanyForWorkers = company;
      this.workerSelectedCompanyId = company.id;
    }
    this.searchQuery = '';
    this.activeTab = 'workers';
  }

  onWorkerCompanyFilterChange(): void {
    if (this.workerSelectedCompanyId === 'ALL') {
      this.selectedCompanyForWorkers = null;
    } else {
      this.selectedCompanyForWorkers = this.companies.find(c => c.id === this.workerSelectedCompanyId) || null;
    }
  }

  clearCompanyFilter(): void {
    this.selectedCompanyForWorkers = null;
    this.workerSelectedCompanyId = 'ALL';
    this.searchQuery = '';
  }

  resetWorkerFilters(): void {
    this.selectedCompanyForWorkers = null;
    this.workerSelectedCompanyId = 'ALL';
    this.workerSelectedRole = 'ALL';
    this.workerRiskFilter = 'ALL';
    this.workerSelectedPlant = 'ALL';
    this.searchQuery = '';
  }
}
