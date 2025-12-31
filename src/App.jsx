import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, List, Settings, Save,
    ChevronRight, Calendar, Package
} from 'lucide-react';

export default function App() {
    // --- STATE YÖNETİMİ ---
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [envanter, setEnvanter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    // Form State'leri
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

    // Otomatik SKT Hesaplama
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

    const kütüphaneEkle = async (e) => {
        e.preventDefault();
        if (!yeniGida.ad) return;
        const { error } = await supabase.from('gida_kutuphanesi').insert([yeniGida]);
        if (!error) { setYeniGida({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" }); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#070B14] text-indigo-500 font-black animate-pulse uppercase tracking-[0.3em] text-xs">YÜKLENİYOR...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#070B14] text-slate-300 font-sans overflow-hidden">

            {/* SOL MENÜ (SIDEBAR) */}
            <aside className="w-56 bg-[#0F172A] border-r border-white/5 flex flex-col shrink-0 z-20 shadow-2xl">
                <div className="p-5 flex items-center gap-2 border-b border-white/5 mb-4">
                    <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-600/30">
                        <ChefHat className="text-white w-3.5 h-3.5" />
                    </div>
                    <h1 className="text-[11px] font-black text-white tracking-[0.15em] uppercase italic">
                        MUTFAK<span className="text-indigo-400">PRO</span>
                    </h1>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-[11px] ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                        <List size={16} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition-all text-[11px] ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                        <Settings size={16} /> Kütüphane
                    </button>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Çevrimiçi</span>
                    </div>
                </div>
            </aside>

            {/* ANA ALAN */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#070B14]">

                {/* ÜST BAR */}
                <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 shrink-0 bg-[#0F172A]/30 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-600 uppercase text-[9px] font-black tracking-widest">Sistem</span>
                        <ChevronRight size={12} className="text-slate-800" />
                        <span className="text-white uppercase text-[10px] font-black tracking-tighter italic">{aktifSekme === 'liste' ? 'Mevcut Stoklar' : 'Ürün Tanımları'}</span>
                    </div>

                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input
                            type="text"
                            placeholder="Ara..."
                            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/50 border border-white/5 rounded-lg text-[11px] text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </header>

                {/* İÇERİK */}
                <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    {aktifSekme === 'liste' ? (
                        <div className="grid grid-cols-12 gap-8 items-start">

                            {/* FORM */}
                            <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                                <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/5 shadow-2xl">
                                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
                                        <Package size={14} className="text-indigo-400" />
                                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Stok Ekle</h3>
                                    </div>

                                    <form onSubmit={envanterEkle} className="space-y-4">
                                        <div>
                                            <label className="text-[8px] font-black text-slate-500 uppercase mb-1.5 block tracking-widest">Gıda Tipi</label>
                                            <select className="w-full p-2.5 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                                <option value="">Seçiniz...</option>
                                                {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[8px] font-black text-slate-500 uppercase mb-1.5 block tracking-widest">Ortam</label>
                                            <div className="grid grid-cols-3 gap-1 bg-[#070B14] p-1 rounded-xl border border-white/10">
                                                {['dolap', 'buzluk', 'kiler'].map(t => (
                                                    <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="number" placeholder="Miktar" className="w-full p-2.5 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white outline-none" value={miktarDegeri} onChange={e => setMiktarDegeri(e.target.value)} />
                                            <input type="date" className="w-full p-2.5 bg-[#070B14] border border-white/10 rounded-xl text-[10px] text-white outline-none font-bold" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>

                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-black text-white text-[9px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                            <Plus size={14} /> KAYDET
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* LİSTE */}
                            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                                    {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                        const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                        const kritik = gun <= 3;
                                        return (
                                            <div key={u.id} className={`group p-5 rounded-2xl border transition-all ${kritik ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[#0F172A] border-white/5 shadow-xl'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className={`p-2 rounded-lg ${u.saklama_yeri === 'buzluk' ? 'bg-blue-500/10 text-blue-400' : u.saklama_yeri === 'dolap' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                        {u.saklama_yeri === 'buzluk' ? <Snowflake size={16} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={16} /> : <Sun size={16} />}
                                                    </div>
                                                    <button onClick={() => { if (window.confirm('Silinsin mi?')) supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-700 hover:text-rose-500"><Trash2 size={16} /></button>
                                                </div>

                                                <h4 className="font-black text-white uppercase tracking-tight text-xs mb-1 truncate">{u.gida_ad}</h4>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase mb-5">
                                                    <span>{u.miktar}</span>
                                                    <span className="w-0.5 h-0.5 rounded-full bg-slate-800"></span>
                                                    <span>{u.saklama_yeri}</span>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[8px] font-black text-slate-600 uppercase">Son Tarih</span>
                                                        <span className="text-[10px] font-mono font-bold text-slate-400">{new Date(u.skt).toLocaleDateString('tr-TR')}</span>
                                                    </div>
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${gun <= 0 ? 'bg-rose-600 text-white animate-pulse' : kritik ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {gun <= 0 ? 'DOLDU' : `${gun} GÜN`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* KÜTÜPHANE */
                        <div className="grid grid-cols-12 gap-8 max-w-6xl">
                            <div className="col-span-12 lg:col-span-4">
                                <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/5 shadow-2xl">
                                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-5">Gıda Kütüphanesi</h3>
                                    <form onSubmit={kütüphaneEkle} className="space-y-3">
                                        <input type="text" placeholder="Gıda Adı" className="w-full p-2.5 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white outline-none" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                        <select className="w-full p-2.5 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}>
                                            <option value="Adet">Adet</option><option value="Kg">Kg</option><option value="Litre">Litre</option><option value="Paket">Paket</option>
                                        </select>
                                        <div className="grid grid-cols-1 gap-2 pt-1">
                                            {['dolap', 'buzluk', 'kiler'].map(field => (
                                                <div key={field} className="flex items-center gap-3 bg-[#070B14] p-2 rounded-xl border border-white/5">
                                                    <span className="text-[8px] font-black text-slate-600 uppercase w-12">{field}</span>
                                                    <input type="number" placeholder="Gün" className="bg-transparent w-full text-xs text-white outline-none text-right" value={yeniGida[`${field}_omru`]} onChange={e => setYeniGida({ ...yeniGida, [`${field}_omru`]: e.target.value })} />
                                                </div>
                                            ))}
                                        </div>
                                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-black text-white text-[9px] uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                                            <Save size={14} /> TANIMLA
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-8">
                                <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden">
                                    <table className="w-full text-left text-[10px]">
                                        <thead className="bg-[#070B14] text-slate-600 uppercase font-black">
                                            <tr>
                                                <th className="p-4">Gıda</th>
                                                <th className="p-4">Dolap</th>
                                                <th className="p-4">Buzluk</th>
                                                <th className="p-4">Kiler</th>
                                                <th className="p-4 text-right">#</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {Object.values(gidaVeritabani).map(g => (
                                                <tr key={g.id} className="hover:bg-white/[0.01] transition-colors">
                                                    <td className="p-4 font-black text-white uppercase">{g.ad} <span className="text-slate-700 font-normal ml-1">({g.birim})</span></td>
                                                    <td className="p-4 text-indigo-400 font-bold">{g.dolap_omru} G</td>
                                                    <td className="p-4 text-blue-400 font-bold">{g.buzluk_omru} G</td>
                                                    <td className="p-4 text-orange-400 font-bold">{g.kiler_omru} G</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => { if (window.confirm('Silinsin mi?')) supabase.from('gida_kutuphanesi').delete().eq('id', g.id).then(verileriGetir); }} className="text-slate-800 hover:text-rose-500"><Trash2 size={14} /></button>
                                                    </td>
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
        </div>
    );
}