export interface SubcontractorCompany {
  id: string;
  sapVendorId: string;       // SAP Satıcı Kodu (örn: SAP-VND-84920)
  name: string;              // Taşeron Firma Ticari Unvanı
  taxNumber: string;         // VKN
  plant: string;             // Yücel Boru Fabrika / Tesis (Gebze 1, Dilovası, İskenderun ERW vb.)
  contractCode: string;      // SAP Sözleşme No
  contractStartDate: string;
  contractEndDate: string;
  supervisorName: string;    // Şantiye Amiri / Yetkili
  supervisorPhone: string;
  activeWorkerCount: number;
  monthlySapBudget: number;  // SAP Aylık Hakediş Bütçesi (TL)
  avgSapRatePerWorker: number; // Yücel Boru SAP Kişi Başı Birim Hakediş (Referans 100)
  complianceScore: number;   // Uyum Skoru (0-100)
  lastSapSyncTime: string;
  status: 'ACTIVE' | 'AUDIT_HOLD' | 'BLOCKED';
}

export interface WorkerDocument {
  id: string;
  type: 'SAGLIK_RAPORU' | 'MYK_BELGESI' | 'ISG_16_SAAT' | 'YUKSEKTE_CALISMA' | 'SGK_ISE_GIRIS' | 'ADLI_SICIL';
  title: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'MISSING';
  issuer: string;
  fileUrl?: string;
}

export interface WorkerPersona {
  id: string;
  subcontractorId: string;
  subcontractorName: string;
  tcNumber: string;
  fullName: string;
  role: string;               // Görev: Sertifikalı Boru Kaynakçısı, Tavan Vinç Operatörü, Mekanikçi vs.
  plant: string;              // Görev Yaptığı Tesis
  entryDate: string;
  sgkStatus: 'AKTIF_SIGORTALI' | 'INCELEMEDE' | 'GIRIS_BEKLENIYOR';
  bloodGroup: string;
  emergencyContact: string;
  emergencyPhone: string;
  pdksBadgeId: string;
  accessStatus: 'ALLOWED' | 'SUSPENDED_ISG' | 'SUSPENDED_PAYROLL';
  complianceRate: number;     // Özlük dosya tamlığı %
  documents: WorkerDocument[];
  notes?: string;
}

export interface PdksRecord {
  id: string;
  workerId: string;
  workerName: string;
  subcontractorName: string;
  tcNumber: string;
  date: string;
  shift: string;              // 08:00 - 16:00 / 16:00 - 24:00
  firstEntryTime: string;     // Turnike ilk okutma
  lastExitTime: string;       // Turnike son okutma
  actualHours: number;        // Fiili Sahada Kalış Saati
  regularHours: number;       // Normal Mesai Saati
  overtimeHours: number;      // PDKS Fazla Mesai Saati (FM)
  turnstileGate: string;      // Turnike Kapı Bilgisi (Gebze Kapı 2 ERW)
  status: 'NORMAL' | 'OVERTIME' | 'LATE' | 'INCOMPLETE';
  transferredToVendor: boolean; // Taşerona iletildi mi?
  transferredAt?: string;
}

export interface PayrollAudit {
  id: string;
  workerId: string;
  workerName: string;
  tcNumber: string;
  subcontractorId: string;
  subcontractorName: string;
  period: string;             // Dönem: örn. 2026/09
  uploadDate: string;
  payrollFileName: string;
  fileSizeKb: number;

  // SAP Hakediş Referansı (Yücel Boru'nun taşerona işçi için ayırdığı hak ediş)
  sapAgreedRate: number;      // örn: 48.000 TL (Hedef 100 birim)
  
  // AI OCR ile Bordrodan Okunan Değerler
  aiExtractedGrossPay: number;
  aiExtractedNetPay: number;    // Taşeronun personele bordroda yatırdığı Net Ücret (ör. 36.500 TL - 76 birim)
  
  // Makas & Kırım Analizi
  spreadAmount: number;         // sapAgreedRate - aiExtractedNetPay (örn: 11.500 TL)
  spreadPercentage: number;     // %24.0 fark
  marginRiskLevel: 'NORMAL' | 'ELEVATED' | 'HIGH_RISK_CUT'; // "100 veriyorum, 80 veriyor" tespiti

  // Fazla Mesai Çapraz Denetimi
  pdksRecordedOvertimeHours: number; // PDKS'de gerçekte yaptığı saat (ör: 22.0 saat)
  payrollPaidOvertimeHours: number;  // Bordroda taşeronun ödediği saat (ör: 6.0 saat)
  missingOvertimeHours: number;      // Eksik saat (16.0 saat eksik!)
  missingOvertimeAmountEst: number;  // Tahmini hak kaybı tutarı (TL)
  overtimeCompliance: 'COMPLIANT' | 'PARTIAL_PAID' | 'UNPAID' | 'EXCESS';

  // AI OCR Güven & Doğrulama
  ocrConfidence: number;        // örn. %98.7
  ocrBoundingBoxes?: {
    netPayBox: string;
    overtimeBox: string;
    ibanBox: string;
  };

  // Denetim Aksiyonu
  auditStatus: 'ONAYLANDI' | 'UYUSMAZLIK_IHTAR' | 'IK_INCELEMEDE' | 'BEKLEMEDE';
  auditNotes?: string;
}
