import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, LayoutDashboard, Database,
    Calendar, Package, Save, Info, CheckCircle2,
    ChevronRight
} from 'lucide-react';

export default function App() {
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [envanter, setEnvanter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    // Envanter Form State
    const [secilenGidaAd, setSecilenGidaAd] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktarDegeri, setMiktarDegeri] = useState("");
    const [sktTarihi, setSktTarihi] = useState("");

    // Kütüphane Form State
    const [yeniGida, setYeniGida] = useState({
        ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: ""
    });

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

    // OTOMATİK SKT HESAPLAMA
    useEffect(() => {
        if (secilenGidaAd && gidaVeritabani[secilenGidaAd]) {
            const gida = gidaVeritabani[secilenGidaAd];
            const omur = gida[`${saklamaYeri}_omru`] || 0;
            if (omur > 0) {
                const bugun = new Date();
                bugun.setDate(bugun.getDate() + parseInt(omur));
                setSktTarihi(bugun.toISOString().split('T')[0]);
            }
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
        if (!error) {
            setYeniGida({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" });
            verileriGetir();
        }
    };

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-indigo-500 font-black animate-pulse text-xs tracking-[0.4em] uppercase">YÜKLENİYOR...</div>;

    return (
        <div className="min-h-screen w-full bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">

            {/* ÜST NAVİGASYON (Geniş ve Net) */}
            <nav className="sticky top-0 z-50 w-full bg-[#0F172A]/90 backdrop-blur-2xl border-b border-white/10 px-6 shadow-2xl">
                <div className="w-full h-20 flex items-center justify-between gap-12">

                    <div className="flex items-center gap-4 shrink-0">
                        <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/40 text-white">
                            <ChefHat size={24} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[14px] font-black text-white tracking-[0.2em] uppercase italic leading-none">
                                MUTFAK<span className="text-indigo-400">PRO</span>
                            </h1>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Smart Inventory</span>
                        </div>
                    </div>

                    <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                        <button onClick={() => setAktifSekme('liste')} className={`flex items-center gap-3 px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-300'}`}>
                            <LayoutDashboard size={16} /> ENVANTER
                        </button>
                        <button onClick={() => setAktifSekme('ayarlar')} className={`flex items-center gap-3 px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:text-slate-300'}`}>
                            <Database size={16} /> KÜTÜPHANE
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-lg hidden lg:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input type="text" placeholder="Hangi ürünü arıyorsun?" className="w-full pl-12 pr-6 py-3.5 bg-slate-950 border-2 border-white/5 rounded-2xl text-[12px] text-white font-bold outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700" onChange={(e) => setAramaTerimi(e.target.value)} />
                    </div>
                </div>
            </nav>

            <main className="w-full p-6 lg:p-12">
                {aktifSekme === 'liste' ? (
                    /* --- ENVANTER GÖRÜNÜMÜ --- */
                    <div className="flex flex-col xl:flex-row gap-12 w-full">

                        {/* FORM: YÜKSEK OKUNABİLİRLİK */}
                        <div className="w-full xl:w-[450px] shrink-0">
                            <div className="bg-[#0F172A] p-10 rounded-[40px] border-2 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] sticky top-28">
                                <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Plus size={20} /></div>
                                    <h3 className="text-[13px] font-black text-white uppercase tracking-[0.2em]">Stok Ekleme Formu</h3>
                                </div>

                                <form onSubmit={envanterEkle} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-indigo-300 uppercase tracking-widest ml-1">1. Ürün Seçin</label>
                                        <select className="w-full p-5 bg-slate-950 border-2 border-white/10 rounded-2xl text-sm font-black text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer shadow-inner" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                            <option value="" className="text-slate-500">Listeden ürün bulun...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k} className="bg-slate-900">{k}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-indigo-300 uppercase tracking-widest ml-1">2. Saklama Alanı</label>
                                        <div className="grid grid-cols-3 gap-3 bg-slate-950 p-2 rounded-2xl border-2 border-white/5">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-3.5 rounded-xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-indigo-300 uppercase tracking-widest ml-1">3. Miktar</label>
                                            <input type="number" placeholder="0" className="w-full p-5 bg-slate-950 border-2 border-white/10 rounded-2xl text-sm font-black text-white outline-none focus:border-indigo-500 shadow-inner" value={miktarDegeri} onChange={e => setMiktarDegeri(e.target.value)} />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black text-indigo-300 uppercase tracking-widest ml-1">4. SKT Tarihi</label>
                                            <input type="date" className="w-full p-5 bg-slate-950 border-2 border-white/10 rounded-2xl text-sm font-black text-white outline-none focus:border-indigo-500 transition-all" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-[20px] font-black text-[12px] uppercase tracking-[0.25em] transition-all shadow-2xl shadow-indigo-900/40 active:scale-95 border-t border-white/20 flex items-center justify-center gap-3">
                                        ENVANTERE İŞLE <ChevronRight size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* KARTLAR: TAM EKRAN YAYILIMI */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-8">
                                {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    const dondurucu = u.saklama_yeri === 'buzluk';
                                    const dolap = u.saklama_yeri === 'dolap';

                                    return (
                                        <div key={u.id} className={`group relative p-8 rounded-[40px] border-2 transition-all duration-500 ${kritik ? 'bg-rose-600/10 border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.1)]' : 'bg-[#0F172A] border-white/5 shadow-2xl hover:border-indigo-500/30'}`}>
                                            <div className="flex justify-between items-start mb-8">
                                                <div
                                                    title={dondurucu ? "Dondurucu / Buzluk" : dolap ? "Buzdolabı" : "Kiler"}
                                                    className={`p-4 rounded-2xl cursor-help transition-all group-hover:scale-110 shadow-lg ${dondurucu ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : dolap ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'bg-orange-600/20 text-orange-400 border border-orange-500/20'}`}
                                                >
                                                    {dondurucu ? <Snowflake size={24} /> : dolap ? <Thermometer size={24} /> : <Sun size={24} />}
                                                </div>
                                                <button onClick={() => { if (window.confirm('Kayıt silinsin mi?')) supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir); }} className="p-3 opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all shadow-xl"><Trash2 size={20} /></button>
                                            </div>

                                            <h4 className="font-black text-white uppercase text-base mb-3 tracking-tight truncate">{u.gida_ad}</h4>

                                            <div className="flex items-center gap-3 mb-10">
                                                <span className="bg-slate-950 px-4 py-1.5 rounded-xl border border-white/10 text-xs font-black text-indigo-400 shadow-inner">{u.miktar}</span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{u.saklama_yeri}</span>
                                            </div>

                                            <div className="flex items-end justify-between pt-6 border-t border-white/10">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase mb-1">Kalan Süre</span>
                                                    <span className={`text-sm font-black ${gun <= 0 ? 'text-rose-500' : 'text-slate-300'}`}>{gun <= 0 ? 'Tarih Geçti' : `${gun} Gün`}</span>
                                                </div>
                                                <div className={`w-3 h-3 rounded-full shadow-lg ${gun <= 0 ? 'bg-rose-600' : kritik ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --- KÜTÜPHANE GÖRÜNÜMÜ: TERTEMİZ TABLO VE FORM --- */
                    <div className="w-full grid grid-cols-1 xl:grid-cols-4 gap-12">
                        <div className="xl:col-span-1">
                            <div className="bg-[#0F172A] p-10 rounded-[40px] border-2 border-white/5 shadow-2xl sticky top-28">
                                <div className="flex items-center gap-3 mb-10 text-emerald-400 border-b border-white/5 pb-6">
                                    <CheckCircle2 size={20} /><h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">Ürün Tanımla</h3>
                                </div>
                                <form onSubmit={kütüphaneEkle} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Gıda Adı</label>
                                        <input type="text" placeholder="Örn: Tereyağı" className="w-full p-5 bg-slate-950 border-2 border-white/10 rounded-2xl text-sm font-black text-white outline-none focus:border-emerald-500 transition-all shadow-inner" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Ölçü Birimi</label>
                                        <select className="w-full p-5 bg-slate-950 border-2 border-white/10 rounded-2xl text-sm font-black text-white outline-none font-bold" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}>
                                            <option value="Adet">Adet (tane)</option><option value="Kg">Kilogram (kg)</option><option value="Gr">Gram (gr)</option><option value="Litre">Litre (L)</option><option value="Paket">Paket</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-2">Saklama Ömürleri</span>
                                        {['dolap', 'buzluk', 'kiler'].map(f => (
                                            <div key={f} className="flex items-center justify-between bg-slate-950 p-5 rounded-2xl border-2 border-white/5 transition-all focus-within:border-emerald-500/50">
                                                <span className="text-[11px] font-black text-slate-500 uppercase">{f}</span>
                                                <div className="flex items-center gap-2">
                                                    <input type="number" placeholder="0" className="bg-transparent w-16 text-sm text-white text-right outline-none font-black" value={yeniGida[`${f}_omru`]} onChange={e => setYeniGida({ ...yeniGida, [`${f}_omru`]: e.target.value })} />
                                                    <span className="text-[10px] text-slate-700 font-bold">GÜN</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black text-[12px] text-white uppercase tracking-[0.25em] transition-all shadow-2xl shadow-emerald-900/30 active:scale-95 border-t border-white/20">VERİTABANINA KAYDET</button>
                                </form>
                            </div>
                        </div>
                        <div className="xl:col-span-3">
                            <div className="bg-[#0F172A] rounded-[40px] border-2 border-white/5 shadow-2xl overflow-hidden">
                                <div className="p-8 border-b border-white/5 bg-slate-950/40 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Database size={20} className="text-indigo-400" />
                                        <h3 className="text-[12px] font-black text-white uppercase tracking-widest">Kayıtlı Gıda Portföyü</h3>
                                    </div>
                                    <span className="text-[11px] font-black text-indigo-400 bg-indigo-500/10 px-6 py-2 rounded-full border border-indigo-500/20">{Object.keys(gidaVeritabani).length} Çeşit Tanımlı</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-950/70 text-slate-500 uppercase text-[11px] font-black">
                                            <tr>
                                                <th className="p-8">Gıda / Ölçü Birimi</th>
                                                <th className="p-8 text-center bg-white/5">Dolap Ömrü</th>
                                                <th className="p-8 text-center">Buzluk Ömrü</th>
                                                <th className="p-8 text-center bg-white/5">Kiler Ömrü</th>
                                                <th className="p-8 text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-[13px]">
                                            {Object.values(gidaVeritabani).map(g => (
                                                <tr key={g.id} className="hover:bg-white/[0.03] transition-colors font-bold text-white uppercase group">
                                                    <td className="p-8 border-l-4 border-transparent group-hover:border-indigo-500">
                                                        {g.ad} <span className="text-slate-600 ml-3 font-medium italic lowercase text-xs">({g.birim})</span>
                                                    </td>
                                                    <td className="p-8 text-center text-indigo-400 font-mono bg-white/[0.01]">{g.dolap_omru || 0} GÜN</td>
                                                    <td className="p-8 text-center text-blue-400 font-mono">{g.buzluk_omru || 0} GÜN</td>
                                                    <td className="p-8 text-center text-orange-400 font-mono bg-white/[0.01]">{g.kiler_omru || 0} GÜN</td>
                                                    <td className="p-8 text-right">
                                                        <button onClick={() => { if (window.confirm(`${g.ad} silinsin mi?`)) supabase.from('gida_kutuphanesi').delete().eq('id', g.id).then(verileriGetir); }} className="p-3 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}