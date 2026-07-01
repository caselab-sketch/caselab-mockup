import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://qrgyyasvdlnehicbipit.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QL0_OcKVfucL-xKBHF_ujw_Blvv6rDf';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  RotateCcw,
  Smartphone,
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  Move,
  Settings,
  Type,
  Droplet,
  Layout,
  Square,
  RectangleVertical,
  MousePointer2,
  Sliders,
  Save,
  Trash2,
} from 'lucide-react';

// Pilihan Background Estetik Studio
const BACKGROUND_THEMES = [
  {
    id: 'wood_dark',
    name: 'Elegant Dark Wood',
    color1: '#1e1b18',
    color2: '#0f0e0d',
    type: 'wood',
  },
  {
    id: 'studio_dark',
    name: 'Dark Studio Soft',
    color1: '#2a2d32',
    color2: '#111315',
    type: 'gradient',
  },
  {
    id: 'studio_light',
    name: 'Minimalist Light Grey',
    color1: '#f3f4f6',
    color2: '#d1d5db',
    type: 'gradient',
  },
  {
    id: 'studio_warm',
    name: 'Warm Terrazzo',
    color1: '#fdf0ed',
    color2: '#e3c4bc',
    type: 'gradient',
  },
];

// Koleksi Font Estetik (Dominan Latin/Script)
const FONT_OPTIONS = [
  { id: 'Great Vibes', name: 'Great Vibes (Latin Klasik)' },
  { id: 'Dancing Script', name: 'Dancing Script (Latin Casual)' },
  { id: 'Pacifico', name: 'Pacifico (Latin Bold)' },
  { id: 'Satisfy', name: 'Satisfy (Brush Script)' },
  { id: 'Sacramento', name: 'Sacramento (Latin Tipis)' },
  { id: 'Montserrat', name: 'Montserrat (Modern Bold)' },
  { id: 'Playfair Display', name: 'Playfair Display (Serif Elegan)' },
];

export default function App() {
  // STATE PENYIMPANAN MODEL
  const [savedModels, setSavedModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState('new');
  const [newModelName, setNewModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Konfigurasi Visual Lingkungan
  const [selectedBg, setSelectedBg] = useState('wood_dark');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [glossyIntensity, setGlossyIntensity] = useState(50);
  const [forceRender, setForceRender] = useState(0);

  // State Gambar
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [customTemplateSrc, setCustomTemplateSrc] = useState(null);
  const [customTemplateObj, setCustomTemplateObj] = useState(null);

  // Parameter Masking Model Kustom
  const [maskW, setMaskW] = useState(440);
  const [maskH, setMaskH] = useState(900);
  const [maskX, setMaskX] = useState(0);
  const [maskY, setMaskY] = useState(0);
  const [maskR, setMaskR] = useState(50);

  // Transformasi Desain
  const [scale, setScale] = useState(1.0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);

  // State Teks Kustom & Contour
  const [textContent, setTextContent] = useState('');
  const [textFont, setTextFont] = useState('Great Vibes');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(80);
  const [textX, setTextX] = useState(0);
  const [textY, setTextY] = useState(0);
  const [textContourColor, setTextContourColor] = useState('#000000');
  const [textContourWidth, setTextContourWidth] = useState(0);

  // State Interaksi Canvas
  const [dragMode, setDragMode] = useState('design');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffsetStart, setDragOffsetStart] = useState({ x: 0, y: 0 });

  const [alertMsg, setAlertMsg] = useState(null);
  const canvasRef = useRef(null);

  // Muat Google Fonts secara dinamis
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&family=Great+Vibes&family=Montserrat:wght@700&family=Pacifico&family=Playfair+Display:ital,wght@1,700&family=Sacramento&family=Satisfy&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    document.fonts.ready.then(() => {
      setForceRender((prev) => prev + 1);
    });
  }, []);

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // --- AMBIL DATA DARI SUPABASE SAAT APLIKASI DI BUKA ---
  const fetchModels = async () => {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching models:', error);
      showAlert('⚠️ Gagal memuat data dari Supabase.');
    } else if (data) {
      setSavedModels(data);
      if (data.length > 0) {
        setSelectedModelId(data[0].id);
      }
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Load data setiap kali dropdown model berganti (Sudah Diperbaiki ke Huruf Kecil)
  useEffect(() => {
    if (selectedModelId !== 'new') {
      const model = savedModels.find((m) => m.id === selectedModelId);
      if (model) {
        setMaskW(model.maskw || 440);
        setMaskH(model.maskh || 900);
        setMaskR(model.maskr || 50);
        setMaskX(model.maskx || 0);
        setMaskY(model.masky || 0);
        setCustomTemplateSrc(model.src);
        const img = new Image();
        img.onload = () => setCustomTemplateObj(img);
        img.src = model.src;
      }
    } else {
      setCustomTemplateSrc(null);
      setCustomTemplateObj(null);
      handleResetMasking();
    }
  }, [selectedModelId, savedModels]);

  // --- SIMPAN DATA BARU KE SUPABASE ---
  const saveNewModel = async () => {
    if (!newModelName.trim() || !customTemplateSrc) {
      return showAlert('⚠️ Nama model dan template PNG wajib diisi!');
    }

    setIsLoading(true);

    // Disesuaikan agar nama properti menggunakan huruf kecil semua (snake_case/lowercase) cocok dengan PostgreSQL
    const newModel = {
      name: newModelName.trim(),
      src: customTemplateSrc,
      maskw: maskW,
      maskh: maskH,
      maskr: maskR,
      maskx: maskX,
      masky: maskY,
    };

    const { data, error } = await supabase
      .from('models')
      .insert([newModel])
      .select();

    setIsLoading(false);

    if (error) {
      console.error('Error saving model:', error);
      showAlert('⚠️ Gagal menyimpan ke Supabase database.');
    } else {
      showAlert(`✅ Model "${newModel.name}" berhasil disimpan secara cloud!`);
      setNewModelName('');
      fetchModels(); // Refresh data list
      if (data && data[0]) {
        setSelectedModelId(data[0].id);
      }
    }
  };

  // --- HAPUS DATA DARI SUPABASE ---
  const deleteActiveModel = async () => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin menghapus model ini dari cloud Supabase?'
      )
    ) {
      const { error } = await supabase
        .from('models')
        .delete()
        .eq('id', selectedModelId);

      if (error) {
        console.error('Error deleting model:', error);
        showAlert('⚠️ Gagal menghapus data.');
      } else {
        showAlert('🗑️ Model berhasil dihapus dari cloud.');
        setSelectedModelId('new');
        fetchModels(); // Refresh data list
      }
    }
  };

  // --- HANDLER UPLOAD ---
  const handleCustomTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setCustomTemplateObj(img);
          setCustomTemplateSrc(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      showAlert('⚠️ Harap unggah file berformat PNG Transparan!');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImageObj(img);
          setUploadedImage(event.target.result);
          const scaleFactor = Math.max(maskW / img.width, 1.0);
          setScale(parseFloat(scaleFactor.toFixed(2)));
          setOffsetX(0);
          setOffsetY(0);
          setRotation(0);
          setDragMode('design');
          showAlert('🎨 Desain konsumen berhasil dipasang!');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDesign = () => {
    setScale(1.0);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
    showAlert('Posisi desain telah di-reset ke tengah.');
  };

  const handleResetMasking = () => {
    setMaskW(440);
    setMaskH(900);
    setMaskX(0);
    setMaskY(0);
    setMaskR(50);
  };

  // --- CANVAS RENDERING ENGINE ---
  const drawMockup = (ctx) => {
    const W = 1080;
    const H = aspectRatio === '1:1' ? 1080 : 1920;
    ctx.clearRect(0, 0, W, H);

    // 1. BACKGROUND
    const bgInfo = BACKGROUND_THEMES.find((b) => b.id === selectedBg);
    if (bgInfo.type === 'wood') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, bgInfo.color1);
      grad.addColorStop(1, bgInfo.color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i + Math.sin(i) * 30, 0);
        ctx.bezierCurveTo(
          i + 50,
          H * 0.25,
          i - 50,
          H * 0.75,
          i + Math.sin(i) * 30,
          H
        );
        ctx.stroke();
      }
      const vignette = ctx.createRadialGradient(
        W / 2,
        H / 2,
        W * 0.3,
        W / 2,
        H / 2,
        W * 0.9
      );
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    } else {
      const grad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W);
      grad.addColorStop(0, bgInfo.color1);
      grad.addColorStop(1, bgInfo.color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // DIMENSI & POSISI KUSTOM
    const phoneW = maskW;
    const phoneH = maskH;
    const phoneX = (W - phoneW) / 2 + maskX;
    const phoneY = (H - phoneH) / 2 + maskY;
    const borderRadius = maskR;

    // 2. SHADOW CASING
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 45;
    ctx.shadowOffsetX = 15;
    ctx.shadowOffsetY = 25;
    ctx.fillStyle = 'rgba(0,0,0,0.95)';
    drawRoundedRectPath(ctx, phoneX, phoneY, phoneW, phoneH, borderRadius);
    ctx.fill();
    ctx.restore();

    // 3. MASKING & KONTEN DALAM CASING
    ctx.save();
    ctx.beginPath();
    drawRoundedRectPath(ctx, phoneX, phoneY, phoneW, phoneH, borderRadius);
    ctx.clip();

    ctx.fillStyle = '#ffffff';
    ctx.fill();

    const centerX = phoneX + phoneW / 2;
    const centerY = phoneY + phoneH / 2;

    // A. Gambar Desain Konsumen
    if (imageObj) {
      ctx.save();
      ctx.translate(centerX + offsetX, centerY + offsetY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.drawImage(imageObj, -imageObj.width / 2, -imageObj.height / 2);
      ctx.restore();
    } else {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(phoneX, phoneY, phoneW, phoneH);
    }

    // B. Teks Custom dengan FITUR CONTOUR
    if (textContent.trim() !== '') {
      ctx.save();
      ctx.translate(centerX + textX, centerY + textY);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${textSize}px "${textFont}"`;

      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      if (textContourWidth > 0) {
        ctx.strokeStyle = textContourColor;
        ctx.lineWidth = textContourWidth;
        ctx.lineJoin = 'round';
        ctx.strokeText(textContent, 0, 0);
      }

      ctx.fillStyle = textColor;
      ctx.fillText(textContent, 0, 0);
      ctx.restore();
    }

    // C. Efek Kaca / Glossy Reflection Overlay
    if (glossyIntensity > 0) {
      ctx.save();
      const intensity = glossyIntensity / 100;
      const glossyGrad = ctx.createLinearGradient(
        phoneX,
        phoneY,
        phoneX + phoneW,
        phoneY + phoneH
      );
      glossyGrad.addColorStop(0, `rgba(255,255,255,${0.6 * intensity})`);
      glossyGrad.addColorStop(0.25, `rgba(255,255,255,${0.1 * intensity})`);
      glossyGrad.addColorStop(0.35, `rgba(255,255,255,0)`);
      glossyGrad.addColorStop(0.5, `rgba(255,255,255,0)`);
      glossyGrad.addColorStop(0.55, `rgba(255,255,255,${0.15 * intensity})`);
      glossyGrad.addColorStop(0.7, `rgba(255,255,255,${0.05 * intensity})`);
      glossyGrad.addColorStop(1, `rgba(255,255,255,0)`);

      ctx.fillStyle = glossyGrad;
      ctx.fillRect(phoneX, phoneY, phoneW, phoneH);
      ctx.restore();
    }

    ctx.restore();

    // 4. OVERLAY TEMPLATE KUSTOM LOKAL
    if (customTemplateObj) {
      ctx.save();
      ctx.drawImage(customTemplateObj, phoneX, phoneY, phoneW, phoneH);
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      drawRoundedRectPath(ctx, phoneX, phoneY, phoneW, phoneH, borderRadius);
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawRoundedRectPath = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  // Re-draw Canvas Observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = 1080;
      canvas.height = aspectRatio === '1:1' ? 1080 : 1920;
      drawMockup(ctx);
    }
  }, [
    selectedModelId,
    selectedBg,
    uploadedImage,
    customTemplateSrc,
    scale,
    offsetX,
    offsetY,
    rotation,
    textContent,
    textFont,
    textColor,
    textSize,
    textX,
    textY,
    textContourColor,
    textContourWidth,
    maskW,
    maskH,
    maskX,
    maskY,
    maskR,
    aspectRatio,
    glossyIntensity,
    forceRender,
  ]);

  // Download Output Final
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const activeName =
        savedModels.find((m) => m.id === selectedModelId)?.name || 'Custom';
      const filename = `CaseLab_${activeName.replace(/\s+/g, '_')}_${
        aspectRatio === '1:1' ? 'Kotak' : 'Story'
      }_${Date.now()}.png`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showAlert('🎉 Mockup resolusi tinggi berhasil diunduh!');
    } catch (err) {
      showAlert('⚠️ Gagal memproses gambar ekspor.');
    }
  };

  // --- LOGIKA DRAG GESTURE ---
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = (e) => {
    if (!uploadedImage && dragMode === 'design') return;
    if (textContent.trim() === '' && dragMode === 'text') return;

    setIsDragging(true);
    setDragStart(getCanvasCoords(e));

    if (dragMode === 'text') {
      setDragOffsetStart({ x: textX, y: textY });
    } else {
      setDragOffsetStart({ x: offsetX, y: offsetY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const dx = coords.x - dragStart.x;
    const dy = coords.y - dragStart.y;

    if (dragMode === 'text') {
      setTextX(Math.round(dragOffsetStart.x + dx));
      setTextY(Math.round(dragOffsetStart.y + dy));
    } else {
      const rad = (-rotation * Math.PI) / 180;
      const rotatedDx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const rotatedDy = dx * Math.sin(rad) + dy * Math.cos(rad);
      setOffsetX(Math.round(dragOffsetStart.x + rotatedDx));
      setOffsetY(Math.round(dragOffsetStart.y + rotatedDy));
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {alertMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-indigo-400">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span className="text-sm font-semibold">{alertMsg}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              CaseLab design
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Cloud Database & Template Engine
            </p>
          </div>
        </div>

        {/* Toggle Rasio Ukuran */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              aspectRatio === '9:16'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RectangleVertical className="w-4 h-4" /> 9:16 (Story)
          </button>
          <button
            onClick={() => setAspectRatio('1:1')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              aspectRatio === '1:1'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Square className="w-4 h-4" /> 1:1 (Feed/Kotak)
          </button>
        </div>
      </header>

      {/* BODY UTAMA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KONTROL PANEL (KIRI) */}
        <section
          className="lg:col-span-5 flex flex-col gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-full overflow-y-auto custom-scrollbar"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* BAGIAN 1: DATABASE MODEL CLOUD */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-indigo-400" /> 1. Database
              Model Cloud & Desain
            </label>

            <div className="flex gap-2">
              <select
                value={selectedModelId}
                onChange={(e) =>
                  setSelectedModelId(
                    e.target.value === 'new' ? 'new' : Number(e.target.value)
                  )
                }
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                {savedModels.length > 0 && (
                  <optgroup label="Model Casing Tersimpan (Supabase)">
                    {savedModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                <option value="new">✨ Tambah Template Baru...</option>
              </select>

              {selectedModelId !== 'new' && (
                <button
                  onClick={deleteActiveModel}
                  className="p-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl border border-rose-500/30 transition-colors"
                  title="Hapus Model Ini"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Antarmuka Menambahkan Model Baru */}
            {selectedModelId === 'new' && (
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/40 rounded-xl flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Beri Nama Model (Contoh: iPhone 16 Pro)"
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-white focus:border-indigo-500 outline-none"
                />

                <div className="relative border border-dashed border-indigo-500/50 hover:border-indigo-400 p-2.5 rounded-lg text-center bg-slate-900 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleCustomTemplateUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-300">
                    <Upload className="w-4 h-4" />{' '}
                    {customTemplateSrc
                      ? 'Template Berhasil Dipilih'
                      : 'Upload File PNG Template'}
                  </div>
                </div>

                <button
                  onClick={saveNewModel}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors mt-1"
                >
                  <Save className="w-4 h-4" />{' '}
                  {isLoading ? 'Menyimpan...' : 'Simpan ke Supabase'}
                </button>
              </div>
            )}

            {/* Input Gambar Konsumen */}
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500 p-4 rounded-xl text-center bg-slate-950 transition-colors mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <ImageIcon className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    Unggah Desain Pembeli
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format JPG atau PNG
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* BAGIAN 2: MASKING KUSTOM */}
          <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Settings className="w-4 h-4 text-indigo-400" /> Area Cetak
                Masking
              </label>
              <button
                onClick={handleResetMasking}
                className="p-1 text-slate-500 hover:text-white text-[10px] font-bold"
              >
                Reset
              </button>
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Lebar Area Cetak</span>
                <span className="text-indigo-400">{maskW}px</span>
              </div>
              <input
                type="range"
                min="150"
                max="800"
                step="1"
                value={maskW}
                onChange={(e) => setMaskW(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Tinggi Area Cetak</span>
                <span className="text-indigo-400">{maskH}px</span>
              </div>
              <input
                type="range"
                min="300"
                max="1500"
                step="1"
                value={maskH}
                onChange={(e) => setMaskH(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                <span>Kebulatan Sudut (Radius)</span>
                <span className="text-indigo-400">{maskR}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="1"
                value={maskR}
                onChange={(e) => setMaskR(parseInt(e.target.value))}
                className="w-full accent-indigo-500 h-1 cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-slate-400">
                  Geser X Area
                </span>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  step="1"
                  value={maskX}
                  onChange={(e) => setMaskX(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-slate-400">
                  Geser Y Area
                </span>
                <input
                  type="range"
                  min="-250"
                  max="250"
                  step="1"
                  value={maskY}
                  onChange={(e) => setMaskY(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 h-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* BAGIAN 3: MANUAL TRANSFORM DESAIN */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-indigo-400" /> 2. Manual
                Transform Desain
              </label>
              <button
                onClick={handleResetDesign}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-[10px] font-bold"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {!uploadedImage ? (
              <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-slate-500 italic">
                Unggah desain pembeli untuk membuka kontrol manual.
              </div>
            ) : (
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Skala Desain</span>
                    <span className="text-indigo-400">
                      {(scale * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.02"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Rotasi Sudut</span>
                    <span className="text-indigo-400">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 h-1 cursor-pointer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-400">
                      Geser Posisi X
                    </span>
                    <input
                      type="range"
                      min="-500"
                      max="500"
                      step="1"
                      value={offsetX}
                      onChange={(e) => setOffsetX(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-400">
                      Geser Posisi Y
                    </span>
                    <input
                      type="range"
                      min="-800"
                      max="800"
                      step="1"
                      value={offsetY}
                      onChange={(e) => setOffsetY(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 h-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-800" />

          {/* BAGIAN 4: TEKS KUSTOM */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
              <Type className="w-4 h-4 text-emerald-400" /> 3. Penambahan Teks &
              Contour
            </label>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ketik nama atau kata-kata..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400">
                    Pilih Font Estetik
                  </span>
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none"
                    style={{ fontFamily: textFont }}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option
                        key={f.id}
                        value={f.id}
                        style={{ fontFamily: f.id }}
                      >
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-[10px] text-slate-300 uppercase">
                    {textColor}
                  </span>
                </div>
              </div>

              {/* Contour */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg p-1">
                  <input
                    type="color"
                    value={textContourColor}
                    onChange={(e) => setTextContourColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span className="text-[10px] text-slate-300 uppercase">
                    {textContourColor}
                  </span>
                </div>
                <div className="flex flex-col gap-1 justify-center">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>Tebal Contour</span>
                    <span className="text-emerald-400">
                      {textContourWidth}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={textContourWidth}
                    onChange={(e) =>
                      setTextContourWidth(parseInt(e.target.value))
                    }
                    className="w-full accent-emerald-500 h-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* BAGIAN 5: TAMPILAN VISUAL OUTPUT */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
              <Droplet className="w-4 h-4 text-cyan-400" /> 4. Tampilan Visual
              Akhir
            </label>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={selectedBg}
                onChange={(e) => setSelectedBg(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white outline-none"
              >
                {BACKGROUND_THEMES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <div className="flex flex-col gap-1.5 justify-center">
                <div className="flex justify-between text-[10px] font-semibold text-slate-400">
                  <span>Kilauan / Glossy</span>
                  <span className="text-cyan-400">{glossyIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={glossyIntensity}
                  onChange={(e) => setGlossyIntensity(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 pb-2">
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" /> Download Mockup Final
            </button>
          </div>
        </section>

        {/* PREVIEW KANAN */}
        <section className="lg:col-span-7 flex flex-col items-center gap-4">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-full p-1 shadow-lg">
            <button
              onClick={() => setDragMode('design')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                dragMode === 'design'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Gambar Desain
            </button>
            <button
              onClick={() => setDragMode('text')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                dragMode === 'text'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Teks Nama
            </button>
          </div>

          <div
            className={`relative w-full max-w-[450px] ${
              aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[9/16]'
            } rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 group`}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
              className="w-full h-full object-cover block cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            />
          </div>
        </section>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `,
        }}
      />
    </div>
  );
}
