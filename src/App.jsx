import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ArrowRight, AlertTriangle, ChefHat,
    List, Settings, LogOut, Circle
} from 'lucide-react';

export default function App() {
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");
    const [aramaTerimi, setAramaTerimi] = useState("");

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
        if (!secilenUrunKey || !manuelTarih) return alert("Eksik bilgi!");
        const { error } = await supabase.from('envanter').insert([{
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey].birim}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        }]);
        if (!error) { setSecilenUrunKey(""); setMiktar(""); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-white font-bold">Sistem Hazırlanıyor...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden">

            {/* SIDEBAR - Genişlik 280px'e düşürüldü */}
            <aside className="w-[280px] bg-slate-900 border-r border-white/5 flex flex-col shrink-0">
                <div className="p-8 flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
                        <ChefHat className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-lg font-black text-white uppercase tracking-tighter">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                        <List size={18} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
                        <Settings size={18} /> Kütüphane
                    </button>
                </nav>

                <div className="p-8 opacity-40">
                    <button className="flex items-center gap-2 text-xs font-bold hover:text-rose-500 transition-all uppercase tracking-widest"><LogOut size={16} /> Çıkış</button>
                </div>
            </aside>

            {/* ANA İÇERİK ALANI */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* HEADER - Yükseklik h-20'ye çekildi */}
                <header className="h-20 flex items-center justify-between px-10 shrink-0 border-b border-white/5 bg-slate-900/40 backdrop-blur-md">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">{aktifSekme === 'liste' ? 'Stok Takibi' : 'Ürün Kütüphanesi'}</h2>

                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Ara..."
                            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white outline-none focus:border-indigo-500/50 transition-all"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </header>

                {/* CONTENT AREA - Izgara ve Form yapısı düzenlendi */}
                <main className="flex-1 overflow-y-auto p-8 bg-slate-950/20">

                    {aktifSekme === 'liste' ? (
                        <div className="flex flex-row gap-8 items-start max-w-[1600px] mx-auto">

                            {/* SOL: FORM (Kibar ve Derli Toplu) */}
                            <aside className="w-[340px] shrink-0 bg-slate-900/50 p-7 rounded-[32px] border border-white/5 shadow-xl">
                                <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest opacity-80"><Plus size={16} className="text-indigo-400" /> Yeni Giriş</h3>
                                <form onSubmit={urunEkle} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ürün</label>
                                        <select className="w-full p-3.5 bg-slate-950 border border-white/10 rounded-xl font-bold text-sm text-white outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer" value={secilenUrunKey} onChange={e => setSecilenUrunKey(e.target.value)}>
                                            <option value="">Seçiniz...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Saklama Yeri</label>
                                        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-white/5">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-2 rounded-lg text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Miktar</label>
                                            <input type="number" placeholder="1" className="w-full p-3.5 bg-slate-950 border border-white/10 rounded-xl font-bold text-sm text-white outline-none" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SKT</label>
                                            <input type="date" className="w-full p-3 bg-indigo-900/10 border border-indigo-500/20 rounded-xl font-bold text-[11px] text-indigo-300 outline-none" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                        </div>
                                    </div>

                                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group">
                                        EKLE <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </form>
                            </aside>

                            {/* SAĞ: KARTLAR (Daha sık ve düzenli) */}
                            <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 content-start">
                                {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    return (
                                        <div key={u.id} className={`p-6 rounded-[24px] border transition-all hover:shadow-2xl ${kritik ? 'bg-rose-500/5 border-rose-500/20 shadow-rose-500/5' : 'bg-slate-900/40 border-white/5'}`}>
                                            <div className="flex justify-between items-start mb-5">
                                                <div className={`p-3.5 rounded-xl ${kritik ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-950 text-indigo-400 shadow-md'}`}>
                                                    {u.saklama_yeri === 'buzluk' ? <Snowflake size={20} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={20} /> : <Sun size={20} />}
                                                </div>
                                                <button onClick={async () => { if (window.confirm('Emin misiniz?')) { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); } }} className="text-slate-700 hover:text-rose-500 transition-colors p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <h4 className="text-lg font-black text-white uppercase tracking-tight truncate leading-none mb-1">{u.ad}</h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{u.miktar} • {u.saklama_yeri}</p>

                                            <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kalan:</span>
                                                <span className={`text-xl font-black ${kritik ? 'text-rose-500' : 'text-emerald-400'}`}>
                                                    {gun <= 0 ? 'BİTTİ' : `${gun} GÜN`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>

                        </div>
                    ) : (
                        /* KÜTÜPHANE SAYFASI */
                        <div className="max-w-5xl mx-auto py-10">
                            <div className="bg-indigo-600 p-10 rounded-[40px] shadow-xl relative overflow-hidden mb-10">
                                <h2 className="text-3xl font-black text-white relative z-10">Ürün Tanımları</h2>
                                <ChefHat size={200} className="absolute -right-12 -bottom-12 text-white/10 -rotate-12" />
                            </div>
                            {/* Kütüphane formunu buraya ekleyebilirsin */}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}