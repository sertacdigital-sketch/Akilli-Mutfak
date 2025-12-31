import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Calendar, AlertTriangle, CheckCircle,
    Utensils, Pencil, Save, X, Snowflake, Sun,
    Thermometer, ChefHat, BookOpen, Clock, Coffee,
    Soup, Salad, Carrot, ArrowRight, ChevronDown,
    Package, LayoutGrid, ListFilter
} from 'lucide-react';

// --- GIDA VERİTABANI ---
const GIDA_VERITABANI = {
    "Süt (Açılmış)": { dolap: 3, buzluk: null, kiler: null, birim: "Litre" },
    "Yumurta": { dolap: 21, buzluk: null, kiler: 7, birim: "Adet" },
    "Yoğurt": { dolap: 7, buzluk: null, kiler: null, birim: "Kase" },
    "Peynir (Kaşar/Beyaz)": { dolap: 14, buzluk: 180, kiler: null, birim: "Kalıp" },
    "Tereyağı": { dolap: 90, buzluk: 270, kiler: null, birim: "Paket" },
    "Zeytin": { dolap: 90, buzluk: null, kiler: 30, birim: "Kavanoz" },
    "Kıyma": { dolap: 2, buzluk: 120, kiler: null, birim: "kg" },
    "Kuşbaşı Et": { dolap: 3, buzluk: 180, kiler: null, birim: "kg" },
    "Tavuk (Çiğ)": { dolap: 1, buzluk: 270, kiler: null, birim: "gr" },
    "Balık": { dolap: 1, buzluk: 90, kiler: null, birim: "Adet" },
    "Sucuk / Salam": { dolap: 7, buzluk: 60, kiler: null, birim: "Paket" },
    "Marul / Yeşillik": { dolap: 5, buzluk: null, kiler: 1, birim: "Demet" },
    "Domates": { dolap: 10, buzluk: null, kiler: 5, birim: "kg" },
    "Salatalık": { dolap: 5, buzluk: null, kiler: 2, birim: "Adet" },
    "Biber": { dolap: 7, buzluk: 300, kiler: 3, birim: "Adet" },
    "Patlıcan": { dolap: 7, buzluk: 240, kiler: 3, birim: "Adet" },
    "Kabak": { dolap: 5, buzluk: 240, kiler: 3, birim: "Adet" },
    "Soğan": { dolap: null, buzluk: 240, kiler: 30, birim: "Adet" },
    "Patates": { dolap: null, buzluk: 240, kiler: 30, birim: "Adet" },
    "Havuç": { dolap: 21, buzluk: 240, kiler: 7, birim: "Adet" },
    "Muz": { dolap: null, buzluk: 30, kiler: 4, birim: "Adet" },
    "Elma": { dolap: 21, buzluk: null, kiler: 7, birim: "kg" },
    "Limon": { dolap: 30, buzluk: null, kiler: 10, birim: "Adet" },
    "Yemek (Pişmiş)": { dolap: 3, buzluk: 60, kiler: null, birim: "Porsiyon" },
    "Ekmek": { dolap: 5, buzluk: 90, kiler: 2, birim: "Adet" },
    "Pirinç / Makarna": { dolap: null, buzluk: null, kiler: 365, birim: "Paket" },
};

export default function App() {
    const [urunler, setUrunler] = useState([
        { id: 1, ad: "Süt (Açılmış)", miktar: "1 Litre", saklamaYeri: "dolap", skt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { id: 2, ad: "Yumurta", miktar: "4 Adet", saklamaYeri: "dolap", skt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { id: 3, ad: "Kıyma", miktar: "1 kg", saklamaYeri: "buzluk", skt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    ]);

    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [duzenlemeId, setDuzenlemeId] = useState(null);

    useEffect(() => {
        if (secilenUrunKey && GIDA_VERITABANI[secilenUrunKey]) {
            const gidaBilgi = GIDA_VERITABANI[secilenUrunKey];
            const rafOmru = gidaBilgi[saklamaYeri];
            if (rafOmru !== null) {
                const d = new Date();
                d.setDate(d.getDate() + rafOmru);
                setManuelTarih(d.toISOString().split('T')[0]);
            }
        }
    }, [secilenUrunKey, saklamaYeri]);

    const urunEkle = (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return;
        const yeni = {
            id: Date.now(),
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${GIDA_VERITABANI[secilenUrunKey]?.birim || ''}`,
            saklamaYeri,
            skt: manuelTarih
        };
        setUrunler([...urunler, yeni]);
        setSecilenUrunKey(""); setMiktar("");
    };

    const urunSil = (id) => setUrunler(urunler.filter(u => u.id !== id));

    const tarihGuncelle = (id, yeniTarih) => {
        setUrunler(urunler.map(u => u.id === id ? { ...u, skt: yeniTarih } : u));
        setDuzenlemeId(null);
    };

    const kalanGun = (t) => Math.ceil((new Date(t) - new Date().setHours(0, 0, 0, 0)) / 86400000);

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col overflow-x-hidden font-sans text-slate-900">
            <style dangerouslySetInnerHTML={{
                __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body, html, #root { 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 100% !important; 
          max-width: none !important; 
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}} />

            {/* Header */}
            <header className="w-full bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-[60]">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
                        <ChefHat className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900">Mutfak Paneli</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">Sistem Aktif</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Toplam Envanter</span>
                        <span className="text-lg font-extrabold text-indigo-600 leading-none">{urunler.length} Ürün</span>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-100 hidden sm:block"></div>
                    <button className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl transition-all border border-slate-200">
                        <LayoutGrid size={20} className="text-slate-600" />
                    </button>
                </div>
            </header>

            {/* Navigation */}
            <div className="w-full px-8 mt-6">
                <nav className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                    {[
                        { id: 'liste', label: 'Envanter', icon: Package },
                        { id: 'plan', label: 'Tüketim Planı', icon: ListFilter }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setAktifSekme(tab.id)}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${aktifSekme === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <main className="flex-1 w-full p-8 pt-6">

                {aktifSekme === 'liste' && (
                    <div className="flex flex-col xl:flex-row gap-10 w-full max-w-[1600px] mx-auto">

                        {/* Form Section */}
                        <div className="w-full xl:w-[400px] shrink-0">
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 sticky top-32">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Ürün Ekle</h2>
                                    <p className="text-slate-400 text-sm mt-1">Stoklarınıza yeni bir gıda ekleyin.</p>
                                </div>

                                <form onSubmit={urunEkle} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Gıda Türü</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full appearance-none p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold text-slate-700 cursor-pointer"
                                                value={secilenUrunKey}
                                                onChange={(e) => setSecilenUrunKey(e.target.value)}
                                            >
                                                <option value="">Ürün Seçiniz...</option>
                                                {Object.keys(GIDA_VERITABANI).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" size={18} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Saklama Alanı</label>
                                        <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setSaklamaYeri(t)}
                                                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${saklamaYeri === t ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Miktar</label>
                                            <input
                                                type="number"
                                                placeholder="1"
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold"
                                                value={miktar}
                                                onChange={e => setMiktar(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Son Tarih</label>
                                            <input
                                                type="date"
                                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-semibold text-xs"
                                                value={manuelTarih}
                                                onChange={e => setManuelTarih(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <button className="w-full bg-slate-900 text-white py-5 rounded-[20px] font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                                        <Plus size={20} />
                                        Stoka Kaydet
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {urunler.map(u => {
                                    const k = kalanGun(u.skt);
                                    const isEditing = duzenlemeId === u.id;
                                    const isCritical = k <= 2;

                                    return (
                                        <div key={u.id} className={`group bg-white p-6 rounded-[32px] border transition-all duration-300 relative ${isCritical ? 'border-rose-100 shadow-rose-50/50 shadow-xl' : 'border-slate-100 hover:shadow-xl hover:shadow-slate-200/50'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-4 rounded-[22px] transition-colors ${isCritical ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                                    {u.saklamaYeri === 'buzluk' ? <Snowflake size={22} /> : u.saklamaYeri === 'dolap' ? <Thermometer size={22} /> : <Sun size={22} />}
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                                    <button onClick={() => setDuzenlemeId(isEditing ? null : u.id)} className="p-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100">
                                                        {isEditing ? <X size={18} /> : <Pencil size={18} />}
                                                    </button>
                                                    <button onClick={() => urunSil(u.id)} className="p-2.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-100">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="font-extrabold text-slate-800 text-xl tracking-tight leading-tight">{u.ad}</h3>
                                                <div className="flex items-center gap-2">
                                                    <Package size={14} className="text-slate-300" />
                                                    <p className="text-sm font-bold text-slate-400 italic">{u.miktar}</p>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-5 border-t border-slate-50">
                                                {isEditing ? (
                                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 block">Yeni Tarih Belirle</label>
                                                        <input
                                                            type="date"
                                                            className="w-full p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                            defaultValue={u.skt}
                                                            onChange={(e) => tarihGuncelle(u.id, e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5 tracking-wider">Durum</span>
                                                            <span className={`text-[13px] font-extrabold tracking-tight ${isCritical ? 'text-rose-500' : 'text-slate-700'}`}>
                                                                {k <= 0 ? 'SÜRESİ DOLDU' : `${k} Gün Kaldı`}
                                                            </span>
                                                        </div>
                                                        {isCritical && (
                                                            <div className="bg-rose-100 text-rose-600 p-2 rounded-lg animate-bounce">
                                                                <AlertTriangle size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {aktifSekme === 'plan' && (
                    <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Acil Tüketilmesi Gerekenler', color: 'rose', days: [0, 3] },
                            { title: 'Yakında Bitecekler', color: 'amber', days: [4, 7] },
                            { title: 'Uzun Vadeli Stok', color: 'emerald', days: [8, 999] }
                        ].map((cat, idx) => {
                            const filtered = urunler.filter(u => {
                                const k = kalanGun(u.skt);
                                return k >= cat.days[0] && k <= cat.days[1];
                            });

                            return (
                                <div key={cat.title} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col h-fit">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-tight">{cat.title}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black bg-${cat.color}-50 text-${cat.color}-600 uppercase border border-${cat.color}-100`}>
                                            {filtered.length}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {filtered.length > 0 ? filtered.map(u => (
                                            <div key={u.id} className="group flex items-center justify-between p-5 bg-slate-50 rounded-[24px] hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all cursor-default border border-transparent hover:border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">{u.ad}</span>
                                                    <span className="text-[10px] font-medium text-slate-400 italic">{u.miktar}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[11px] font-black bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100 text-slate-500`}>
                                                        {u.skt}
                                                    </span>
                                                    <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="py-12 flex flex-col items-center justify-center opacity-40">
                                                <Package size={40} className="text-slate-300 mb-2" />
                                                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Ürün Bulunmuyor</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

            </main>

            <footer className="w-full mt-auto bg-white border-t border-slate-100 p-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Akıllı Mutfak Yönetim Paneli v2.4</span>
                </div>
                <div className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Sıfır Atık • Maksimum Verim • Modern Stok
                </div>
            </footer>
        </div>
    );
}