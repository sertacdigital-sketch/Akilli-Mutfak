import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, AlertTriangle, CheckCircle, Utensils, Pencil, Save, X, Snowflake, Sun, Thermometer, ChefHat, BookOpen, Clock, Coffee, Soup, Salad, Carrot, ArrowRight } from 'lucide-react';

// --- GIDA VE TARİF VERİLERİ (Aynı şekilde korunuyor) ---
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

const TARIF_VERITABANI = [
    { ad: "Menemen", kategori: "Kahvaltı", malzemeler: ["Yumurta", "Domates", "Biber"], zorluk: "Kolay", sure: "15 dk", tarif: "Biberleri ve domatesleri sotele, üzerine yumurtaları kır." },
    { ad: "Karnıyarık", kategori: "Ana Yemek", malzemeler: ["Patlıcan", "Kıyma", "Domates", "Biber", "Soğan"], zorluk: "Zor", sure: "60 dk", tarif: "Patlıcanları kızart, kıymalı harcı içine doldur, fırınla." },
    { ad: "Sebzeli Omlet", kategori: "Kahvaltı", malzemeler: ["Yumurta", "Biber", "Peynir", "Marul"], zorluk: "Kolay", sure: "10 dk", tarif: "Yumurtaları çırp, sebzeleri ekle, pişir." },
    { ad: "Tavuk Sote", kategori: "Ana Yemek", malzemeler: ["Tavuk (Çiğ)", "Biber", "Domates", "Soğan"], zorluk: "Orta", sure: "30 dk", tarif: "Tavukları doğra, sebzelerle sotele." }
];

export default function App() {
    const [urunler, setUrunler] = useState([
        { id: 1, ad: "Süt (Açılmış)", miktar: "1 Litre", saklamaYeri: "dolap", skt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
        { id: 2, ad: "Yumurta", miktar: "4 Adet", saklamaYeri: "dolap", skt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    ]);

    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");
    const [aktifSekme, setAktifSekme] = useState('liste');

    const bugun = new Date().toISOString().split('T')[0];

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
            miktar: `${miktar} ${GIDA_VERITABANI[secilenUrunKey]?.birim || ''}`,
            saklamaYeri,
            skt: manuelTarih
        };
        setUrunler([...urunler, yeni]);
        setSecilenUrunKey(""); setMiktar("");
    };

    const urunSil = (id) => setUrunler(urunler.filter(u => u.id !== id));
    const kalanGun = (t) => Math.ceil((new Date(t) - new Date().setHours(0, 0, 0, 0)) / 86400000);

    return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-x-hidden">
            {/* GLOBAL CSS OVERRIDE - TAM EKRAN İÇİN KRİTİK */}
            <style dangerouslySetInnerHTML={{
                __html: `
        body, html, #root { 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 100% !important; 
          max-width: none !important; 
          display: block !important;
        }
      `}} />

            {/* Header - Full Width */}
            <header className="w-full bg-indigo-700 text-white p-6 shadow-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <ChefHat className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Akıllı Mutfak</h1>
                        <p className="text-indigo-100 text-xs font-bold opacity-75">STOK & PLANLAMA SİSTEMİ</p>
                    </div>
                </div>
                <div className="bg-indigo-800/50 px-4 py-2 rounded-full border border-white/10 hidden md:block">
                    <span className="text-sm font-bold">{urunler.length} Aktif Ürün</span>
                </div>
            </header>

            {/* Nav - Full Width */}
            <nav className="w-full flex bg-white border-b sticky top-0 z-50">
                {['liste', 'plan', 'tarifler'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setAktifSekme(tab)}
                        className={`flex-1 py-4 text-sm font-black uppercase transition-all border-b-4 ${aktifSekme === tab ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab === 'liste' ? 'Envanter' : tab === 'plan' ? 'Tüketim Planı' : 'Tarif Önerileri'}
                    </button>
                ))}
            </nav>

            {/* Content Area - Full Width */}
            <main className="flex-1 w-full p-4 md:p-8">

                {aktifSekme === 'liste' && (
                    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1600px] mx-auto">
                        {/* Form - Sol Taraf */}
                        <div className="w-full lg:w-96 shrink-0">
                            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 sticky top-24">
                                <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 uppercase">
                                    <Plus className="text-indigo-600" /> Yeni Ekle
                                </h2>
                                <form onSubmit={urunEkle} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Gıda</label>
                                        <select className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all" value={secilenUrunKey} onChange={(e) => setSecilenUrunKey(e.target.value)}>
                                            <option value="">Seçiniz...</option>
                                            {Object.keys(GIDA_VERITABANI).map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Yer</label>
                                        <div className="grid grid-cols-3 gap-2 mt-1">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-2 rounded-xl text-[10px] font-bold uppercase ${saklamaYeri === t ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="number" placeholder="Miktar" className="p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                        <input type="date" className="p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none text-xs" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                    </div>
                                    <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-wider">Stoka Ekle</button>
                                </form>
                            </div>
                        </div>

                        {/* Liste - Sağ Taraf */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {urunler.map(u => {
                                    const k = kalanGun(u.skt);
                                    return (
                                        <div key={u.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm group hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-2xl ${k <= 2 ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                                                    {u.saklamaYeri === 'buzluk' ? <Snowflake size={20} /> : <Thermometer size={20} />}
                                                </div>
                                                <button onClick={() => urunSil(u.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                                            </div>
                                            <h3 className="font-black text-slate-800 text-lg">{u.ad}</h3>
                                            <p className="text-sm font-bold text-slate-400">{u.miktar}</p>
                                            <div className={`mt-4 pt-4 border-t border-slate-50 flex justify-between items-center`}>
                                                <span className="text-[10px] font-black uppercase text-slate-300">Kalan Süre</span>
                                                <span className={`text-xs font-black uppercase ${k <= 2 ? 'text-rose-500' : 'text-emerald-500'}`}>{k} GÜN</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {aktifSekme === 'plan' && (
                    <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['Bugün', 'Yarın', 'Hafta İçi'].map((day, idx) => (
                            <div key={day} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                                <h3 className="text-2xl font-black text-slate-800 mb-6 uppercase italic tracking-tighter">{day}</h3>
                                <div className="space-y-3">
                                    {urunler.filter((_, i) => i % 3 === idx).map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                            <span className="font-bold text-slate-700">{u.ad}</span>
                                            <ArrowRight size={16} className="text-slate-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {aktifSekme === 'tarifler' && (
                    <div className="w-full max-w-4xl mx-auto space-y-6">
                        {TARIF_VERITABANI.map((tarif, i) => (
                            <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{tarif.kategori}</span>
                                    <h3 className="text-3xl font-black text-slate-800 mt-2">{tarif.ad}</h3>
                                    <p className="text-slate-500 mt-4 leading-relaxed">{tarif.tarif}</p>
                                    <div className="flex gap-2 mt-6">
                                        {tarif.malzemeler.map(m => (
                                            <span key={m} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">{m}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full md:w-32 flex flex-col items-center gap-2 shrink-0">
                                    <div className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-100">
                                        %100
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase text-center">Malzeme Uyumu</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </main>

            <footer className="w-full bg-slate-900 text-slate-500 p-6 text-center text-[10px] font-bold uppercase tracking-widest">
                Smart Kitchen Assistant © 2024 - Sıfır Atık, Maksimum Lezzet
            </footer>
        </div>
    );
}