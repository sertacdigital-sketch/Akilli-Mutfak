import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ArrowRight, AlertTriangle, ChefHat,
    List, Settings, LogOut, Circle
} from 'lucide-react';

export default function App() {
    // --- STATE YÖNETİMİ ---
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");
    const [aramaTerimi, setAramaTerimi] = useState("");

    // --- VERİ ÇEKME ---
    useEffect(() => { verileriGetir(); }, []);

    const verileriGetir = async () => {
        setLoading(true);
        const { data: kutData } = await supabase.from('gida_kutuphanesi').select('*');
        if (kutData) {
            const obj = {};
            kutData.forEach(i => obj[i.ad] = i);
            setGidaVeritabani(obj);
        }
        const { data: envData } = await supabase.from('envanter').select('*').order('skt', { ascending: true });
        if (envData) setUrunler(envData);
        setLoading(false);
    };

    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return alert("Bilgileri kontrol et!");
        const { error } = await supabase.from('envanter').insert([{
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey].birim}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        }]);
        if (!error) { setSecilenUrunKey(""); setMiktar(""); verileriGetir(); }
    };

    const urunSil = async (id) => {
        if (window.confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
            const { error } = await supabase.from('envanter').delete().eq('id', id);
            if (!error) verileriGetir();
        }
    };

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#070B14] text-indigo-500 font-black text-4xl animate-pulse tracking-tighter">
            SİSTEM YÜKLENİYOR...
        </div>
    );

    return (
        // ANA KONTEYNER: Ekranı tam kaplar, taşmayı engeller
        <div className="flex h-screen w-screen bg-[#070B14] text-slate-200 font-sans overflow-hidden">

            {/* SOL SIDEBAR: Sabit genişlik (400px), daha ferah */}
            <aside className="w-[400px] bg-slate-900/40 border-r border-white/5 flex flex-col shrink-0 z-20">
                <div className="p-16 flex items-center gap-6">
                    <div className="bg-indigo-600 p-5 rounded-[32px] shadow-2xl shadow-indigo-600/40">
                        <ChefHat className="text-white w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none">
                        MUTFAK<span className="text-indigo-500 text-2xl block tracking-[0.2em]">PRO</span>
                    </h1>
                </div>

                <nav className="flex-1 px-10 space-y-6">
                    <button
                        onClick={() => setAktifSekme('liste')}
                        className={`w-full flex items-center gap-6 px-10 py-8 rounded-[40px] text-2xl font-black transition-all duration-500 ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-3xl shadow-indigo-600/40 scale-105' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        <List size={32} /> Envanter
                    </button>
                    <button
                        onClick={() => setAktifSekme('ayarlar')}
                        className={`w-full flex items-center gap-6 px-10 py-8 rounded-[40px] text-2xl font-black transition-all duration-500 ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-3xl shadow-indigo-600/40 scale-105' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        <Settings size={32} /> Kütüphane
                    </button>
                </nav>

                <div className="p-16">
                    <button className="flex items-center gap-4 text-slate-600 font-black text-lg hover:text-rose-500 transition-all uppercase tracking-widest">
                        <LogOut size={24} /> Sistemi Kapat
                    </button>
                </div>
            </aside>

            {/* SAĞ ANA ALAN: flex-1 ve min-w-0 ile tüm boşluğu doldurur */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20 relative">

                {/* HEADER: Dev fontlar ve geniş padding */}
                <header className="h-44 border-b border-white/5 flex items-center justify-between px-24 shrink-0 backdrop-blur-3xl z-10">
                    <div className="space-y-3">
                        <h2 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
                            {aktifSekme === 'liste' ? 'Mevcut Stoklar' : 'Kütüphane'}
                        </h2>
                        <div className="flex items-center gap-4">
                            <Circle size={12} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                            <span className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Veritabanı Senkronize</span>
                        </div>
                    </div>

                    {/* ARAMA ÇUBUĞU: Daha geniş (600px) */}
                    <div className="relative w-[600px]">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600" size={32} />
                        <input
                            type="text"
                            placeholder="Hızlı arama..."
                            className="w-full pl-24 pr-10 py-8 bg-white/5 border border-white/10 rounded-full text-white font-bold text-2xl outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all shadow-inner"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </header>

                {/* İÇERİK: p-24 ve gap-24 ile içerikler arası ferahlık */}
                <main className="flex-1 overflow-y-auto p-24 w-full">

                    {aktifSekme === 'liste' ? (
                        <div className="flex flex-col xl:flex-row gap-24 w-full items-start">

                            {/* SOL PANEL: Kayıt Formu (450px sabit genişlik) */}
                            <aside className="w-full xl:w-[450px] shrink-0 sticky top-0">
                                <div className="bg-slate-900/60 p-16 rounded-[70px] border border-white/5 shadow-3xl">
                                    <h3 className="text-3xl font-black text-white mb-12 flex items-center gap-5">
                                        <Plus size={36} className="text-indigo-400" /> Yeni Kayıt
                                    </h3>
                                    <form onSubmit={urunEkle} className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">Gıda Tipi</label>
                                            <select
                                                className="w-full p-8 bg-slate-950 border border-white/10 rounded-[40px] font-black text-white text-2xl outline-none focus:border-indigo-500 transition-all cursor-pointer appearance-none shadow-xl"
                                                value={secilenUrunKey}
                                                onChange={e => setSecilenUrunKey(e.target.value)}
                                            >
                                                <option value="">Seçiniz...</option>
                                                {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">Konum</label>
                                            <div className="grid grid-cols-3 gap-4 bg-slate-950 p-3 rounded-[40px] border border-white/10">
                                                {['dolap', 'buzluk', 'kiler'].map(t => (
                                                    <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-6 rounded-[32px] text-xs font-black uppercase transition-all duration-300 ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-2xl' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">Miktar</label>
                                                <input type="number" className="w-full p-8 bg-slate-950 border border-white/10 rounded-[40px] font-black text-white text-2xl outline-none" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-4">SKT Tarihi</label>
                                                <input type="date" className="w-full p-8 bg-indigo-900/10 border border-indigo-500/20 rounded-[40px] font-black text-xl text-indigo-400 outline-none" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                            </div>
                                        </div>

                                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-10 rounded-[50px] font-black text-3xl transition-all shadow-3xl shadow-indigo-600/40 flex items-center justify-center gap-6 group">
                                            KAYDET <ArrowRight size={36} className="group-hover:translate-x-3 transition-transform" />
                                        </button>
                                    </form>
                                </div>
                            </aside>

                            {/* SAĞ PANEL: Kartlar (Kalan boşluğun tamamına yayılır) */}
                            <section className="flex-1 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-1 2xl:grid-cols-2 4xl:grid-cols-3 gap-16">
                                    {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                        const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                        const kritik = gun <= 3;
                                        return (
                                            <div key={u.id} className={`p-16 rounded-[80px] border-2 transition-all duration-500 hover:-translate-y-6 ${kritik ? 'bg-rose-500/5 border-rose-500/30 shadow-3xl shadow-rose-500/10' : 'bg-white/5 border-white/5 hover:bg-white/10 shadow-2xl shadow-black/40'}`}>
                                                <div className="flex justify-between items-start mb-16">
                                                    <div className={`p-10 rounded-[40px] ${kritik ? 'bg-rose-500 text-white shadow-2xl shadow-rose-500/40' : 'bg-slate-950 text-indigo-500 shadow-xl'}`}>
                                                        {u.saklama_yeri === 'buzluk' ? <Snowflake size={60} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={60} /> : <Sun size={60} />}
                                                    </div>
                                                    <button onClick={() => urunSil(u.id)} className="p-6 bg-white/5 text-slate-700 hover:text-rose-500 transition-colors rounded-[30px]">
                                                        <Trash2 size={32} />
                                                    </button>
                                                </div>

                                                <div className="space-y-4 mb-16">
                                                    <h4 className="text-5xl font-black text-white uppercase tracking-tighter leading-none truncate">{u.ad}</h4>
                                                    <p className="text-xl font-bold text-slate-500 uppercase tracking-[0.4em]">{u.miktar} • {u.saklama_yeri}</p>
                                                </div>

                                                <div className="pt-12 border-t border-white/10 flex justify-between items-end">
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-black text-slate-600 uppercase tracking-[0.3em]">Kalan Tüketim Süresi</p>
                                                        <p className={`text-6xl font-black ${kritik ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                            {gun <= 0 ? 'DOLDU' : `${gun} GÜN`}
                                                        </p>
                                                    </div>
                                                    {kritik && <AlertTriangle className="text-rose-500 animate-bounce" size={72} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                        </div>
                    ) : (
                        /* KÜTÜPHANE SAYFASI: Geniş Ekran Modu */
                        <div className="w-full space-y-24">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-24 rounded-[100px] shadow-4xl relative overflow-hidden">
                                <div className="relative z-10 space-y-8">
                                    <h2 className="text-9xl font-black text-white tracking-tighter italic leading-none">DATABANK</h2>
                                    <p className="text-indigo-100 font-bold text-4xl max-w-6xl opacity-80 leading-relaxed uppercase">
                                        Gıda kütüphanesini yöneterek akıllı takip sistemini kalibre edin.
                                    </p>
                                </div>
                                <ChefHat className="absolute -right-32 -bottom-32 text-white/5 w-[700px] h-[700px] -rotate-12" />
                            </div>

                            {/* Buraya kütüphane ekleme formu ve listesi gelecek... */}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}