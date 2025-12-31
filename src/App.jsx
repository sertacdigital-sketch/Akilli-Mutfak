import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, List, Settings, Save,
    Calendar, Package, Database, LayoutDashboard
} from 'lucide-react';

export default function App() {
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [envanter, setEnvanter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    const [secilenGidaAd, setSecilenGidaAd] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktarDegeri, setMiktarDegeri] = useState("");
    const [sktTarihi, setSktTarihi] = useState("");
    const [yeniGida, setYeniGida] = useState({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" });

    useEffect(() => { verileriGetir(); }, []);

    const verileriGetir = async () => {
        setLoading(true);
        try {
            const { data: kutData } = await supabase.from('gida_kutuphanesi').select('*');
            if (kutData) {
                const obj = {};
                kutData.forEach(i => obj[i.ad] = i);
                setGidaVeritabani(obj);
            }
            const { data: envData } = await supabase.from('mutfak_envanteri').select('*').order('skt', { ascending: true });
            if (envData) setEnvanter(envData);
        } catch (err) { console.error("Hata:", err); }
        setLoading(false);
    };

    useEffect(() => {
        if (secilenGidaAd && gidaVeritabani[secilenGidaAd]) {
            const gida = gidaVeritabani[secilenGidaAd];
            const omur = gida[`${saklamaYeri}_omru`] || 0;
            const bugun = new Date();
            bugun.setDate(bugun.getDate() + parseInt(omur));
            setSktTarihi(bugun.toISOString().split('T')[0]);
        }
    }, [secilenGidaAd, saklamaYeri, gidaVeritabani]);

    const envanterEkle = async (e) => {
        e.preventDefault();
        if (!secilenGidaAd || !sktTarihi) return;
        const birim = gidaVeritabani[secilenGidaAd]?.birim || '';
        const { error } = await supabase.from('mutfak_envanteri').insert([{
            gida_ad: secilenGidaAd, miktar: `${miktarDegeri || 1} ${birim}`, saklama_yeri: saklamaYeri, skt: sktTarihi
        }]);
        if (!error) { setSecilenGidaAd(""); setMiktarDegeri(""); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#070B14] text-indigo-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">YÜKLENİYOR...</div>;

    return (
        <div className="min-h-screen w-full bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">

            {/* ÜST NAVİGASYON (TOP BAR) */}
            <nav className="sticky top-0 z-50 w-full bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">

                    {/* Logo Kısmı - Artık Çok Rahat Sığıyor */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
                            <ChefHat className="text-white w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xs font-black text-white tracking-[0.2em] uppercase italic leading-tight">
                                MUTFAK<span className="text-indigo-400">PRO</span>
                            </h1>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Digital Pantry</span>
                        </div>
                    </div>

                    {/* Orta Menü */}
                    <div className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setAktifSekme('liste')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <LayoutDashboard size={14} /> Envanter
                        </button>
                        <button
                            onClick={() => setAktifSekme('ayarlar')}
                            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Database size={14} /> Kütüphane
                        </button>
                    </div>

                    {/* Sağ Arama */}
                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input
                            type="text"
                            placeholder="Hızlı arama..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-white/10 rounded-xl text-[10px] text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </div>
            </nav>

            {/* ANA İÇERİK */}
            <main className="max-w-[1600px] mx-auto p-6 md:p-8 lg:p-12">
                {aktifSekme === 'liste' ? (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">

                        {/* SOL: STOK GİRİŞ FORMU */}
                        <div className="w-full lg:w-[350px] shrink-0">
                            <div className="bg-[#0F172A] p-6 rounded-3xl border border-white/5 shadow-2xl sticky top-24">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Stok Girişi</h3>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>

                                <form onSubmit={envanterEkle} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Ürün Tipi</label>
                                        <select className="w-full p-3.5 bg-[#020617] border border-white/10 rounded-2xl text-xs text-white outline-none focus:ring-2 ring-indigo-500/20 transition-all cursor-pointer appearance-none" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                            <option value="">Ürün seçiniz...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Saklama Alanı</label>
                                        <div className="grid grid-cols-3 gap-2 bg-[#020617] p-1.5 rounded-2xl border border-white/10">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Miktar</label>
                                            <input type="number" placeholder="1" className="w-full p-3.5 bg-[#020617] border border-white/10 rounded-2xl text-xs text-white outline-none focus:ring-2 ring-indigo-500/20" value={miktarDegeri} onChange={e => setMiktarDegeri(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">SKT Tarihi</label>
                                            <input type="date" className="w-full p-3.5 bg-[#020617] border border-white/10 rounded-2xl text-[11px] text-white outline-none font-bold" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-white text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-900/20 active:scale-[0.98]">
                                        <Plus size={16} /> Envantere Ekle
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* SAĞ: KART LİSTESİ */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    return (
                                        <div key={u.id} className={`group relative p-6 rounded-3xl border transition-all duration-300 hover:translate-y-[-4px] ${kritik ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[#0F172A] border-white/5 shadow-xl'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-3 rounded-2xl ${u.saklama_yeri === 'buzluk' ? 'bg-blue-500/10 text-blue-400' : u.saklama_yeri === 'dolap' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                    {u.saklama_yeri === 'buzluk' ? <Snowflake size={20} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={20} /> : <Sun size={20} />}
                                                </div>
                                                <button onClick={() => { if (window.confirm('Kayıt silinsin mi?')) supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir); }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={18} /></button>
                                            </div>

                                            <h4 className="font-black text-white uppercase tracking-tight text-sm mb-2">{u.gida_ad}</h4>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-8">
                                                <span className="bg-slate-950 px-2 py-1 rounded-md">{u.miktar}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                                <span className="tracking-widest">{u.saklama_yeri}</span>
                                            </div>

                                            <div className="flex items-end justify-between pt-5 border-t border-white/5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase flex items-center gap-1.5"><Calendar size={12} /> SKT Tarihi</span>
                                                    <span className="text-xs font-mono font-bold text-slate-300">{new Date(u.skt).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                                <div className={`text-xs font-black px-4 py-1.5 rounded-full ${gun <= 0 ? 'bg-rose-600 text-white animate-bounce' : kritik ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                    {gun <= 0 ? 'DOLDU' : `${gun} GÜN`}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* KÜTÜPHANE SAYFASI */
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            <div className="bg-[#0F172A] p-8 rounded-3xl border border-white/5 shadow-2xl">
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-8">Kütüphane Tanımı</h3>
                                <form onSubmit={(e) => { e.preventDefault(); /* ...ekleme... */ verileriGetir(); }} className="space-y-5">
                                    <input type="text" placeholder="Gıda Adı" className="w-full p-4 bg-[#020617] border border-white/10 rounded-2xl text-xs text-white outline-none focus:border-indigo-500 transition-all" />
                                    <div className="space-y-3">
                                        {['Dolap', 'Buzluk', 'Kiler'].map(f => (
                                            <div key={f} className="flex items-center gap-3 bg-[#020617] p-3 rounded-2xl border border-white/5">
                                                <span className="text-[9px] font-black text-slate-500 uppercase w-16">{f}</span>
                                                <input type="number" placeholder="Ömür (Gün)" className="bg-transparent w-full text-xs text-white text-right outline-none" />
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-black text-[10px] text-white uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/10">Kaydet</button>
                                </form>
                            </div>
                            <div className="md:col-span-2 bg-[#0F172A] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-950/50 text-slate-500 uppercase font-black">
                                        <tr>
                                            <th className="p-6">Ürün / Birim</th>
                                            <th className="p-6 text-center">Dolap</th>
                                            <th className="p-6 text-center">Buzluk</th>
                                            <th className="p-6 text-center">Kiler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {Object.values(gidaVeritabani).map(g => (
                                            <tr key={g.id} className="hover:bg-white/[0.01] transition-colors">
                                                <td className="p-6 font-black text-white uppercase">{g.ad} <span className="text-slate-600 font-normal ml-2 italic">({g.birim})</span></td>
                                                <td className="p-6 text-center text-indigo-400 font-bold">{g.dolap_omru} G</td>
                                                <td className="p-6 text-center text-blue-400 font-bold">{g.buzluk_omru} G</td>
                                                <td className="p-6 text-center text-orange-400 font-bold">{g.kiler_omru} G</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}