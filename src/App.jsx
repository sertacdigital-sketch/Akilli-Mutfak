import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Calendar, AlertTriangle, CheckCircle,
    Utensils, Pencil, Save, X, Snowflake, Sun,
    Thermometer, ChefHat, Package, ListFilter, Settings, Search
} from 'lucide-react';

export default function App() {
    // --- BAŞLANGIÇ VERİSİ (Kütüphane Boşsa Görünecekler) ---
    const varsayilanKutuphane = {
        "Süt": { ad: "Süt", birim: "Litre", dolap: 7, buzluk: 90, kiler: null },
        "Yumurta": { ad: "Yumurta", birim: "Adet", dolap: 30, buzluk: null, kiler: null },
        "Tavuk": { ad: "Tavuk", birim: "Gram", dolap: 2, buzluk: 180, kiler: null },
        "Domates": { ad: "Domates", birim: "Kg", dolap: 5, buzluk: null, kiler: 3 },
        "Ekmek": { ad: "Ekmek", birim: "Adet", dolap: 3, buzluk: 30, kiler: 2 }
    };

    // --- STATES ---
    const [gidaVeritabani, setGidaVeritabani] = useState(varsayilanKutuphane);
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    // Form States (Yeni Gıda Ekleme)
    const [yeniGida, setYeniGida] = useState({ ad: "", birim: "Adet", dolap: "", buzluk: "", kiler: "" });

    // --- VERİ ÇEKME ---
    useEffect(() => {
        verileriGetir();
    }, []);

    const verileriGetir = async () => {
        setLoading(true);
        try {
            // 1. Kütüphaneyi Çek
            const { data: kutData } = await supabase.from('gida_kutuphanesi').select('*');
            if (kutData && kutData.length > 0) {
                const kutObj = {};
                kutData.forEach(item => { kutObj[item.ad] = item; });
                setGidaVeritabani(kutObj);
            }

            // 2. Envanteri Çek
            const { data: envData } = await supabase.from('envanter').select('*').order('skt', { ascending: true });
            if (envData) setUrunler(envData);
        } catch (e) {
            console.error("Veri çekme hatası:", e);
        }
        setLoading(false);
    };

    // --- OTOMATİK SKT HESAPLAMA ---
    useEffect(() => {
        if (secilenUrunKey && gidaVeritabani[secilenUrunKey]) {
            const rafOmru = gidaVeritabani[secilenUrunKey][saklamaYeri];
            if (rafOmru) {
                const d = new Date();
                d.setDate(d.getDate() + parseInt(rafOmru));
                setManuelTarih(d.toISOString().split('T')[0]);
            }
        }
    }, [secilenUrunKey, saklamaYeri, gidaVeritabani]);

    // --- AKSİYONLAR ---
    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return;

        const yeni = {
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey]?.birim || ''}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        };

        const { error } = await supabase.from('envanter').insert([yeni]);
        if (!error) verileriGetir();
        setSecilenUrunKey(""); setMiktar("");
    };

    const urunSil = async (id) => {
        await supabase.from('envanter').delete().eq('id', id);
        setUrunler(prev => prev.filter(u => u.id !== id));
    };

    const kalanGun = (t) => Math.ceil((new Date(t) - new Date().setHours(0, 0, 0, 0)) / 86400000);

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-slate-600 italic">Mutfak yükleniyor...</p>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
            {/* Global Stil: Tam Ekran ve Modern Font */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
                .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(10px); }
            ` }} />

            {/* HEADER - Full Width */}
            <header className="w-full bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg">
                        <ChefHat className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-800">MUTFAK<span className="text-indigo-600 text-xs ml-1 font-black">PRO</span></h1>
                </div>

                <nav className="hidden md:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {['liste', 'ayarlar'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setAktifSekme(tab)}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${aktifSekme === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tab === 'liste' ? 'ENVANTER' : 'GIDA KÜTÜPHANESİ'}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Bulut Aktif</span>
                </div>
            </header>

            {/* ANA İÇERİK - Full Width */}
            <main className="w-full flex-1 p-6 lg:p-10">

                {aktifSekme === 'liste' && (
                    <div className="w-full flex flex-col lg:flex-row gap-8 items-start">

                        {/* SOL: ÜRÜN EKLEME FORMU */}
                        <aside className="w-full lg:w-[380px] bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-28">
                            <h2 className="text-xl font-extrabold mb-6 flex items-center gap-2">
                                <Plus className="text-indigo-600" /> Ürün Ekle
                            </h2>
                            <form onSubmit={urunEkle} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gıda Seçin</label>
                                    <select
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 transition-all outline-none"
                                        value={secilenUrunKey}
                                        onChange={(e) => setSecilenUrunKey(e.target.value)}
                                    >
                                        <option value="">Seçiniz...</option>
                                        {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nerede Saklayacaksınız?</label>
                                    <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                                        {['dolap', 'buzluk', 'kiler'].map(t => (
                                            <button
                                                key={t} type="button"
                                                onClick={() => setSaklamaYeri(t)}
                                                className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Miktar</label>
                                        <input type="number" placeholder="1" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Son Tüketim</label>
                                        <input type="date" className="w-full p-4 bg-indigo-50 border-2 border-indigo-100 rounded-2xl font-bold text-xs text-indigo-700" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                    </div>
                                </div>

                                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 shadow-lg shadow-slate-200 transition-all transform active:scale-95 flex items-center justify-center gap-2">
                                    Envantere Ekle <ArrowRight size={18} />
                                </button>
                            </form>
                        </aside>

                        {/* SAĞ: ENVANTER KARTLARI - Grid Yapısı */}
                        <section className="flex-1 w-full">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mevcut Stok <span className="text-slate-300 ml-2">({urunler.length})</span></h2>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Stokta ara..."
                                        className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-100 transition-all w-64"
                                        onChange={(e) => setAramaTerimi(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = kalanGun(u.skt);
                                    const kritik = gun <= 3;
                                    return (
                                        <div key={u.id} className={`group bg-white p-6 rounded-[32px] border-2 transition-all hover:shadow-2xl hover:-translate-y-1 ${kritik ? 'border-rose-100 bg-rose-50/20' : 'border-slate-50'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-4 rounded-2xl ${kritik ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                    {u.saklama_yeri === 'buzluk' ? <Snowflake /> : u.saklama_yeri === 'dolap' ? <Thermometer /> : <Sun />}
                                                </div>
                                                <button onClick={() => urunSil(u.id)} className="p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-600 rounded-xl">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-800">{u.ad}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{u.miktar} • {u.saklama_yeri}</p>

                                            <div className="mt-8 pt-5 border-t border-slate-100/50 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Kalan Süre</p>
                                                    <p className={`text-sm font-black ${kritik ? 'text-rose-600' : 'text-slate-700'}`}>
                                                        {gun <= 0 ? 'SÜRESİ DOLDU' : `${gun} Gün`}
                                                    </p>
                                                </div>
                                                {kritik && <AlertTriangle className="text-rose-500 animate-bounce" size={20} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}

                {aktifSekme === 'ayarlar' && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black">Gıda Kütüphanesi</h2>
                                    <p className="text-slate-400 text-sm font-medium">Otomatik SKT hesaplaması için saklama sürelerini buradan yönetin.</p>
                                </div>
                                <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700">
                                    <Plus size={20} /> Yeni Gıda Tanımla
                                </button>
                            </div>
                            <table className="w-full">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase">Gıda Türü</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase">Birim</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase text-blue-600">Dolap (Gün)</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase text-cyan-600">Buzluk (Gün)</th>
                                        <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase text-amber-600">Kiler (Gün)</th>
                                        <th className="px-8 py-5 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {Object.entries(gidaVeritabani).map(([key, val]) => (
                                        <tr key={key} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-5 font-bold text-slate-700">{key}</td>
                                            <td className="px-8 py-5 text-center font-semibold text-slate-500">{val.birim}</td>
                                            <td className="px-8 py-5 text-center font-black text-blue-600">{val.dolap || '-'}</td>
                                            <td className="px-8 py-5 text-center font-black text-cyan-600">{val.buzluk || '-'}</td>
                                            <td className="px-8 py-5 text-center font-black text-amber-600">{val.kiler || '-'}</td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}