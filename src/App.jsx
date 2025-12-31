import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Minus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, LayoutDashboard, Database,
    Package, CheckCircle2, ChevronRight, AlertCircle
} from 'lucide-react';

export default function App() {
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [envanter, setEnvanter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    const [secilenGidaAd, setSecilenGidaAd] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktarDegeri, setMiktarDegeri] = useState(1); // Sayısal başlattık
    const [sktTarihi, setSktTarihi] = useState("");

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
            gida_ad: secilenGidaAd, miktar: `${miktarDegeri} ${birim}`, saklama_yeri: saklamaYeri, skt: sktTarihi
        }]);
        if (!error) { setSecilenGidaAd(""); setMiktarDegeri(1); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-indigo-500 font-black animate-pulse text-xs tracking-[0.4em] uppercase">SİSTEM BAŞLATILIYOR...</div>;

    return (
        <div className="min-h-screen w-full bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">

            {/* ÜST NAVİGASYON */}
            <nav className="sticky top-0 z-50 w-full bg-[#0F172A]/90 backdrop-blur-2xl border-b border-white/10 px-6">
                <div className="w-full h-20 flex items-center justify-between gap-12">
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/40 text-white"><ChefHat size={24} /></div>
                        <h1 className="text-[14px] font-black text-white tracking-[0.2em] uppercase italic">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                    </div>

                    <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-white/10">
                        <button onClick={() => setAktifSekme('liste')} className={`flex items-center gap-3 px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                            <LayoutDashboard size={16} /> ENVANTER
                        </button>
                        <button onClick={() => setAktifSekme('ayarlar')} className={`flex items-center gap-3 px-10 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                            <Database size={16} /> KÜTÜPHANE
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-lg hidden lg:block text-white">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input type="text" placeholder="Hızlı ürün ara..." className="w-full pl-12 pr-6 py-3.5 bg-slate-950 border-2 border-white/5 rounded-2xl text-[12px] font-bold outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700" onChange={(e) => setAramaTerimi(e.target.value)} />
                    </div>
                </div>
            </nav>

            <main className="w-full p-6 lg:p-12">
                {aktifSekme === 'liste' ? (
                    <div className="flex flex-col xl:flex-row gap-12 w-full">

                        {/* SOL FORM - YENİLENMİŞ MODERN STEPPER VE GİRİŞ ALANI */}
                        <div className="w-full xl:w-[450px] shrink-0">
                            <div className="bg-[#0F172A] p-10 rounded-[48px] border-2 border-white/5 shadow-2xl sticky top-28">
                                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Package size={20} /></div>
                                    <h3 className="text-[13px] font-black text-white uppercase tracking-[0.2em]">Stok Giriş Paneli</h3>
                                </div>

                                <form onSubmit={envanterEkle} className="space-y-10">
                                    {/* Ürün Seçimi */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <ChevronRight size={14} className="text-indigo-500" /> Ürün Seçiniz
                                        </label>
                                        <select className="w-full p-5 bg-black border-2 border-white/10 rounded-3xl text-sm font-black text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xl" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                            <option value="">Seçmek için dokun...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k} className="bg-slate-900">{k}</option>)}
                                        </select>
                                    </div>

                                    {/* MODERN ARTI/EKSİ MİKTAR ALANI */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <ChevronRight size={14} className="text-indigo-500" /> Miktar Belirleyin
                                        </label>
                                        <div className="flex items-center justify-between bg-black p-3 rounded-[32px] border-2 border-white/10 shadow-inner group focus-within:border-indigo-500 transition-all">
                                            <button type="button" onClick={() => setMiktarDegeri(prev => Math.max(1, prev - 1))} className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white hover:bg-rose-600 transition-all shadow-lg active:scale-90">
                                                <Minus size={20} strokeWidth={3} />
                                            </button>

                                            <div className="flex flex-col items-center">
                                                <input type="number" className="bg-transparent text-center text-3xl font-black text-white outline-none w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={miktarDegeri} onChange={e => setMiktarDegeri(parseInt(e.target.value) || 0)} />
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                    {gidaVeritabani[secilenGidaAd]?.birim || 'Adet'}
                                                </span>
                                            </div>

                                            <button type="button" onClick={() => setMiktarDegeri(prev => prev + 1)} className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white hover:bg-emerald-600 transition-all shadow-lg active:scale-90">
                                                <Plus size={20} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Saklama Alanı - Görsel Kartlar Haline Getirildi */}
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <ChevronRight size={14} className="text-indigo-500" /> Saklama Alanı
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'dolap', icon: <Thermometer size={18} />, label: 'Dolap' },
                                                { id: 'buzluk', icon: <Snowflake size={18} />, label: 'Buzluk' },
                                                { id: 'kiler', icon: <Sun size={18} />, label: 'Kiler' }
                                            ].map(t => (
                                                <button key={t.id} type="button" onClick={() => setSaklamaYeri(t.id)} className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${saklamaYeri === t.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-900/40 scale-105' : 'bg-black border-white/5 text-slate-500 hover:border-white/20'}`}>
                                                    {t.icon}
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tarih Alanı */}
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <ChevronRight size={14} className="text-indigo-500" /> Son Kullanma Tarihi
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                            <input type="date" className="w-full pl-14 p-5 bg-black border-2 border-white/10 rounded-3xl text-sm font-black text-white outline-none focus:border-indigo-500 transition-all" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl shadow-indigo-900/40 active:scale-95 border-t border-white/20 flex items-center justify-center gap-3">
                                        SİSTEME KAYDET <CheckCircle2 size={20} />
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* SAĞ TARAF: KARTLAR */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-8">
                                {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    return (
                                        <div key={u.id} className={`group p-8 rounded-[40px] border-2 transition-all duration-500 ${kritik ? 'bg-rose-600/10 border-rose-500/30 shadow-2xl' : 'bg-[#0F172A] border-white/5 hover:border-indigo-500/30'}`}>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className={`p-4 rounded-2xl shadow-lg ${u.saklama_yeri === 'buzluk' ? 'bg-blue-600/20 text-blue-400' : u.saklama_yeri === 'dolap' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-orange-600/20 text-orange-400'}`}>
                                                    {u.saklama_yeri === 'buzluk' ? <Snowflake size={24} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={24} /> : <Sun size={24} />}
                                                </div>
                                                <button onClick={() => { if (window.confirm('Silinsin mi?')) supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir); }} className="p-3 opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={20} /></button>
                                            </div>
                                            <h4 className="font-black text-white uppercase text-base mb-3 truncate">{u.gida_ad}</h4>
                                            <div className="flex items-center gap-3 mb-10">
                                                <span className="bg-black px-4 py-1.5 rounded-xl border border-white/10 text-xs font-black text-indigo-400">{u.miktar}</span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">{u.saklama_yeri}</span>
                                            </div>
                                            <div className="flex items-end justify-between pt-6 border-t border-white/10">
                                                <div className="flex flex-col"><span className="text-[10px] font-black text-slate-600 uppercase mb-1">Durum</span><span className={`text-sm font-black ${gun <= 0 ? 'text-rose-500' : 'text-slate-300'}`}>{gun <= 0 ? 'GEÇTİ' : `${gun} Gün`}</span></div>
                                                <div className={`w-3 h-3 rounded-full ${gun <= 0 ? 'bg-rose-600 animate-pulse' : kritik ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* KÜTÜPHANE SAYFASI */
                    <div className="w-full grid grid-cols-1 xl:grid-cols-4 gap-12">
                        <div className="xl:col-span-1">
                            <div className="bg-[#0F172A] p-10 rounded-[48px] border-2 border-white/5 shadow-2xl">
                                <div className="flex items-center gap-3 mb-10 text-emerald-400 pb-6 border-b border-white/5"><CheckCircle2 size={20} /><h3 className="text-[13px] font-black uppercase text-white">Gıda Tanımla</h3></div>
                                <form onSubmit={kütüphaneEkle} className="space-y-6">
                                    <div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase">Gıda Adı</label><input type="text" placeholder="Örn: Süzme Peynir" className="w-full p-5 bg-black border-2 border-white/10 rounded-3xl text-sm font-black text-white outline-none focus:border-emerald-500 transition-all" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} /></div>
                                    <div className="space-y-3"><label className="text-[11px] font-black text-slate-500 uppercase">Birim</label><select className="w-full p-5 bg-black border-2 border-white/10 rounded-3xl text-sm font-black text-white outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}><option value="Adet">Adet</option><option value="Kg">Kg</option><option value="Gr">Gr</option><option value="Litre">Litre</option><option value="Paket">Paket</option></select></div>
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        {['dolap', 'buzluk', 'kiler'].map(f => (
                                            <div key={f} className="flex items-center justify-between bg-black p-5 rounded-3xl border-2 border-white/5 focus-within:border-emerald-500">
                                                <span className="text-[11px] font-black text-slate-500 uppercase">{f} Ömrü</span>
                                                <div className="flex items-center gap-2"><input type="number" placeholder="0" className="bg-transparent w-16 text-sm text-white text-right outline-none font-black" value={yeniGida[`${f}_omru`]} onChange={e => setYeniGida({ ...yeniGida, [`${f}_omru`]: e.target.value })} /><span className="text-[10px] text-slate-700 font-bold">GÜN</span></div>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-6 rounded-3xl font-black text-[12px] text-white uppercase tracking-widest shadow-2xl active:scale-95">KAYDET</button>
                                </form>
                            </div>
                        </div>
                        <div className="xl:col-span-3">
                            <div className="bg-[#0F172A] rounded-[48px] border-2 border-white/5 shadow-2xl overflow-hidden">
                                <div className="p-8 border-b border-white/5 bg-black/40 flex items-center justify-between"><div className="flex items-center gap-3"><Database size={20} className="text-indigo-400" /><h3 className="text-[12px] font-black text-white uppercase">Gıda Portföyü</h3></div></div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-white">
                                        <thead className="bg-black text-slate-500 uppercase text-[11px] font-black">
                                            <tr><th className="p-8">Gıda / Ölçü</th><th className="p-8 text-center bg-white/5">Dolap</th><th className="p-8 text-center">Buzluk</th><th className="p-8 text-center bg-white/5">Kiler</th><th className="p-8 text-right">#</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-[13px]">
                                            {Object.values(gidaVeritabani).map(g => (
                                                <tr key={g.id} className="hover:bg-white/[0.03] transition-colors font-bold uppercase group">
                                                    <td className="p-8 border-l-4 border-transparent group-hover:border-indigo-500">{g.ad} <span className="text-slate-600 ml-3 font-medium italic lowercase text-xs">({g.birim})</span></td>
                                                    <td className="p-8 text-center text-indigo-400 bg-white/[0.01]">{g.dolap_omru || 0} GÜN</td>
                                                    <td className="p-8 text-center text-blue-400">{g.buzluk_omru || 0} GÜN</td>
                                                    <td className="p-8 text-center text-orange-400 bg-white/[0.01]">{g.kiler_omru || 0} GÜN</td>
                                                    <td className="p-8 text-right"><button onClick={() => { if (window.confirm(`${g.ad} silinsin mi?`)) supabase.from('gida_kutuphanesi').delete().eq('id', g.id).then(verileriGetir); }} className="p-3 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"><Trash2 size={20} /></button></td>
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