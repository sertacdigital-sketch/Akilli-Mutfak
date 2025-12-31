import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, List, Settings, Save,
    ChevronRight, Calendar, Package
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

    const kütüphaneEkle = async (e) => {
        e.preventDefault();
        if (!yeniGida.ad) return;
        const { error } = await supabase.from('gida_kutuphanesi').insert([yeniGida]);
        if (!error) { setYeniGida({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" }); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#070B14] text-indigo-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px]">YÜKLENİYOR...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#070B14] text-slate-300 font-sans overflow-hidden">
            {/* SOL MENÜ (SIDEBAR) */}
            <aside className="w-64 bg-[#0F172A] border-r border-white/5 flex flex-col shrink-0 z-20 shadow-2xl">

                {/* LOGO ALANI - TAM HİZALANMIŞ */}
                <div className="h-16 flex items-center px-6 border-b border-white/5 mb-4 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        {/* İkon boyutu küçültüldü */}
                        <div className="bg-indigo-600 p-1.5 rounded-lg shrink-0 shadow-lg shadow-indigo-600/30">
                            <ChefHat className="text-white w-4 h-4" />
                        </div>

                        {/* Yazı boyutu ve taşma koruması */}
                        <div className="flex flex-col min-w-0 overflow-hidden">
                            <h1 className="text-[12px] font-black text-white tracking-[0.1em] uppercase italic leading-none truncate">
                                MUTFAK<span className="text-indigo-400">PRO</span>
                            </h1>
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-1 truncate">
                                STOK YÖNETİMİ
                            </span>
                        </div>
                    </div>
                </div>

                {/* NAVİGASYON - LOGOYLA AYNI PADİNG (px-4) */}
                <nav className="flex-1 px-4 space-y-1">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-[11px] uppercase tracking-wider ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                        <List size={18} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-[11px] uppercase tracking-wider ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                        <Settings size={18} /> Kütüphane
                    </button>
                </nav>

                {/* ALT DURUM ALANI */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border border-white/5">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Sistem Aktif</span>
                    </div>
                </div>
            </aside>

            {/* ANA ALAN */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#070B14]">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-10 shrink-0 bg-[#0F172A]/30 backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-600 uppercase text-[9px] font-black tracking-widest">Navigasyon</span>
                        <ChevronRight size={14} className="text-slate-800" />
                        <span className="text-white uppercase text-[11px] font-black tracking-tighter italic">{aktifSekme === 'liste' ? 'Envanter Takibi' : 'Kütüphane Yönetimi'}</span>
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input
                            type="text"
                            placeholder="Ürünlerde ara..."
                            className="w-full pl-11 pr-4 py-2 bg-slate-900/50 border border-white/5 rounded-xl text-[11px] text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                    {aktifSekme === 'liste' ? (
                        <div className="grid grid-cols-12 gap-8 items-start">
                            <div className="col-span-12 lg:col-span-4 xl:col-span-3">
                                <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl">
                                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                                        <Package size={16} className="text-indigo-400" />
                                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Stok Girişi</h3>
                                    </div>
                                    <form onSubmit={envanterEkle} className="space-y-5">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Ürün</label>
                                            <select className="w-full p-3 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                                <option value="">Seçiniz...</option>
                                                {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Saklama</label>
                                            <div className="grid grid-cols-3 gap-1 bg-[#070B14] p-1 rounded-xl border border-white/10">
                                                {['dolap', 'buzluk', 'kiler'].map(t => (
                                                    <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-2 rounded-lg text-[9px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="number" placeholder="Miktar" className="w-full p-3 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white outline-none" value={miktarDegeri} onChange={e => setMiktarDegeri(e.target.value)} />
                                            <input type="date" className="w-full p-3 bg-[#070B14] border border-white/10 rounded-xl text-[11px] text-white outline-none font-bold" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>
                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-black text-white text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                            SİSTEME İŞLE
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-8 xl:col-span-9">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                        const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                        const kritik = gun <= 3;
                                        return (
                                            <div key={u.id} className={`group p-6 rounded-2xl border transition-all ${kritik ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[#0F172A] border-white/5 shadow-xl'}`}>
                                                <div className="flex justify-between items-start mb-5">
                                                    <div className={`p-2.5 rounded-xl ${u.saklama_yeri === 'buzluk' ? 'bg-blue-500/10 text-blue-400' : u.saklama_yeri === 'dolap' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                        {u.saklama_yeri === 'buzluk' ? <Snowflake size={18} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={18} /> : <Sun size={18} />}
                                                    </div>
                                                    <button onClick={() => { if (window.confirm('Silinsin mi?')) supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-700 hover:text-rose-500"><Trash2 size={18} /></button>
                                                </div>
                                                <h4 className="font-black text-white uppercase tracking-tight text-sm mb-1 truncate">{u.gida_ad}</h4>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-6 tracking-widest">
                                                    <span>{u.miktar}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                                                    <span>{u.saklama_yeri}</span>
                                                </div>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-600 uppercase mb-1">SKT</span>
                                                        <span className="text-[11px] font-mono font-bold text-slate-300">{new Date(u.skt).toLocaleDateString('tr-TR')}</span>
                                                    </div>
                                                    <span className={`text-[11px] font-black px-3 py-1 rounded-lg ${gun <= 0 ? 'bg-rose-600 text-white animate-pulse' : kritik ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
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
                        /* KÜTÜPHANE - DÜZENLENMİŞ */
                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12 lg:col-span-4">
                                <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-2xl">
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-6">Kütüphane Kaydı</h3>
                                    <form onSubmit={kütüphaneEkle} className="space-y-4">
                                        <input type="text" placeholder="Gıda Adı" className="w-full p-3 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white outline-none" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                        <select className="w-full p-3 bg-[#070B14] border border-white/10 rounded-xl text-xs text-white outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}>
                                            <option value="Adet">Adet</option><option value="Kg">Kg</option><option value="Litre">Litre</option><option value="Paket">Paket</option>
                                        </select>
                                        <div className="space-y-2">
                                            {['dolap', 'buzluk', 'kiler'].map(f => (
                                                <div key={f} className="flex items-center gap-3 bg-[#070B14] p-3 rounded-xl border border-white/5">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase w-16">{f}</span>
                                                    <input type="number" placeholder="Gün" className="bg-transparent w-full text-xs text-white outline-none text-right" value={yeniGida[`${f}_omru`]} onChange={e => setYeniGida({ ...yeniGida, [`${f}_omru`]: e.target.value })} />
                                                </div>
                                            ))}
                                        </div>
                                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-black text-white text-[10px] uppercase tracking-widest mt-2 flex items-center justify-center gap-2 transition-all">
                                            <Save size={18} /> VERİTABANINA EKLE
                                        </button>
                                    </form>
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-8">
                                <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden">
                                    <table className="w-full text-left text-[11px]">
                                        <thead className="bg-[#070B14] text-slate-600 uppercase font-black">
                                            <tr>
                                                <th className="p-5">Gıda</th>
                                                <th className="p-4 text-center">Dolap</th>
                                                <th className="p-4 text-center">Buzluk</th>
                                                <th className="p-4 text-center">Kiler</th>
                                                <th className="p-4 text-right">#</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {Object.values(gidaVeritabani).map(g => (
                                                <tr key={g.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-5 font-black text-white uppercase">{g.ad} <span className="text-slate-700 font-normal ml-2">({g.birim})</span></td>
                                                    <td className="p-4 text-center text-indigo-400 font-bold">{g.dolap_omru} G</td>
                                                    <td className="p-4 text-center text-blue-400 font-bold">{g.buzluk_omru} G</td>
                                                    <td className="p-4 text-center text-orange-400 font-bold">{g.kiler_omru} G</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => { if (window.confirm('Silinsin mi?')) supabase.from('gida_kutuphanesi').delete().eq('id', g.id).then(verileriGetir); }} className="text-slate-800 hover:text-rose-500"><Trash2 size={16} /></button>
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