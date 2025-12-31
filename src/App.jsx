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
        if (!secilenUrunKey || !manuelTarih) return alert("Lütfen tüm alanları doldurun.");
        const { error } = await supabase.from('envanter').insert([{
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey].birim}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        }]);
        if (!error) { setSecilenUrunKey(""); setMiktar(""); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-slate-400 text-sm font-medium">Yükleniyor...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#0F172A] text-slate-300 font-sans overflow-hidden text-sm">

            {/* SIDEBAR - 240px Standart Genişlik */}
            <aside className="w-60 bg-[#1E293B] border-r border-slate-700/50 flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <ChefHat className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-base font-bold text-white tracking-tight">MutfakPro</h1>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-colors ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <List size={18} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-colors ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Settings size={18} /> Kütüphane
                    </button>
                </nav>

                <div className="p-6 border-t border-slate-700/50">
                    <button className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rose-400 transition-colors"><LogOut size={14} /> Çıkış Yap</button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F172A]">

                {/* HEADER - Daha ince ve sade */}
                <header className="h-16 flex items-center justify-between px-8 shrink-0 border-b border-slate-700/50 bg-[#0F172A]">
                    <h2 className="text-base font-bold text-white">{aktifSekme === 'liste' ? 'Stok Listesi' : 'Ayarlar'}</h2>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Ara..."
                            className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs outline-none focus:border-indigo-500 transition-all text-white"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </header>

                {/* CONTENT AREA - Normal dolgu ve hizalama */}
                <main className="flex-1 overflow-y-auto p-6">

                    {aktifSekme === 'liste' ? (
                        <div className="flex flex-row gap-6 items-start h-full">

                            {/* FORM - 300px Kompakt Genişlik */}
                            <aside className="w-[300px] shrink-0 bg-[#1E293B] p-5 rounded-xl border border-slate-700/50 shadow-sm">
                                <h3 className="text-xs font-bold text-white mb-5 flex items-center gap-2 uppercase tracking-wider opacity-70">Yeni Kayıt</h3>
                                <form onSubmit={urunEkle} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-400 ml-1">Ürün Seçimi</label>
                                        <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-indigo-500" value={secilenUrunKey} onChange={e => setSecilenUrunKey(e.target.value)}>
                                            <option value="">Seçin...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-400 ml-1">Saklama Yeri</label>
                                        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-slate-400 ml-1">Miktar</label>
                                            <input type="number" className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" value={miktar} onChange={(e) => setMiktar(e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-semibold text-slate-400 ml-1">SKT</label>
                                            <input type="date" className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-white outline-none" value={manuelTarih} onChange={(e) => setManuelTarih(e.target.value)} />
                                        </div>
                                    </div>

                                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 mt-2">
                                        Ekle <ArrowRight size={14} />
                                    </button>
                                </form>
                            </aside>

                            {/* KARTLAR - Daha sıkı grid */}
                            <section className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start">
                                {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    return (
                                        <div key={u.id} className={`p-4 rounded-xl border transition-all ${kritik ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[#1E293B] border-slate-700/50'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-2 rounded-lg ${kritik ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-900 text-indigo-400'}`}>
                                                    {u.saklama_yeri === 'buzluk' ? <Snowflake size={16} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={16} /> : <Sun size={16} />}
                                                </div>
                                                <button onClick={async () => { if (window.confirm('Silinsin mi?')) { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); } }} className="text-slate-600 hover:text-rose-500 p-1">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>

                                            <h4 className="text-sm font-bold text-white truncate mb-0.5">{u.ad}</h4>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{u.miktar} • {u.saklama_yeri}</p>

                                            <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                                                <span className="text-[10px] text-slate-500 font-medium">Kalan Süre:</span>
                                                <span className={`text-xs font-bold ${kritik ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {gun <= 0 ? 'Süresi Doldu' : `${gun} Gün`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>

                        </div>
                    ) : (
                        <div className="text-slate-500 text-xs italic">Kütüphane ayarları yakında burada olacak.</div>
                    )}
                </main>
            </div>
        </div>
    );
}