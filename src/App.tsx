import React, { useState, useEffect, useRef } from 'react';
import { Printer, Trash2, Save, Info, CheckCircle2, FileText, ChevronLeft, Calendar, User, Home, Megaphone, Clock, Volume2, CreditCard, PenTool } from 'lucide-react';

// --- Utility Functions ---

const toThaiNumerals = (input: string | number | undefined | null) => {
  if (input === undefined || input === null || input === '') return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return input.toString().replace(/[0-9]/g, (digit) => thaiDigits[parseInt(digit)]);
};

const toThaiDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear() + 543;
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  return toThaiNumerals(`${day} ${thaiMonths[month]} พ.ศ. ${year}`);
};

const toThaiDateShort = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear() + 543;
  return toThaiNumerals(`${day}/${month}/${year}`);
};

const thaiBahtText = (num: number): string => {
  if (isNaN(num) || num === null) return '';
  if (num === 0) return 'ศูนย์บาทถ้วน';

  const numbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const convert = (n: number) => {
    let res = '';
    const s = n.toString();
    for (let i = 0; i < s.length; i++) {
      const digit = parseInt(s[s.length - 1 - i]);
      if (digit !== 0) {
        if (i % 6 === 1 && digit === 1) res = 'สิบ' + res;
        else if (i % 6 === 1 && digit === 2) res = 'ยี่สิบ' + res;
        else if (i % 6 === 0 && digit === 1 && i > 0) res = 'เอ็ด' + res;
        else if (i % 6 === 0 && digit === 1 && s.length > 1 && i === 0) res = 'เอ็ด' + res;
        else res = numbers[digit] + units[i % 6] + res;
      }
      if (i % 6 === 5 && i < s.length - 1) res = 'ล้าน' + res;
    }
    return res;
  };

  const baht = Math.floor(num);
  const satang = Math.round((num - baht) * 100);

  let result = '';
  if (baht > 0) result += convert(baht) + 'บาท';
  if (satang > 0) result += convert(satang) + 'สตางค์';
  else result += 'ถ้วน';

  return result;
};

// --- Components for Document Layout ---

const DocField = ({ value, placeholder, minWidth = '50px', className = "", noLine = false }: { value: any, placeholder: string, minWidth?: string, className?: string, noLine?: boolean }) => {
  const displayValue = value ? toThaiNumerals(value) : '';
  const hasValue = !!displayValue;
  const showBorder = !noLine;
  
  return (
    <span 
      className={`inline-block text-center align-bottom mx-1 px-1 min-h-[24px] max-w-full break-words ${showBorder && hasValue ? 'border-b border-dotted border-black/40' : ''} ${className}`} 
      style={{ minWidth }}
    >
      {hasValue ? displayValue : <span className="text-gray-300 print:text-black">{placeholder}</span>}
    </span>
  );
};

const SignatureBlock = ({ name, position, date, label = "(ลงชื่อ)", subLabel = "ผู้ยื่นคำร้อง", showDate = true, signatureImage, showSignatureImage = true }: { name: string, position?: string, date?: string, label?: string, subLabel?: string, showDate?: boolean, signatureImage?: string, showSignatureImage?: boolean }) => {
  const displayImage = (showSignatureImage && signatureImage) ? signatureImage : "";

  return (
    <div className="flex flex-col items-center text-center space-y-0 w-[300px] relative">
      <div className="relative w-full h-[80px] flex flex-col items-center justify-center">
        {/* Signature Image - centered and positioned above the dots line */}
        {displayImage && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <img 
              src={displayImage} 
              alt="" 
              className="max-h-[120px] max-w-[220px] object-contain block translate-y-[-15px] opacity-100 visible print:block"
            />
          </div>
        )}
        <div className="z-10 mt-8 w-full relative">
          <span className="text-[16pt]">{label} ...................................................... {subLabel}</span>
        </div>
      </div>
      <p className="mt-1 text-[16pt] relative z-10">( {toThaiNumerals(name) || '................................................'} )</p>
      {position && <p className="mt-1 text-[16pt] relative z-10">{toThaiNumerals(position)}</p>}
      {showDate && (
        <div className="mt-1 flex justify-center items-center text-[16pt] relative z-10">
          <span>วันที่</span>
          <DocField value={date ? toThaiDateShort(date) : ''} placeholder="........./........../.........." minWidth="120px" noLine />
        </div>
      )}
    </div>
  );
};

const DEFAULT_FORM_DATA = {
  docDate: '',
  officerDate: '',
  applicantName: '',
  applicantAge: '',
  applicantEthnicity: 'ไทย',
  applicantNationality: 'ไทย',
  addressNo: '',
  addressMoo: '',
  addressRoad: '',
  addressTambon: 'ป่งไฮ',
  addressAmphoe: 'เซกา',
  addressProvince: 'บึงกาฬ',
  addressPhone: '',
  
  adsPurpose: '',
  adsPurpose2: '',
  adsPurpose3: '',
  adsAt: '',
  adsNo: '',
  adsMoo: '',
  adsTambon: 'ป่งไฮ',
  adsAmphoe: 'เซกา',
  adsProvince: 'บึงกาฬ',
  
  adsDuration: '',
  adsStartDate: '',
  adsEndDate: '',
  adsStartTime: '08:30',
  adsEndTime: '16:30',
  
  amplifierRegNo: '',
  micRegNo: '',
  recorderRegNo: '',
  
  licenseNo: '',
  feeAmount: '',
  applicantSignature: '',
  officerName: 'ทศพล จักสาน',
  officerPosition: 'นักจัดการงานเทศกิจชำนาญการ',
  officerSignature: '',
};

export default function App() {
  const [viewMode, setViewMode] = useState<'form' | 'preview' | 'officer-settings'>('form');
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [officerSettings, setOfficerSettings] = useState({
    name: 'ทศพล จักสาน',
    position: 'นักจัดการงานเทศกิจชำนาญการ',
    signature: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('khaosor1_form_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({ ...DEFAULT_FORM_DATA, ...parsed });
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }

    const savedOfficer = localStorage.getItem('officer_signature_data');
    if (savedOfficer) {
      try {
        setOfficerSettings(JSON.parse(savedOfficer));
      } catch (e) {
        console.error("Failed to parse officer data", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('khaosor1_form_data', JSON.stringify(formData));
    setIsSaved(true);
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('officer_signature_data', JSON.stringify(officerSettings));
  }, [officerSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value ?? '' }));
    }
  };

  const handleClear = () => {
    if (window.confirm('ต้องการล้างข้อมูลทั้งหมดหรือไม่?')) {
      setFormData(DEFAULT_FORM_DATA);
      localStorage.setItem('khaosor1_form_data', JSON.stringify(DEFAULT_FORM_DATA));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, applicantSignature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOfficerSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOfficerSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleOfficerSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOfficerSettings(prev => ({ ...prev, signature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearOfficerSignature = () => {
    setOfficerSettings(prev => ({ ...prev, signature: '' }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePreview = () => {
    if (!formData.applicantName) {
      alert('กรุณากรอกชื่อ-นามสกุลผู้ยื่นคำร้อง');
      return;
    }
    setViewMode('preview');
    window.scrollTo(0, 0);
  };

  const handleBackToEdit = () => {
    setViewMode('form');
    window.scrollTo(0, 0);
  };

  const displayValue = (val: string, placeholder = '..........................................') => {
    return val ? toThaiNumerals(val) : <span className="text-gray-300 print:text-transparent">{placeholder}</span>;
  };

  const displayRawValue = (val: string, placeholder = '..........................................') => {
    return val ? toThaiNumerals(val) : <span className="text-gray-300 print:text-transparent">{placeholder}</span>;
  };

  const displayMoney = (val: string, placeholder = '................') => {
    if (!val) return <span className="text-gray-300 print:text-transparent">{placeholder}</span>;
    const num = Number(val);
    if (isNaN(num)) return toThaiNumerals(val);
    const formatted = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return toThaiNumerals(formatted);
  };

  const Navbar = () => (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex gap-1 md:gap-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setViewMode('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                viewMode === 'form' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              📝 กรอกข้อมูลคำร้อง
            </button>
            <button
              onClick={() => setViewMode('officer-settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                viewMode === 'officer-settings' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <PenTool className="w-5 h-5" />
              ✍️ จัดการลายเซ็นเจ้าหน้าที่
            </button>
          </div>
          {viewMode === 'form' && isSaved && (
            <div className="hidden md:flex items-center gap-2 text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 animate-pulse">
              <CheckCircle2 className="w-3 h-3" />
              บันทึกแล้ว
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {(viewMode === 'form' || viewMode === 'officer-settings') && <Navbar />}
      
      {viewMode === 'form' ? (
        /* --- FORM VIEW --- */
        <div className="max-w-4xl mx-auto py-8 px-4 md:px-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden transition-all">
            <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <FileText className="w-32 h-32 rotate-12" />
              </div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold mb-2 tracking-tight">ระบบขออนุญาตใช้เครื่องขยายเสียง</h1>
                    <p className="text-blue-100 font-medium text-lg flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                      เทศบาลตำบลป่งไฮ จ.บึงกาฬ
                    </p>
                  </div>
                  {isSaved && (
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-sm font-bold flex items-center gap-2 border border-white/30 animate-pulse">
                      <CheckCircle2 className="w-4 h-4 text-blue-200" />
                      ระบบบันทึกข้อมูลอัตโนมัติแล้ว
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-10 space-y-12">
              {/* Section: Document Date */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-xl">
                  <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h2>📄 ข้อมูลคำร้อง</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600 ml-1">วันที่ต้องการระบุในเอกสาร *</label>
                    <input 
                      type="date" 
                      name="docDate" 
                      value={formData.docDate || ''} 
                      onChange={handleChange} 
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" 
                    />
                  </div>
                </div>
              </section>

              {/* Section: Applicant */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-xl">
                  <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                    <User className="w-6 h-6" />
                  </div>
                  <h2>👤 ข้อมูลผู้ยื่นคำร้อง</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-bold text-slate-600 ml-1">ชื่อ-นามสกุล ผู้ยื่นคำร้อง *</label>
                    <input 
                      type="text" 
                      name="applicantName" 
                      value={formData.applicantName || ''} 
                      onChange={handleChange} 
                      placeholder="เช่น นายป่งไฮ ใจดี" 
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600 ml-1">อายุ (ปี)</label>
                    <input 
                      type="number" 
                      name="applicantAge" 
                      value={formData.applicantAge || ''} 
                      onChange={handleChange} 
                      placeholder="ระบุตัวเลข" 
                      className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600 ml-1">เชื้อชาติ</label>
                      <input 
                        type="text" 
                        name="applicantEthnicity" 
                        value={formData.applicantEthnicity || ''} 
                        onChange={handleChange} 
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600 ml-1">สัญชาติ</label>
                      <input 
                        type="text" 
                        name="applicantNationality" 
                        value={formData.applicantNationality || ''} 
                        onChange={handleChange} 
                        className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" 
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 mt-4">
                    <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                      <Home className="w-5 h-5 text-blue-500" />
                      <h3>🏠 ที่อยู่ผู้ยื่นคำร้อง</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">บ้านเลขที่</label>
                        <input type="text" name="addressNo" value={formData.addressNo || ''} onChange={handleChange} placeholder="123" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">หมู่ที่</label>
                        <input type="text" name="addressMoo" value={formData.addressMoo || ''} onChange={handleChange} placeholder="5" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">ถนน</label>
                        <input type="text" name="addressRoad" value={formData.addressRoad || ''} onChange={handleChange} placeholder="ศรีป่งไฮ" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">ตำบล</label>
                        <input type="text" name="addressTambon" value={formData.addressTambon || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">อำเภอ</label>
                        <input type="text" name="addressAmphoe" value={formData.addressAmphoe || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">จังหวัด</label>
                        <input type="text" name="addressProvince" value={formData.addressProvince || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">โทรศัพท์</label>
                        <input type="text" name="addressPhone" value={formData.addressPhone || ''} onChange={handleChange} placeholder="08x-xxxxxxx" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: Advertising Details */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-xl">
                  <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h2>📢 รายละเอียดการโฆษณา</h2>
                </div>
                <div className="grid grid-cols-1 gap-8 p-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-600 ml-1">ความประสงค์จะใช้เครื่องเพื่อทำการโฆษณาเรื่อง (ระบุได้ 3 บรรทัด)</label>
                    <input type="text" name="adsPurpose" value={formData.adsPurpose || ''} onChange={handleChange} placeholder="บรรทัดที่ 1: เช่น จัดงานบวช ณ วัดป่งไฮ" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm font-medium" />
                    <input type="text" name="adsPurpose2" value={formData.adsPurpose2 || ''} onChange={handleChange} placeholder="บรรทัดที่ 2: เช่น มีการแสดงดนตรีและรถแห่" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm font-medium" />
                    <input type="text" name="adsPurpose3" value={formData.adsPurpose3 || ''} onChange={handleChange} placeholder="บรรทัดที่ 3: (ถ้ามี)" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm font-medium" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-600 ml-1">สถานที่ติดตั้งเครื่อง (ณ)</label>
                      <input type="text" name="adsAt" value={formData.adsAt || ''} onChange={handleChange} placeholder="เช่น วัดป่งไฮราษฎร์บำรุง" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm font-medium" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 ml-1">เลขที่</label>
                        <input type="text" name="adsNo" value={formData.adsNo || ''} onChange={handleChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 ml-1">หมู่ที่</label>
                        <input type="text" name="adsMoo" value={formData.adsMoo || ''} onChange={handleChange} className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm font-medium" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">ตำบล</label>
                      <input type="text" name="adsTambon" value={formData.adsTambon || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none shadow-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">อำเภอ</label>
                      <input type="text" name="adsAmphoe" value={formData.adsAmphoe || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none shadow-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">จังหวัด</label>
                      <input type="text" name="adsProvince" value={formData.adsProvince || ''} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg outline-none shadow-sm" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <h3>📅 ระยะเวลาและวันเวลา</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 ml-1">จำนวนวัน (วัน)</label>
                        <input type="number" name="adsDuration" value={formData.adsDuration || ''} onChange={handleChange} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 ml-1">ตั้งแต่วันที่</label>
                        <input type="date" name="adsStartDate" value={formData.adsStartDate || ''} onChange={handleChange} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 ml-1">ถึงวันที่</label>
                        <input type="date" name="adsEndDate" value={formData.adsEndDate || ''} onChange={handleChange} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 ml-1">ตั้งแต่เวลา</label>
                        <input type="time" name="adsStartTime" value={formData.adsStartTime || ''} onChange={handleChange} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-600 ml-1">ถึงเวลา</label>
                        <input type="time" name="adsEndTime" value={formData.adsEndTime || ''} onChange={handleChange} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section: Equipment Details */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-xl">
                  <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <h2>🔊 รายละเอียดเครื่องขยายเสียง</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600 ml-1 text-center md:text-left">ทะเบียนเครื่องขยายเสียง</label>
                    <input type="text" name="amplifierRegNo" value={formData.amplifierRegNo || ''} onChange={handleChange} placeholder="เลขทะเบียนเครื่อง" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600 ml-1 text-center md:text-left">ทะเบียนไมโครโฟน</label>
                    <input type="text" name="micRegNo" value={formData.micRegNo || ''} onChange={handleChange} placeholder="เลขทะเบียนไมค์" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600 ml-1 text-center md:text-left">ทะเบียนเครื่องบันทึกเสียง</label>
                    <input type="text" name="recorderRegNo" value={formData.recorderRegNo || ''} onChange={handleChange} placeholder="เลขทะเบียนเครื่องบันทึก" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none shadow-sm" />
                  </div>
                </div>
              </section>

              {/* Section: License */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-xl">
                  <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2>💰 ข้อมูลใบอนุญาตและค่าธรรมเนียม</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600 ml-1">ใบอนุญาตเลขที่ (ถ้าทราบ)</label>
                    <input type="text" name="licenseNo" value={formData.licenseNo || ''} onChange={handleChange} placeholder="รอกรอกโดยเจ้าหน้าที่" className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl outline-none shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-600 ml-1 text-blue-700">ค่าธรรมเนียม (บาท) *</label>
                    <div className="relative">
                      <input type="number" name="feeAmount" value={formData.feeAmount || ''} onChange={handleChange} placeholder="0.00" className="w-full pl-10 pr-5 py-3.5 bg-white border border-blue-200 rounded-xl focus:border-blue-500 outline-none shadow-sm font-bold text-blue-600" />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold">฿</div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={handlePreview}
                  className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black py-5 px-8 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-[0.98] text-lg uppercase tracking-wider"
                >
                  <FileText className="w-6 h-6" />
                  ดูตัวอย่างและพิมพ์เอกสาร
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-500 font-bold py-5 px-8 rounded-2xl transition-all active:scale-[0.98] text-lg"
                >
                  <Trash2 className="w-6 h-6" />
                  ล้างข้อมูลทั้งหมด
                </button>
              </div>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-5">
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600 shrink-0 self-start">
                  <Info className="w-6 h-6" />
                </div>
                <div className="text-sm text-amber-900 leading-relaxed">
                  <p className="font-extrabold mb-1.5 text-base">ℹ️ คำแนะนำในการใช้งาน:</p>
                  <p className="font-medium opacity-80 italic">ระบบจะจัดเก็บข้อมูลไว้ใน Browser ของคุณเท่านั้น ไม่มีการส่งข้อมูลไปยัง Server ข้อมูลทั้งหมดจะปลอดภัยและถูกลบเมื่อคุณกด "ล้างข้อมูล" หรือล้างประวัติเบราว์เซอร์</p>
                </div>
              </div>
            </div>
          </div>
          <footer className="mt-12 text-center text-slate-400 font-medium pb-12">
            © 2026 ระบบสารบรรณอิเล็กทรอนิกส์ • เทศบาลตำบลป่งไฮ
          </footer>
        </div>
      ) : viewMode === 'officer-settings' ? (
        /* --- OFFICER SETTINGS VIEW --- */
        <div className="max-w-4xl mx-auto py-8 px-4 md:px-6">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <PenTool className="w-32 h-32 rotate-12" />
              </div>
              <div className="relative z-10">
                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">จัดการลายเซ็นเจ้าหน้าที่</h1>
                <p className="text-slate-300 font-medium text-lg">
                  สำหรับตั้งค่าข้อมูลผู้รับผิดชอบและลายเซ็นที่จะแสดงในเอกสาร
                </p>
              </div>
            </div>

            <div className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-600 ml-1">ชื่อเจ้าหน้าที่</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={officerSettings.name} 
                    onChange={handleOfficerSettingChange} 
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-600 ml-1">ตำแหน่ง</label>
                  <input 
                    type="text" 
                    name="position" 
                    value={officerSettings.position} 
                    onChange={handleOfficerSettingChange} 
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-xl">
                  <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <h2>ลายเซ็นดิจิทัล</h2>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex-1 w-full space-y-6">
                    <p className="text-slate-500 font-medium leading-relaxed">
                      อัปโหลดรูปภาพลายเซ็นของคุณเพื่อใช้ในเอกสาร (แนะนำไฟล์ PNG ที่ไม่มีพื้นหลัง)
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="relative overflow-hidden">
                        <button className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95">
                          <Save className="w-5 h-5" />
                          {officerSettings.signature ? 'เปลี่ยนรูปภาพ' : 'เลือกไฟล์ภาพ'}
                        </button>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleOfficerSignatureUpload} 
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                      </div>
                      {officerSettings.signature && (
                        <button 
                          onClick={handleClearOfficerSignature}
                          className="px-8 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition-all border border-red-100 flex items-center gap-2 active:scale-95"
                        >
                          <Trash2 className="w-5 h-5" />
                          ลบทิ้ง
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0 w-full md:w-80 h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                    {officerSettings.signature ? (
                      <img src={officerSettings.signature} alt="Officer Signature Preview" className="max-h-32 object-contain group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <PenTool className="w-10 h-10 opacity-20" />
                        <span className="text-sm italic font-medium">ยังไม่ได้อัปโหลดลายเซ็น</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-5">
                <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shrink-0">
                  <Info className="w-6 h-6" />
                </div>
                <div className="text-sm text-blue-900 leading-relaxed font-medium">
                  <p className="font-extrabold mb-1.5 text-base text-blue-950">ข้อมูลลายเซ็นเจ้าหน้าที่:</p>
                  <ul className="list-disc ml-4 space-y-1 opacity-90">
                    <li>ข้อมูลนี้จะถูกเก็บไว้ถาวรในเบราว์เซอร์นี้ (localStorage)</li>
                    <li>ลายเซ็นจะแสดงในช่อง "พนักงานเจ้าหน้าที่" อัตโนมัติ</li>
                    <li>ส่วน "ผู้รับเงิน" จะไม่แสดงลายเซ็นเพื่อให้สามารถเซ็นด้วยมือได้</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setViewMode('form')}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all active:scale-95"
                >
                  <Home className="w-5 h-5" />
                  กลับไปหน้าแบบฟอร์ม
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* --- DOCUMENT PREVIEW VIEW --- */
        <div className="bg-slate-300 min-h-screen py-8 flex flex-col items-center">
          {/* Action Bar (Sticky) */}
          <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-4 py-3 flex justify-center gap-4 print:hidden">
            <button
              onClick={handleBackToEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              กลับไปแก้ไขข้อมูล
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              พิมพ์ / บันทึก PDF
            </button>
          </div>

          <div className="mt-16 flex flex-col items-center">
            {/* Page 1 */}
            <div className="document doc-page bg-white shadow-2xl mb-8 relative print:shadow-none print:m-0" style={{ width: '210mm', minHeight: '297mm', padding: '25mm 25mm 25mm 30mm', boxSizing: 'border-box' }}>
              <div className="text-right font-medium mb-2 text-[16pt]">(แบบ ฆษ ๑)</div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="border border-black p-2 text-xs w-[60px] h-[80px] flex items-center justify-center text-center leading-tight">
                  ปิด<br/>แสตมป์<br/>อากร
                </div>
                <div className="text-center flex-1 mx-4 pt-4">
                  <h2 className="text-[20pt] font-bold underline leading-tight">คำร้องขออนุญาตทำการโฆษณาโดยใช้เครื่องขยายเสียง</h2>
                </div>
                <div className="w-[60px]"></div>
              </div>

              <div className="text-right mb-6 space-y-1 text-[16pt]">
                <p>เขียนที่ <span className="font-bold">เทศบาลตำบลป่งไฮ</span></p>
                <div className="flex justify-end items-center">
                  <span>วันที่</span>
                  <DocField value={toThaiDate(formData.docDate)} placeholder="......./......./......." minWidth="180px" />
                </div>
              </div>

              <div className="space-y-1 text-justify leading-[1.6] text-[16pt]">
                <p>
                  <span className="inline-block w-[2.5cm]"></span>
                  ข้าพเจ้า <DocField value={formData.applicantName} placeholder="................................................" minWidth="280px" />
                  อายุ <DocField value={formData.applicantAge} placeholder="...." minWidth="40px" /> ปี
                </p>
                <p>
                  เชื้อชาติ <DocField value={formData.applicantEthnicity} placeholder="............" minWidth="100px" />
                  สัญชาติ <DocField value={formData.applicantNationality} placeholder="............" minWidth="100px" />
                  อยู่บ้านเลขที่ <DocField value={formData.addressNo} placeholder="........" minWidth="80px" />
                  หมู่ที่ <DocField value={formData.addressMoo} placeholder="...." minWidth="40px" />
                </p>
                <p>
                  ถนน <DocField value={formData.addressRoad} placeholder="........................" minWidth="150px" />
                  ตำบล <DocField value={formData.addressTambon} placeholder="........................" minWidth="150px" />
                </p>
                <p>
                  อำเภอ <DocField value={formData.addressAmphoe} placeholder="........................" minWidth="150px" />
                  จังหวัด <DocField value={formData.addressProvince} placeholder="........................" minWidth="150px" />
                </p>
                
                <p>
                  เป็นผู้ครอบครองเครื่องขยายเสียงเลขหมายทะเบียนที่ <DocField value={formData.amplifierRegNo} placeholder="................................................" minWidth="300px" />
                </p>
                <p>
                  ไมโครโฟนเลขหมายทะเบียนที่ <DocField value={formData.micRegNo} placeholder="........................" minWidth="150px" />
                  และเครื่องบันทึกเสียงเลขหมายทะเบียนที่ <DocField value={formData.recorderRegNo} placeholder="........................" minWidth="150px" />
                </p>
                <p>
                  ขอทำคำร้องยื่นต่อเจ้าพนักงาน ผู้ออกใบอนุญาตมีข้อความดังต่อไปนี้
                </p>

                <p>
                  <span className="inline-block w-[2.5cm]"></span>
                  ข้อที่ ๑. ข้าพเจ้ามีความประสงค์จะใช้เครื่องดังกล่าวมานั้นเพื่อทำการโฆษณากิจการ 
                </p>
                
                  <div className="pl-[2.5cm] space-y-1">
                    <div className="flex items-start">
                      <span className="shrink-0 leading-relaxed">๑.</span>
                      <DocField value={formData.adsPurpose} placeholder="................................................................................................................................" className="flex-1 text-left" noLine={!!formData.adsPurpose} />
                    </div>
                    <div className="flex items-start">
                      <span className="shrink-0 leading-relaxed">๒.</span>
                      <DocField value={formData.adsPurpose2} placeholder="................................................................................................................................" className="flex-1 text-left" noLine={!!formData.adsPurpose2} />
                    </div>
                    <div className="flex items-start">
                      <span className="shrink-0 leading-relaxed">๓.</span>
                      <DocField value={formData.adsPurpose3} placeholder="................................................................................................................................" className="flex-1 text-left" noLine={!!formData.adsPurpose3} />
                    </div>
                  </div>

                <p>
                  ณ <DocField value={formData.adsAt} placeholder="................................" minWidth="200px" /> 
                  เลขที่ <DocField value={formData.adsNo} placeholder="........" minWidth="80px" /> 
                  หมู่ที่ <DocField value={formData.adsMoo} placeholder="...." minWidth="40px" /> 
                </p>
                <p>
                  ตำบล <DocField value={formData.adsTambon} placeholder="........................" minWidth="150px" /> 
                  อำเภอ <DocField value={formData.adsAmphoe} placeholder="........................" minWidth="150px" /> 
                  จังหวัด <DocField value={formData.adsProvince} placeholder="........................" minWidth="150px" /> 
                </p>

                <p>
                  มีกำหนด <DocField value={formData.adsDuration} placeholder="...." minWidth="40px" /> วัน 
                  ตั้งแต่วันที่ <DocField value={toThaiDateShort(formData.adsStartDate)} placeholder="..../..../...." minWidth="120px" /> 
                  ถึงวันที่ <DocField value={toThaiDateShort(formData.adsEndDate)} placeholder="..../..../...." minWidth="120px" /> 
                </p>
                <p>
                  ตั้งแต่เวลา <DocField value={formData.adsStartTime ? formData.adsStartTime + ' น.' : ''} placeholder="....... น." minWidth="100px" /> 
                  ถึงเวลา <DocField value={formData.adsEndTime ? formData.adsEndTime + ' น.' : ''} placeholder="....... น." minWidth="100px" /> 
                  โทรศัพท์ <DocField value={formData.addressPhone} placeholder="........................" minWidth="180px" /> 
                </p>

                <p>
                  <span className="inline-block w-[2.5cm]"></span>
                  ข้อที่ ๒. ข้าพเจ้ารับรองว่าจะปฏิบัติให้ถูกต้องตามกฎหมาย กฎข้อบังคับและเงื่อนไขว่าด้วยการควบคุมการโฆษณาโดยเครื่องขยายเสียงทุกประการ
                </p>
                <p>
                  <span className="inline-block w-[2.5cm]"></span>
                  ข้อที่ ๓. ข้าพเจ้าได้แนบใบอนุญาตให้มีเพื่อใช้ฯ ซึ่งมีเลขหมายทะเบียนตามที่แจ้งในคำร้องนี้รวม................ฉบับ มาเพื่อประกอบพิจารณาด้วยแล้ว
                </p>
              </div>

              <div className="mt-10 flex justify-end">
                <SignatureBlock 
                  name={formData.applicantName || ''} 
                  date={formData.docDate || ''} 
                  signatureImage="" 
                />
              </div>

              <div className="mt-6 space-y-2 text-[16pt]">
                <p className="font-bold underline">ความเห็นของพนักงานเจ้าหน้าที่</p>
                <p>เสนอ เจ้าพนักงานผู้ออกใบอนุญาต</p>
                <p><span className="inline-block w-[1.5cm]"></span>ข้าพเจ้าได้พิจารณาแล้วเห็นว่า </p>
                <div className="border-b border-dotted border-black/40 min-h-[32px] w-full">ตรวจสอบแล้วเอกสารครบถ้วนเห็นควรนำเรียนท่านนายกเพื่อโปรดพิจารณาออกใบอนุญาต</div>
              </div>

              <div className="mt-6 flex justify-end">
                <SignatureBlock 
                  name={officerSettings.name} 
                  position={officerSettings.position} 
                  date="" 
                  label="(ลงชื่อ)" 
                  subLabel="" 
                  signatureImage={officerSettings.signature || ""}
                  showSignatureImage={true} 
                />
              </div>
            </div>

            {/* Page Break for Print */}
            <div className="print:break-after-page"></div>

            {/* Page 2 */}
            <div className="document doc-page bg-white shadow-2xl relative print:shadow-none print:m-0" style={{ width: '210mm', minHeight: '297mm', padding: '25mm 25mm 25mm 30mm', boxSizing: 'border-box' }}>
              <div className="text-center font-bold mb-8 text-[16pt]">-๒-</div>
              
              <table className="w-full border-collapse border border-black table-fixed mb-8 text-[16pt]">
                <tbody>
                  <tr>
                    <td className="w-1/2 p-4 border border-black align-top">
                      <div className="flex flex-col h-full space-y-4">
                        <p className="font-bold text-center underline">บันทึกของเจ้าหน้าที่ตรวจสอบ</p>
                        <p>เสนอ เจ้าพนักงานผู้ออกใบอนุญาต</p>
                        <div className="flex-1 space-y-4 pt-4">
                          <div className="border-b border-dotted border-black/40 h-8 w-full"></div>
                          <div className="border-b border-dotted border-black/40 h-8 w-full"></div>
                          <div className="border-b border-dotted border-black/40 h-8 w-full"></div>
                          <div className="pt-4 text-center flex justify-center items-center">
                            <span>วันที่</span>
                            <DocField value="" placeholder="........./........../.........." minWidth="120px" noLine />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="w-1/2 p-4 border border-black align-top">
                      <div className="flex flex-col h-full space-y-4">
                        <p className="font-bold text-center underline">คำสั่งเจ้าพนักงานผู้ออกใบอนุญาต</p>
                        <div className="flex-1 space-y-4 pt-4">
                          <div className="border-b border-dotted border-black/40 h-8 w-full"></div>
                          <div className="border-b border-dotted border-black/40 h-8 w-full"></div>
                          <div className="border-b border-dotted border-black/40 h-8 w-full"></div>
                          <div className="pt-4 text-center flex justify-center items-center">
                            <span>วันที่</span>
                            <DocField value="" placeholder="........./........../.........." minWidth="120px" noLine />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="space-y-4 mb-10 text-[16pt]">
                <p className="font-bold underline">สำหรับพนักงานเจ้าหน้าที่</p>
                <p className="leading-relaxed text-justify">
                  <span className="inline-block w-[2.5cm]"></span>
                  ได้ออกใบอนุญาตให้ทำการโฆษณาโดยใช้เครื่องขยายเสียงเลขที่ <DocField value={formData.licenseNo} placeholder="........................" minWidth="180px" /> 
                </p>
                <p className="leading-relaxed text-justify">
                  และได้ค่าธรรมเนียม <DocField value={formData.feeAmount ? Number(formData.feeAmount).toLocaleString() : ''} placeholder="................" minWidth="120px" /> บาท 
                  ( <span className="border-b border-dotted border-black/40 px-2 min-w-[250px] inline-block text-center">{formData.feeAmount ? toThaiNumerals(thaiBahtText(Number(formData.feeAmount))) : <span className="text-gray-300 print:invisible">................................................................................</span>}</span> ) 
                </p>
                <p className="leading-relaxed text-justify">
                  ตามใบอนุญาตเลขที่ <DocField value={formData.licenseNo} placeholder="........................" minWidth="180px" /> ไว้ถูกต้องแล้ว
                </p>
              </div>

              <div className="flex flex-col items-center">
                <SignatureBlock 
                  name={officerSettings.name} 
                  position={officerSettings.position} 
                  date="" 
                  label="(ลงชื่อ)" 
                  subLabel="" 
                  showSignatureImage={false} 
                />
                <p className="font-bold text-[16pt] mt-4">ผู้รับเงิน</p>
              </div>
            </div>
          </div>
          <style>{`
            @font-face {
              font-family: 'TH Sarabun New';
              src: url('https://cdn.jsdelivr.net/gh/googlefonts/thai-fonts@main/fonts/THSarabunNew.woff2') format('woff2');
              font-weight: normal;
              font-style: normal;
            }
            @font-face {
              font-family: 'TH Sarabun New';
              src: url('https://cdn.jsdelivr.net/gh/googlefonts/thai-fonts@main/fonts/THSarabunNew-Bold.woff2') format('woff2');
              font-weight: bold;
              font-style: normal;
            }

            .document, .document * {
              font-family: 'TH Sarabun New', 'TH Sarabun', sans-serif !important;
              font-size: 16pt !important;
              color: black !important;
              line-height: 1.2;
              -webkit-print-color-adjust: exact;
            }

            .document h2 {
              font-size: 20pt !important;
            }

            table {
              width: 100%;
              table-layout: fixed;
              border-collapse: collapse;
            }

            td, th {
              overflow-wrap: anywhere;
              word-break: normal;
              white-space: normal;
              vertical-align: top;
            }

            @media print {
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .bg-slate-300 {
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .fixed, .print\:hidden {
                display: none !important;
              }
              .min-h-screen {
                min-height: 0 !important;
                display: block !important;
              }
              .mt-16 {
                margin-top: 0 !important;
              }
              .document {
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 210mm !important;
                min-height: 297mm !important;
                display: block !important;
              }
              .doc-page {
                padding-top: 25mm !important;
                padding-right: 25mm !important;
                padding-bottom: 25mm !important;
                padding-left: 30mm !important;
                page-break-after: always !important;
                width: 210mm !important;
                height: 297mm !important;
                box-sizing: border-box !important;
                background: white !important;
                position: relative !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              img {
                max-width: none !important;
                display: block !important;
              }
              .doc-page:last-child {
                page-break-after: auto !important;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
