import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of, tap } from 'rxjs';
import {
  SubcontractorCompany,
  WorkerPersona,
  PdksRecord,
  PayrollAudit
} from '../models/subcontractor.model';

@Injectable({
  providedIn: 'root'
})
export class SubcontractorService {

  // SAP Taşeron Firmaları
  private mockCompanies: SubcontractorCompany[] = [
    {
      id: 'sub-1',
      sapVendorId: 'SAP-VND-40192',
      name: 'Demiray Endüstriyel Montaj A.Ş.',
      taxNumber: '2740918472',
      plant: 'Dilovası Çelik Boru Tesisleri',
      contractCode: 'YCL-CTR-2025-089',
      contractStartDate: '2025-01-01',
      contractEndDate: '2026-12-31',
      supervisorName: 'Murat Çetinkaya',
      supervisorPhone: '+90 532 441 8920',
      activeWorkerCount: 42,
      monthlySapBudget: 2268000,
      avgSapRatePerWorker: 54000, // Referans 100 (Bizim taşerona ödediğimiz)
      avgWorkerActualPay: 47790,  // Referans 88.5 (Taşeronun işçiye verdiği)
      avgSpreadAmount: -6210,     // Fark: -6.210 TL
      avgSpreadPercentage: -11.5,
      complianceScore: 78,
      lastSapSyncTime: 'Bugün, 16:45 (SAP RFC Başarılı)',
      status: 'ACTIVE'
    },
    {
      id: 'sub-2',
      sapVendorId: 'SAP-VND-55821',
      name: 'Körfez Mekanik & Borulama San. Tic.',
      taxNumber: '5810294812',
      plant: 'Gebze 1 Fabrikası - ERW Hattı',
      contractCode: 'YCL-CTR-2025-114',
      contractStartDate: '2025-03-15',
      contractEndDate: '2026-09-30',
      supervisorName: 'Hakan Yılmaz',
      supervisorPhone: '+90 533 112 3456',
      activeWorkerCount: 28,
      monthlySapBudget: 1456000,
      avgSapRatePerWorker: 52000, // Referans 100
      avgWorkerActualPay: 38480,  // Referans 74 (Yüksek kırım/kesinti!)
      avgSpreadAmount: -13520,    // Fark: -13.520 TL
      avgSpreadPercentage: -26.0,
      complianceScore: 64, // Düşük uyum, makas şüphesi
      lastSapSyncTime: 'Bugün, 15:20 (SAP RFC Başarılı)',
      status: 'AUDIT_HOLD'
    },
    {
      id: 'sub-3',
      sapVendorId: 'SAP-VND-62044',
      name: 'Atlas Çelik & Ağır Bakım Ltd.',
      taxNumber: '0981726354',
      plant: 'İskenderun ERW Spiral Tesisleri',
      contractCode: 'YCL-CTR-2025-042',
      contractStartDate: '2025-01-01',
      contractEndDate: '2027-01-01',
      supervisorName: 'Serkan Öztürk',
      supervisorPhone: '+90 535 789 0123',
      activeWorkerCount: 35,
      monthlySapBudget: 1890000,
      avgSapRatePerWorker: 54000,
      avgWorkerActualPay: 47520,
      avgSpreadAmount: -6480,
      avgSpreadPercentage: -12.0,
      complianceScore: 94, // Yüksek uyum
      lastSapSyncTime: 'Bugün, 14:10 (SAP RFC Başarılı)',
      status: 'ACTIVE'
    },
    {
      id: 'sub-4',
      sapVendorId: 'SAP-VND-71890',
      name: 'Teknik İskele & Kumlama Hizmetleri',
      taxNumber: '8392019485',
      plant: 'Gebze 2 Profil & Dilme Tesisi',
      contractCode: 'YCL-CTR-2025-201',
      contractStartDate: '2025-06-01',
      contractEndDate: '2026-06-01',
      supervisorName: 'Cemil Karaca',
      supervisorPhone: '+90 542 998 1234',
      activeWorkerCount: 19,
      monthlySapBudget: 912000,
      avgSapRatePerWorker: 48000,
      avgWorkerActualPay: 36960,
      avgSpreadAmount: -11040,
      avgSpreadPercentage: -23.0,
      complianceScore: 82,
      lastSapSyncTime: 'Dün, 18:00 (SAP RFC Başarılı)',
      status: 'ACTIVE'
    }
  ];

  // Taşeron Personel Havuzu (Persona & Özlük Kartları)
  private mockWorkers: WorkerPersona[] = [
    {
      id: 'wrk-101',
      subcontractorId: 'sub-1',
      subcontractorName: 'Demiray Endüstriyel Montaj A.Ş.',
      tcNumber: '34892184912',
      fullName: 'Ahmet Kenan Yavuz',
      role: 'Sertifikalı Boru Kaynakçısı (6G)',
      plant: 'Dilovası Çelik Boru Tesisleri',
      entryDate: '2024-04-12',
      sgkStatus: 'AKTIF_SIGORTALI',
      bloodGroup: 'A Rh+',
      emergencyContact: 'Elif Yavuz (Eşi)',
      emergencyPhone: '+90 532 991 2233',
      pdksBadgeId: 'YCL-PDKS-8841',
      accessStatus: 'ALLOWED',
      complianceRate: 100,
      companyPaidRate: 54000,
      workerActualPay: 48600,
      spreadAmount: -5400,
      spreadPercentage: -10.0,
      marginRiskLevel: 'NORMAL',
      pdksOvertimeHours: 18.0,
      paidOvertimeHours: 18.0,
      missingOvertimeHours: 0.0,
      missingOvertimeAmount: 0,
      documents: [
        { id: 'doc-1', type: 'SAGLIK_RAPORU', title: 'Ağır ve Tehlikeli İşler Sağlık Kurulu Raporu', documentNumber: 'SR-2025-9941', issueDate: '2025-02-10', expiryDate: '2026-02-10', status: 'VALID', issuer: 'Özel Dilovası OSGB' },
        { id: 'doc-2', type: 'MYK_BELGESI', title: 'MYK Çelik Kaynakçısı Seviye 4', documentNumber: 'MYK-11UY0010-4', issueDate: '2023-08-15', expiryDate: '2028-08-15', status: 'VALID', issuer: 'TÜRKAK Yetkili Belgelendirme' },
        { id: 'doc-3', type: 'ISG_16_SAAT', title: '16 Saat Temel İSG Eğitimi Sertifikası', documentNumber: 'ISG-2025-102', issueDate: '2025-01-20', expiryDate: '2026-01-20', status: 'VALID', issuer: 'Yücel Boru Akademi' },
        { id: 'doc-4', type: 'YUKSEKTE_CALISMA', title: 'Yüksekte Güvenli Çalışma Belgesi (Seviye 2)', documentNumber: 'YC-2024-77', issueDate: '2024-05-10', expiryDate: '2026-05-10', status: 'VALID', issuer: 'Mavi Akademi' },
        { id: 'doc-5', type: 'SGK_ISE_GIRIS', title: 'SGK İşe Giriş Bildirgesi (Barkodlu)', documentNumber: 'SGK-20240412-1', issueDate: '2024-04-12', expiryDate: '2099-01-01', status: 'VALID', issuer: 'Sosyal Güvenlik Kurumu' }
      ]
    },
    {
      id: 'wrk-102',
      subcontractorId: 'sub-2',
      subcontractorName: 'Körfez Mekanik & Borulama San. Tic.',
      tcNumber: '19482710492',
      fullName: 'Mustafa Baran Demir',
      role: 'Tavan Vinç Operatörü',
      plant: 'Gebze 1 Fabrikası - ERW Hattı',
      entryDate: '2024-09-01',
      sgkStatus: 'AKTIF_SIGORTALI',
      bloodGroup: '0 Rh+',
      emergencyContact: 'Mehmet Demir (Kardeşi)',
      emergencyPhone: '+90 534 812 0011',
      pdksBadgeId: 'YCL-PDKS-9012',
      accessStatus: 'SUSPENDED_PAYROLL',
      complianceRate: 85,
      companyPaidRate: 52000,
      workerActualPay: 37440,
      spreadAmount: -14560,
      spreadPercentage: -28.0,
      marginRiskLevel: 'HIGH_RISK_CUT',
      pdksOvertimeHours: 32.5,
      paidOvertimeHours: 8.0,
      missingOvertimeHours: 24.5,
      missingOvertimeAmount: 6860,
      documents: [
        { id: 'doc-6', type: 'SAGLIK_RAPORU', title: 'Vinç Operatörlüğü Psikoteknik & Görme Raporu', documentNumber: 'SR-2025-3312', issueDate: '2025-01-05', expiryDate: '2026-01-05', status: 'VALID', issuer: 'Gebze Sağlık Merkezi' },
        { id: 'doc-7', type: 'MYK_BELGESI', title: 'Endüstriyel Köprülü Vinç Operatörlük Belgesi (G Sınıfı)', documentNumber: 'VNC-8821', issueDate: '2023-01-10', expiryDate: '2028-01-10', status: 'VALID', issuer: 'Milli Eğitim Bakanlığı' },
        { id: 'doc-8', type: 'ISG_16_SAAT', title: '16 Saat Temel İSG Sertifikası', documentNumber: 'ISG-2025-884', issueDate: '2025-01-15', expiryDate: '2026-01-15', status: 'VALID', issuer: 'Yücel Boru Akademi' }
      ]
    },
    {
      id: 'wrk-103',
      subcontractorId: 'sub-2',
      subcontractorName: 'Körfez Mekanik & Borulama San. Tic.',
      tcNumber: '44210984712',
      fullName: 'Serdar Alkan',
      role: 'Hidrolik Boru Montajcısı',
      plant: 'Gebze 1 Fabrikası - ERW Hattı',
      entryDate: '2024-11-15',
      sgkStatus: 'AKTIF_SIGORTALI',
      bloodGroup: 'B Rh+',
      emergencyContact: 'Fatma Alkan (Eşi)',
      emergencyPhone: '+90 536 771 9090',
      pdksBadgeId: 'YCL-PDKS-9114',
      accessStatus: 'SUSPENDED_PAYROLL',
      complianceRate: 90,
      companyPaidRate: 52000,
      workerActualPay: 39520,
      spreadAmount: -12480,
      spreadPercentage: -24.0,
      marginRiskLevel: 'HIGH_RISK_CUT',
      pdksOvertimeHours: 24.0,
      paidOvertimeHours: 0.0,
      missingOvertimeHours: 24.0,
      missingOvertimeAmount: 6240,
      documents: [
        { id: 'doc-9', type: 'SAGLIK_RAPORU', title: 'Ağır İşler Periyodik Muayene Formu', documentNumber: 'SR-2024-7711', issueDate: '2024-11-10', expiryDate: '2025-11-10', status: 'EXPIRED', issuer: 'Kocaeli OSGB' },
        { id: 'doc-10', type: 'ISG_16_SAAT', title: 'Temel İSG Eğitimi', documentNumber: 'ISG-2024-901', issueDate: '2024-11-12', expiryDate: '2025-11-12', status: 'EXPIRED', issuer: 'Körfez OSGB' }
      ]
    },
    {
      id: 'wrk-104',
      subcontractorId: 'sub-3',
      subcontractorName: 'Atlas Çelik & Ağır Bakım Ltd.',
      tcNumber: '58190283741',
      fullName: 'Gökhan Çavuşoğlu',
      role: 'Mekanik Bakım & Revizyon Ustası',
      plant: 'İskenderun ERW Spiral Tesisleri',
      entryDate: '2023-06-01',
      sgkStatus: 'AKTIF_SIGORTALI',
      bloodGroup: 'AB Rh+',
      emergencyContact: 'Murat Çavuşoğlu (Babası)',
      emergencyPhone: '+90 531 445 6789',
      pdksBadgeId: 'YCL-PDKS-7701',
      accessStatus: 'ALLOWED',
      complianceRate: 100,
      companyPaidRate: 54000,
      workerActualPay: 47520,
      spreadAmount: -6480,
      spreadPercentage: -12.0,
      marginRiskLevel: 'NORMAL',
      pdksOvertimeHours: 12.0,
      paidOvertimeHours: 12.0,
      missingOvertimeHours: 0.0,
      missingOvertimeAmount: 0,
      documents: [
        { id: 'doc-11', type: 'SAGLIK_RAPORU', title: 'Ağır Sanayi Sağlık Raporu', documentNumber: 'SR-2025-010', issueDate: '2025-05-15', expiryDate: '2026-05-15', status: 'VALID', issuer: 'İskenderun Devlet Hastanesi' },
        { id: 'doc-12', type: 'MYK_BELGESI', title: 'Makine Bakım Onarımcısı Seviye 4', documentNumber: 'MYK-MBO-441', issueDate: '2022-10-01', expiryDate: '2027-10-01', status: 'VALID', issuer: 'Yetkili Belge' }
      ]
    },
    {
      id: 'wrk-105',
      subcontractorId: 'sub-1',
      subcontractorName: 'Demiray Endüstriyel Montaj A.Ş.',
      tcNumber: '28471920384',
      fullName: 'Emre Karabulut',
      role: 'Boru Hatları İzolasyon Ustası',
      plant: 'Dilovası Çelik Boru Tesisleri',
      entryDate: '2025-01-10',
      sgkStatus: 'AKTIF_SIGORTALI',
      bloodGroup: '0 Rh-',
      emergencyContact: 'Aynur Karabulut (Eşi)',
      emergencyPhone: '+90 541 332 1100',
      pdksBadgeId: 'YCL-PDKS-8990',
      accessStatus: 'ALLOWED',
      complianceRate: 95,
      companyPaidRate: 54000,
      workerActualPay: 46980,
      spreadAmount: -7020,
      spreadPercentage: -13.0,
      marginRiskLevel: 'NORMAL',
      pdksOvertimeHours: 14.0,
      paidOvertimeHours: 14.0,
      missingOvertimeHours: 0.0,
      missingOvertimeAmount: 0,
      documents: [
        { id: 'doc-13', type: 'SAGLIK_RAPORU', title: 'Sağlık Raporu', documentNumber: 'SR-2025-881', issueDate: '2025-01-08', expiryDate: '2026-01-08', status: 'VALID', issuer: 'Dilovası OSGB' }
      ]
    },
    {
      id: 'wrk-106',
      subcontractorId: 'sub-4',
      subcontractorName: 'Teknik İskele & Kumlama Hizmetleri',
      tcNumber: '61294817203',
      fullName: 'Volkan Şimşek',
      role: 'Endüstriyel İskele Kurulum Teknisyeni',
      plant: 'Gebze 2 Profil & Dilme Tesisi',
      entryDate: '2024-08-01',
      sgkStatus: 'AKTIF_SIGORTALI',
      bloodGroup: 'A Rh-',
      emergencyContact: 'Ali Şimşek (Abisi)',
      emergencyPhone: '+90 538 902 4455',
      pdksBadgeId: 'YCL-PDKS-9512',
      accessStatus: 'ALLOWED',
      complianceRate: 100,
      companyPaidRate: 48000,
      workerActualPay: 36960,
      spreadAmount: -11040,
      spreadPercentage: -23.0,
      marginRiskLevel: 'HIGH_RISK_CUT',
      pdksOvertimeHours: 16.0,
      paidOvertimeHours: 6.0,
      missingOvertimeHours: 10.0,
      missingOvertimeAmount: 2800,
      documents: [
        { id: 'doc-14', type: 'YUKSEKTE_CALISMA', title: 'İskele Kurulum & Söküm Yüksekte Çalışma Sertifikası', documentNumber: 'YC-2024-991', issueDate: '2024-07-28', expiryDate: '2026-07-28', status: 'VALID', issuer: 'Kocaeli İSG Akademisi' }
      ]
    }
  ];

  // PDKS Fabrika Turnike Kayıtları (Gerçek fiili çalışma saatleri ve FM verileri)
  private mockPdksRecords: PdksRecord[] = [
    {
      id: 'pdk-1001',
      workerId: 'wrk-101',
      workerName: 'Ahmet Kenan Yavuz',
      subcontractorName: 'Demiray Endüstriyel Montaj A.Ş.',
      tcNumber: '34892184912',
      date: '2026-10-06',
      shift: '08:00 - 16:00 (1. Vardiya)',
      firstEntryTime: '07:46',
      lastExitTime: '19:15',
      actualHours: 11.5,
      regularHours: 8.0,
      overtimeHours: 3.5, // 3.5 Saat FM
      turnstileGate: 'Dilovası Fabrika Ana Giriş - Turnike 02',
      status: 'OVERTIME',
      transferredToVendor: true,
      transferredAt: '2026-10-07 09:30'
    },
    {
      id: 'pdk-1002',
      workerId: 'wrk-102',
      workerName: 'Mustafa Baran Demir',
      subcontractorName: 'Körfez Mekanik & Borulama San. Tic.',
      tcNumber: '19482710492',
      date: '2026-10-06',
      shift: '08:00 - 16:00 (1. Vardiya)',
      firstEntryTime: '07:50',
      lastExitTime: '20:30',
      actualHours: 12.6,
      regularHours: 8.0,
      overtimeHours: 4.6, // 4.6 Saat FM yapılmış
      turnstileGate: 'Gebze 1 ERW Holü - Turnike 04',
      status: 'OVERTIME',
      transferredToVendor: true,
      transferredAt: '2026-10-07 09:30'
    },
    {
      id: 'pdk-1003',
      workerId: 'wrk-103',
      workerName: 'Serdar Alkan',
      subcontractorName: 'Körfez Mekanik & Borulama San. Tic.',
      tcNumber: '44210984712',
      date: '2026-10-06',
      shift: '16:00 - 24:00 (2. Vardiya)',
      firstEntryTime: '15:42',
      lastExitTime: '03:10',
      actualHours: 11.4,
      regularHours: 8.0,
      overtimeHours: 3.4,
      turnstileGate: 'Gebze 1 ERW Holü - Turnike 04',
      status: 'OVERTIME',
      transferredToVendor: true,
      transferredAt: '2026-10-07 09:30'
    },
    {
      id: 'pdk-1004',
      workerId: 'wrk-104',
      workerName: 'Gökhan Çavuşoğlu',
      subcontractorName: 'Atlas Çelik & Ağır Bakım Ltd.',
      tcNumber: '58190283741',
      date: '2026-10-06',
      shift: '08:00 - 16:00 (1. Vardiya)',
      firstEntryTime: '07:55',
      lastExitTime: '16:05',
      actualHours: 8.1,
      regularHours: 8.0,
      overtimeHours: 0.0,
      turnstileGate: 'İskenderun Spiral Tesis Kapı 1',
      status: 'NORMAL',
      transferredToVendor: true,
      transferredAt: '2026-10-07 09:30'
    },
    {
      id: 'pdk-1005',
      workerId: 'wrk-105',
      workerName: 'Emre Karabulut',
      subcontractorName: 'Demiray Endüstriyel Montaj A.Ş.',
      tcNumber: '28471920384',
      date: '2026-10-06',
      shift: '08:00 - 16:00 (1. Vardiya)',
      firstEntryTime: '07:40',
      lastExitTime: '18:10',
      actualHours: 10.5,
      regularHours: 8.0,
      overtimeHours: 2.5,
      turnstileGate: 'Dilovası Fabrika Ana Giriş - Turnike 01',
      status: 'OVERTIME',
      transferredToVendor: true,
      transferredAt: '2026-10-07 09:30'
    },
    {
      id: 'pdk-1006',
      workerId: 'wrk-106',
      workerName: 'Volkan Şimşek',
      subcontractorName: 'Teknik İskele & Kumlama Hizmetleri',
      tcNumber: '61294817203',
      date: '2026-10-06',
      shift: '08:00 - 16:00 (1. Vardiya)',
      firstEntryTime: '08:15',
      lastExitTime: '16:15',
      actualHours: 8.0,
      regularHours: 8.0,
      overtimeHours: 0.0,
      turnstileGate: 'Gebze 2 Profil Kapı 1',
      status: 'LATE',
      transferredToVendor: false
    }
  ];

  // AI BORDRO & HAKEDİŞ ÇAPRAZ DENETİM LİSTESİ (ÖNEMLİ KULLANICI MADDESİ E ve F)
  // Amaç: "100 ben veriyorum ama taşeron çalışana 80 tl verebiliyor bunu listede çıkartması gerekiyor"
  // "Fazla mesaisini ödemiş mi, değerleri burada gösterilebilir"
  private mockPayrollAudits: PayrollAudit[] = [
    {
      id: 'aud-201',
      workerId: 'wrk-102',
      workerName: 'Mustafa Baran Demir',
      tcNumber: '19482710492',
      subcontractorId: 'sub-2',
      subcontractorName: 'Körfez Mekanik & Borulama San. Tic.',
      period: '2026 / 09',
      uploadDate: '2026-10-04 11:24',
      payrollFileName: 'korfez_bordro_mustafa_demir_2026_09.pdf',
      fileSizeKb: 412,
      // SAP Referansı: Yücel Boru'nun taşerona işçi için ödediği tutar
      sapAgreedRate: 52000, // 100 birim
      // AI OCR Okunan Net Ücret:
      aiExtractedGrossPay: 46200,
      aiExtractedNetPay: 37440, // 72 birim! (%28 Makas Kesintisi)
      spreadAmount: 14560,
      spreadPercentage: 28.0,
      marginRiskLevel: 'HIGH_RISK_CUT', // KIRMIZI ALARM: Ciddi Haksız Kesinti / Makas Uyarısı
      // Fazla Mesai Denetimi:
      pdksRecordedOvertimeHours: 32.5, // PDKS'de fiilen yaptığı saat
      payrollPaidOvertimeHours: 8.0,   // Taşeronun bordroda gösterdiği saat
      missingOvertimeHours: 24.5,     // 24.5 Saat gasp edilmiş!
      missingOvertimeAmountEst: 6860,
      overtimeCompliance: 'PARTIAL_PAID',
      ocrConfidence: 99.1,
      ocrBoundingBoxes: {
        netPayBox: 'Bordro Alt Toplam: [NET ÖDENEN: 37.440,00 TL | IBAN: TR84 0006 ...]',
        overtimeBox: 'Ek Kazançlar: [FM 8.0 SAAT: 2.240,00 TL]',
        ibanBox: 'Banka Transfer Referansı: Garanti BBVA #4992104'
      },
      auditStatus: 'UYUSMAZLIK_IHTAR',
      auditNotes: 'Yücel Boru Hakediş birimi 52.000 ₺ iken personele 37.440 ₺ yansıtılmış. Ayrıca PDKS 32.5 saat FM varken sadece 8 saat ödenmiş. Taşerona ihtarname iletildi.'
    },
    {
      id: 'aud-202',
      workerId: 'wrk-103',
      workerName: 'Serdar Alkan',
      tcNumber: '44210984712',
      subcontractorId: 'sub-2',
      subcontractorName: 'Körfez Mekanik & Borulama San. Tic.',
      period: '2026 / 09',
      uploadDate: '2026-10-04 11:28',
      payrollFileName: 'korfez_bordro_serdar_alkan_2026_09.pdf',
      fileSizeKb: 388,
      sapAgreedRate: 52000,
      aiExtractedGrossPay: 48000,
      aiExtractedNetPay: 39520, // 76 birim! (%24 Kesinti)
      spreadAmount: 12480,
      spreadPercentage: 24.0,
      marginRiskLevel: 'HIGH_RISK_CUT',
      pdksRecordedOvertimeHours: 24.0,
      payrollPaidOvertimeHours: 0.0, // Hiç ödenmemiş!
      missingOvertimeHours: 24.0,
      missingOvertimeAmountEst: 6240,
      overtimeCompliance: 'UNPAID', // Kırmızı
      ocrConfidence: 98.6,
      ocrBoundingBoxes: {
        netPayBox: 'Net Ücret: 39.520,00 TL',
        overtimeBox: 'Fazla Mesai Satırı: 0,00 TL (Tahakkuk yok)',
        ibanBox: 'IBAN: TR12 0001 ...'
      },
      auditStatus: 'UYUSMAZLIK_IHTAR',
      auditNotes: 'PDKS verisinde 24 saat gece vardiyası fazla mesaisi olmasına rağmen bordroda 0 saat gösterilmiş. Hakediş kesintisi %24 seviyesinde.'
    },
    {
      id: 'aud-203',
      workerId: 'wrk-101',
      workerName: 'Ahmet Kenan Yavuz',
      tcNumber: '34892184912',
      subcontractorId: 'sub-1',
      subcontractorName: 'Demiray Endüstriyel Montaj A.Ş.',
      period: '2026 / 09',
      uploadDate: '2026-10-03 16:10',
      payrollFileName: 'demiray_bordro_ahmet_yavuz_2026_09.pdf',
      fileSizeKb: 520,
      sapAgreedRate: 54000,
      aiExtractedGrossPay: 58500,
      aiExtractedNetPay: 48600, // 90 birim (Yasal ve taşeron genel gider payı dahilinde uyumlu)
      spreadAmount: 5400,
      spreadPercentage: 10.0,
      marginRiskLevel: 'NORMAL',
      pdksRecordedOvertimeHours: 18.0,
      payrollPaidOvertimeHours: 18.0, // Birebir ödenmiş!
      missingOvertimeHours: 0.0,
      missingOvertimeAmountEst: 0,
      overtimeCompliance: 'COMPLIANT', // Yeşil
      ocrConfidence: 99.8,
      ocrBoundingBoxes: {
        netPayBox: 'Net Ödenen: 48.600,00 TL (Banka Ekstresi ile Uyumlu)',
        overtimeBox: 'FM (18.0 SAAT x 1.5): 5.400,00 TL',
        ibanBox: 'İş Bankası Havalesi #881920'
      },
      auditStatus: 'ONAYLANDI',
      auditNotes: 'Bordro ve PDKS kayıtları birebir örtüşüyor. Hakediş kırım marjı şirket sözleşme sınırları dahilinde.'
    },
    {
      id: 'aud-204',
      workerId: 'wrk-104',
      workerName: 'Gökhan Çavuşoğlu',
      tcNumber: '58190283741',
      subcontractorId: 'sub-3',
      subcontractorName: 'Atlas Çelik & Ağır Bakım Ltd.',
      period: '2026 / 09',
      uploadDate: '2026-10-02 14:05',
      payrollFileName: 'atlas_bordro_gokhan_cavus_2026_09.pdf',
      fileSizeKb: 450,
      sapAgreedRate: 54000,
      aiExtractedGrossPay: 57200,
      aiExtractedNetPay: 47520,
      spreadAmount: 6480,
      spreadPercentage: 12.0,
      marginRiskLevel: 'NORMAL',
      pdksRecordedOvertimeHours: 6.0,
      payrollPaidOvertimeHours: 6.0,
      missingOvertimeHours: 0.0,
      missingOvertimeAmountEst: 0,
      overtimeCompliance: 'COMPLIANT',
      ocrConfidence: 99.4,
      ocrBoundingBoxes: {
        netPayBox: 'Net Ücret: 47.520,00 TL',
        overtimeBox: 'Fazla Çalışma (6 Saat): 1.800,00 TL',
        ibanBox: 'Ziraat Bankası TR55 0001 ...'
      },
      auditStatus: 'ONAYLANDI',
      auditNotes: 'Uyumlu bordro ve eksiksiz FM ödemesi.'
    },
    {
      id: 'aud-205',
      workerId: 'wrk-105',
      workerName: 'Emre Karabulut',
      tcNumber: '28471920384',
      subcontractorId: 'sub-1',
      subcontractorName: 'Demiray Endüstriyel Montaj A.Ş.',
      period: '2026 / 09',
      uploadDate: '2026-10-05 09:40',
      payrollFileName: 'demiray_bordro_emre_kara_2026_09.pdf',
      fileSizeKb: 410,
      sapAgreedRate: 54000,
      aiExtractedGrossPay: 51000,
      aiExtractedNetPay: 42120, // %22 fark
      spreadAmount: 11880,
      spreadPercentage: 22.0,
      marginRiskLevel: 'ELEVATED', // Orta/Yüksek Risk
      pdksRecordedOvertimeHours: 14.5,
      payrollPaidOvertimeHours: 8.0,
      missingOvertimeHours: 6.5,
      missingOvertimeAmountEst: 1820,
      overtimeCompliance: 'PARTIAL_PAID',
      ocrConfidence: 97.9,
      ocrBoundingBoxes: {
        netPayBox: 'Net Ele Geçen: 42.120,00 TL',
        overtimeBox: 'Mesai (8 Saat): 2.240,00 TL',
        ibanBox: 'Vakıfbank TR99 ...'
      },
      auditStatus: 'IK_INCELEMEDE',
      auditNotes: '6.5 saatlik eksik mesai tahakkuku ve sözleşme marjı üzerindeki fark inceleniyor.'
    },
    {
      id: 'aud-206',
      workerId: 'wrk-106',
      workerName: 'Volkan Şimşek',
      tcNumber: '61294817203',
      subcontractorId: 'sub-4',
      subcontractorName: 'Teknik İskele & Kumlama Hizmetleri',
      period: '2026 / 09',
      uploadDate: '2026-10-05 15:30',
      payrollFileName: 'teknik_bordro_volkan_simsek_2026_09.pdf',
      fileSizeKb: 395,
      sapAgreedRate: 48000,
      aiExtractedGrossPay: 50400,
      aiExtractedNetPay: 41760,
      spreadAmount: 6240,
      spreadPercentage: 13.0,
      marginRiskLevel: 'NORMAL',
      pdksRecordedOvertimeHours: 0.0,
      payrollPaidOvertimeHours: 0.0,
      missingOvertimeHours: 0.0,
      missingOvertimeAmountEst: 0,
      overtimeCompliance: 'COMPLIANT',
      ocrConfidence: 98.2,
      ocrBoundingBoxes: {
        netPayBox: 'Net Ödeme: 41.760,00 TL',
        overtimeBox: 'FM Yok (0 Saat)',
        ibanBox: 'Yapı Kredi TR32 ...'
      },
      auditStatus: 'ONAYLANDI',
      auditNotes: 'Normal mesai ödemesi doğrulanmıştır.'
    }
  ];

  // BehaviorSubjects for reactive state
  private companiesSubject = new BehaviorSubject<SubcontractorCompany[]>(this.mockCompanies);
  private workersSubject = new BehaviorSubject<WorkerPersona[]>(this.mockWorkers);
  private pdksSubject = new BehaviorSubject<PdksRecord[]>(this.mockPdksRecords);
  private auditsSubject = new BehaviorSubject<PayrollAudit[]>(this.mockPayrollAudits);
  private isSapSyncingSubject = new BehaviorSubject<boolean>(false);

  companies$ = this.companiesSubject.asObservable();
  workers$ = this.workersSubject.asObservable();
  pdks$ = this.pdksSubject.asObservable();
  audits$ = this.auditsSubject.asObservable();
  isSapSyncing$ = this.isSapSyncingSubject.asObservable();

  // SAP Canlı Eşitleme Simülasyonu (RFC / REST API)
  syncFromSap(): Observable<boolean> {
    this.isSapSyncingSubject.next(true);
    return of(true).pipe(
      delay(1800),
      tap(() => {
        const updated = this.companiesSubject.value.map(c => ({
          ...c,
          lastSapSyncTime: `Az önce (${new Date().toLocaleTimeString('tr-TR')} - SAP RFC Canlı Eşitlendi)`
        }));
        this.companiesSubject.next(updated);
        this.isSapSyncingSubject.next(false);
      })
    );
  }

  // Kişilerin PDKS kayıtlarını taşeron firmaya iletme aksiyonu
  sendPdksToSubcontractor(subcontractorName?: string): Observable<number> {
    const list = this.pdksSubject.value;
    const now = new Date().toLocaleString('tr-TR');
    let count = 0;

    const updated = list.map(item => {
      if (!subcontractorName || item.subcontractorName === subcontractorName) {
        if (!item.transferredToVendor) {
          count++;
        }
        return {
          ...item,
          transferredToVendor: true,
          transferredAt: now
        };
      }
      return item;
    });

    this.pdksSubject.next(updated);
    return of(count);
  }

  // Yeni Bordro Yükleme & Yapay Zeka OCR Analizi
  analyzeAndAddPayroll(
    workerId: string,
    period: string,
    fileName: string,
    simulatedNetPay: number,
    simulatedOvertimeHours: number
  ): Observable<PayrollAudit> {
    const worker = this.mockWorkers.find(w => w.id === workerId);
    const company = this.mockCompanies.find(c => c.id === worker?.subcontractorId);
    
    // SAP Referans Tutarı
    const sapRate = company ? company.avgSapRatePerWorker : 50000;
    const spread = sapRate - simulatedNetPay;
    const spreadPercent = Number(((spread / sapRate) * 100).toFixed(1));

    // PDKS'de çalışanın kayıtlı fazla mesaisi (örnek simülasyon)
    const pdksRec = this.mockPdksRecords.find(p => p.workerId === workerId);
    const pdksOvertime = pdksRec ? (pdksRec.overtimeHours * 6) : 18.0; // aylık simüle saat
    const missingOtHours = Math.max(0, pdksOvertime - simulatedOvertimeHours);
    const hourlyEst = simulatedNetPay / 180;
    const missingAmt = Math.round(missingOtHours * hourlyEst * 1.5);

    let otComp: PayrollAudit['overtimeCompliance'] = 'COMPLIANT';
    if (missingOtHours > 0 && simulatedOvertimeHours > 0) otComp = 'PARTIAL_PAID';
    else if (missingOtHours > 0 && simulatedOvertimeHours === 0) otComp = 'UNPAID';

    let risk: PayrollAudit['marginRiskLevel'] = 'NORMAL';
    if (spreadPercent >= 20 || missingOtHours > 10) risk = 'HIGH_RISK_CUT';
    else if (spreadPercent >= 15 || missingOtHours > 4) risk = 'ELEVATED';

    const newAudit: PayrollAudit = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      workerId: workerId,
      workerName: worker ? worker.fullName : 'Bilinmeyen Çalışan',
      tcNumber: worker ? worker.tcNumber : '00000000000',
      subcontractorId: company ? company.id : 'sub-1',
      subcontractorName: company ? company.name : 'Alt Taşeron',
      period: period,
      uploadDate: new Date().toLocaleString('tr-TR'),
      payrollFileName: fileName,
      fileSizeKb: Math.floor(Math.random() * 300) + 250,
      sapAgreedRate: sapRate,
      aiExtractedGrossPay: Math.round(simulatedNetPay * 1.25),
      aiExtractedNetPay: simulatedNetPay,
      spreadAmount: spread,
      spreadPercentage: spreadPercent,
      marginRiskLevel: risk,
      pdksRecordedOvertimeHours: pdksOvertime,
      payrollPaidOvertimeHours: simulatedOvertimeHours,
      missingOvertimeHours: missingOtHours,
      missingOvertimeAmountEst: missingAmt,
      overtimeCompliance: otComp,
      ocrConfidence: 98.9,
      ocrBoundingBoxes: {
        netPayBox: `AI Tespit Edilen Net Ücret: ${simulatedNetPay.toLocaleString('tr-TR')} ₺`,
        overtimeBox: `Bordro Mesai Saati: ${simulatedOvertimeHours} Saat`,
        ibanBox: 'Banka IBAN Doğrulandı'
      },
      auditStatus: risk === 'HIGH_RISK_CUT' ? 'UYUSMAZLIK_IHTAR' : (risk === 'ELEVATED' ? 'IK_INCELEMEDE' : 'ONAYLANDI'),
      auditNotes: risk === 'HIGH_RISK_CUT'
        ? `Yapay Zeka Uyarısı: Yücel Boru hakedişi ile taşeron net ödemesi arasında %${spreadPercent} makas ve ${missingOtHours} saat eksik mesai tespit edildi.`
        : 'Yapay zeka taraması tamamlandı, değerler sözleşme sınırlarında.'
    };

    return of(newAudit).pipe(
      delay(2200), // AI OCR analiz simülasyon gecikmesi
      tap(audit => {
        const current = this.auditsSubject.value;
        this.auditsSubject.next([audit, ...current]);
      })
    );
  }

  // Denetim durumunu güncelleme (İhtar Gönder, Onayla, Not Ekle)
  updateAuditStatus(id: string, status: PayrollAudit['auditStatus'], note?: string): void {
    const list = this.auditsSubject.value.map(item => {
      if (item.id === id) {
        return {
          ...item,
          auditStatus: status,
          auditNotes: note || item.auditNotes
        };
      }
      return item;
    });
    this.auditsSubject.next(list);
  }

  // Taşeron Personel Ekleme
  addWorker(worker: Partial<WorkerPersona>): void {
    const id = `wrk-${Date.now().toString().slice(-4)}`;
    const fullWorker: WorkerPersona = {
      id,
      subcontractorId: worker.subcontractorId || 'sub-1',
      subcontractorName: worker.subcontractorName || 'Demiray Endüstriyel Montaj A.Ş.',
      tcNumber: worker.tcNumber || '10000000000',
      fullName: worker.fullName || 'Yeni Çalışan',
      role: worker.role || 'Saha Personeli',
      plant: worker.plant || 'Dilovası Çelik Boru Tesisleri',
      entryDate: new Date().toISOString().slice(0, 10),
      sgkStatus: 'AKTIF_SIGORTALI',
      bloodGroup: worker.bloodGroup || 'A Rh+',
      emergencyContact: worker.emergencyContact || 'Aile Yakını',
      emergencyPhone: worker.emergencyPhone || '+90 555 000 0000',
      pdksBadgeId: `YCL-PDKS-${Math.floor(Math.random() * 9000 + 1000)}`,
      accessStatus: 'ALLOWED',
      complianceRate: 100,
      companyPaidRate: 52000,
      workerActualPay: 44200,
      spreadAmount: -7800,
      spreadPercentage: -15.0,
      marginRiskLevel: 'NORMAL',
      pdksOvertimeHours: 0,
      paidOvertimeHours: 0,
      missingOvertimeHours: 0,
      missingOvertimeAmount: 0,
      documents: [
        {
          id: `doc-${Date.now()}`,
          type: 'SAGLIK_RAPORU',
          title: 'Ağır ve Tehlikeli İşler Sağlık Raporu',
          documentNumber: `SR-${Date.now().toString().slice(-4)}`,
          issueDate: new Date().toISOString().slice(0, 10),
          expiryDate: '2027-10-01',
          status: 'VALID',
          issuer: 'Kocaeli OSGB'
        },
        {
          id: `doc-${Date.now() + 1}`,
          type: 'ISG_16_SAAT',
          title: '16 Saat Temel İSG Eğitimi',
          documentNumber: `ISG-${Date.now().toString().slice(-4)}`,
          issueDate: new Date().toISOString().slice(0, 10),
          expiryDate: '2027-10-01',
          status: 'VALID',
          issuer: 'Yücel Boru Akademi'
        }
      ]
    };

    this.workersSubject.next([fullWorker, ...this.workersSubject.value]);
  }
}
