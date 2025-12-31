import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, LayoutDashboard, Database,
    Calendar, Package, Save, Info, CheckCircle2
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

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-indigo-500 font-black animate-pulse text-[10px] tracking-widest uppercase">SİSTEM YÜKLENİYOR...</div>;

    return (
        <div className="min-h-screen w-full bg-[#020617] text-slate-300 font-sans overflow-x-hidden selection:bg-indigo-500/30">

            {/* ÜST NAVİGASYON (TAM GENİŞLİK) */}
            <nav className="sticky top-0 z-50 w-full bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 px-6">
                <div className="w-full h-16 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20 text-white"><ChefHat size={20} /></div>
                        <h1 className="text-[12px] font-black text-white tracking-[0.2em] uppercase italic">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                    </div>

                    <div className="flex items-center bg-slate-950/50 p-1 rounded-xl border border-white/5">
                        <button onClick={() => setAktifSekme('liste')} className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                            <LayoutDashboard size={14} /> ENVANTER
                        </button>
                        <button onClick={() => setAktifSekme('ayarlar')} className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                            <Database size={14} /> KÜTÜPHANE
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-md hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input type="text" placeholder="Gıdalarda hızlı arama..." className="w-full pl-9 pr-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-[10px] text-white outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-700" onChange={(e) => setAramaTerimi(e.target.value)} />
                    </div>
                </div>
            </nav>

            <main className="w-full p-6 lg:p-10">
                {aktifSekme === 'liste' ? (
                    /* --- ENVANTER GÖRÜNÜMÜ --- */
                    <div className="flex flex-col lg:flex-row gap-10 w-full">
                        <div className="w-full lg:w-[420px] shrink-0">
                            <div className="bg-[#0F172A] p-8 rounded-[32px] border border-white/5 shadow-2xl sticky top-24">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2 text-white"><Package size={16} className="text-indigo-400" /><h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Stok Girişi</h3></div>
                                    <Info size={14} className="text-slate-700 cursor-help" title="Kütüphanedeki ürünleri buraya ekleyin" />
                                </div>
                                <form onSubmit={envanterEkle} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Ürün Seçimi</label>
                                        <select className="w-full p-4 bg-[#020617] border border-white/10 rounded-2xl text-[11px] text-white outline-none focus:ring-2 ring-indigo-500/20 cursor-pointer" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                            <option value="">Seçiniz...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Saklama Alanı</label>
                                        <div className="grid grid-cols-3 gap-2 bg-[#020617] p-1.5 rounded-2xl border border-white/10">
                                            {[{ id: 'dolap', label: 'Dolap' }, { id: 'buzluk', label: 'Buzluk' }, { id: 'kiler', label: 'Kiler' }].map(t => (
                                                <button key={t.id} type="button" onClick={() => setSaklamaYeri(t.id)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>{t.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Miktar</label>
                                            <input type="number" placeholder="1" className="w-full p-4 bg-[#020617] border border-white/10 rounded-2xl text-[11px] text-white outline-none focus:ring-2 ring-indigo-500/20" value={miktarDegeri} onChange={e => setMiktarDegeri(e.target.value)} />
                                        </div>
                                        <div className="space-y-2"><label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">SKT (Oto)</label>
                                            <input type="date" className="w-full p-4 bg-[#020617] border border-white/10 rounded-2xl text-[10px] text-white outline-none font-bold cursor-pointer" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4.5 rounded-2xl font-black text-white text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98]">ENVANTERE İŞLE</button>
                                </form>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6">
                                {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    const dondurucu = u.saklama_yeri === 'buzluk';
                                    const dolap = u.saklama_yeri === 'dolap';

                                    return (
                                        <div key={u.id} className={`group p-6 rounded-[32px] border transition-all duration-500 ${kritik ? 'bg-rose-500/5 border-rose-500/20 shadow-rose-950/20 shadow-2xl' : 'bg-[#0F172A] border-white/5 shadow-xl hover:translate-y-[-5px]'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div
                                                    title={dondurucu ? "Dondurucu / Buzluk" : dolap ? "Buzdolabı" : "Kiler / Oda Sıcaklığı"}
                                                    className={`p-3.5 rounded-2xl cursor-help transition-transform hover:scale-110 ${dondurucu ? 'bg-blue-500/10 text-blue-400' : dolap ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'}`}
                                                >
                                                    {dondurucu ? <Snowflake size={22} /> : dolap ? <Thermometer size={22} /> : <Sun size={22} />}
                                                </div>
                                                <button onClick={() => { if (window.confirm('Kayıt silinsin mi?')) supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir); }} className="p-2 opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                                            </div>
                                            <h4 className="font-black text-white uppercase text-[14px] mb-2 tracking-tight truncate">{u.gida_ad}</h4>
                                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase mb-8">
                                                <span className="bg-slate-950 px-3 py-1 rounded-lg border border-white/5 text-slate-300 shadow-inner">{u.miktar}</span>
                                                <span className="tracking-widest opacity-40 italic">{u.saklama_yeri}</span>
                                            </div>
                                            <div className="flex items-end justify-between pt-5 border-t border-white/5">
                                                <div className="flex flex-col"><span className="text-[9px] font-black text-slate-600 uppercase mb-1">SKT</span><span className="text-[12px] font-mono font-bold text-slate-400 tracking-tighter">{new Date(u.skt).toLocaleDateString('tr-TR')}</span></div>
                                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl shadow-lg ${gun <= 0 ? 'bg-rose-600 text-white animate-bounce' : kritik ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-500'}`}>{gun <= 0 ? 'DOLDU' : `${gun} GÜN`}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --- KÜTÜPHANE GÖRÜNÜMÜ (FIXED) --- */
                    <div className="w-full grid grid-cols-1 xl:grid-cols-4 gap-10">
                        <div className="xl:col-span-1">
                            <div className="bg-[#0F172A] p-8 rounded-[32px] border border-white/5 shadow-2xl sticky top-24">
                                <div className="flex items-center gap-2 mb-8 text-white"><CheckCircle2 size={18} className="text-emerald-400" /><h3 className="text-[11px] font-black uppercase tracking-widest">Gıda Tanımla</h3></div>
                                <form onSubmit={kütüphaneEkle} className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Gıda Adı</label>
                                        <input type="text" placeholder="Örn: Kaşar Peyniri" className="w-full p-4 bg-[#020617] border border-white/10 rounded-2xl text-xs text-white outline-none focus:border-indigo-500 transition-all font-bold" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Ölçü Birimi</label>
                                        <select className="w-full p-4 bg-[#020617] border border-white/10 rounded-2xl text-xs text-white outline-none font-bold" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}>
                                            <option value="Adet">Adet</option><option value="Kg">Kg</option><option value="Gr">Gr</option><option value="Litre">Litre</option><option value="Paket">Paket</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-white/5">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">Varsayılan Ömürler (Gün)</span>
                                        {['dolap', 'buzluk', 'kiler'].map(f => (
                                            <div key={f} className="flex items-center justify-between bg-[#020617] p-4 rounded-2xl border border-white/5 transition-all focus-within:border-indigo-500/50">
                                                <span className="text-[10px] font-black text-slate-500 uppercase">{f}</span>
                                                <input type="number" placeholder="0" className="bg-transparent w-20 text-xs text-white text-right outline-none font-bold" value={yeniGida[`${f}_omru`]} onChange={e => setYeniGida({ ...yeniGida, [`${f}_omru`]: e.target.value })} />
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-4.5 rounded-2xl font-black text-[11px] text-white uppercase tracking-widest shadow-xl shadow-emerald-900/10 active:scale-[0.98]">KÜTÜPHANEYE KAYDET</button>
                                </form>
                            </div>
                        </div>
                        <div className="xl:col-span-3">
                            <div className="bg-[#0F172A] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
                                <div className="p-6 border-b border-white/5 bg-slate-950/30 flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kayıtlı Gıda Veritabanı</h3>
                                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">{Object.keys(gidaVeritabani).length} Çeşit Ürün</span>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-950/50 text-slate-500 uppercase text-[10px] font-black">
                                        <tr><th className="p-6">Gıda / Birim</th><th className="p-6 text-center">Dolap</th><th className="p-6 text-center">Buzluk</th><th className="p-6 text-center">Kiler</th><th className="p-6 text-right">İşlem</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-[11px]">
                                        {Object.values(gidaVeritabani).map(g => (
                                            <tr key={g.id} className="hover:bg-white/[0.02] transition-colors font-bold text-white uppercase group">
                                                <td className="p-6 border-l-2 border-transparent group-hover:border-indigo-500 transition-all">{g.ad} <span className="text-slate-600 ml-2 font-normal italic lowercase">({g.birim})</span></td>
                                                <td className="p-6 text-center text-indigo-400/80 font-mono">{g.dolap_omru || 0} GÜN</td>
                                                <td className="p-6 text-center text-blue-400/80 font-mono">{g.buzluk_omru || 0} GÜN</td>
                                                <td className="p-6 text-center text-orange-400/80 font-mono">{g.kiler_omru || 0} GÜN</td>
                                                <td className="p-6 text-right"><button onClick={() => { if (window.confirm(`${g.ad} kütüphaneden silinsin mi?`)) supabase.from('gida_kutuphanesi').delete().eq('id', g.id).then(verileriGetir); }} className="p-2 text-slate-700 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={16} /></button></td>
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