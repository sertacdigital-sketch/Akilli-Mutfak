import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, LayoutDashboard, Database,
    Package, Info, CheckCircle2
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
            gida_ad: secilenGidaAd, miktar: `${miktarDegeri || 1} ${birim}`, saklama_yeri: saklamaYeri, skt: sktTarihi
        }]);
        if (!error) { setSecilenGidaAd(""); setMiktarDegeri(""); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-indigo-500 font-black animate-pulse text-[10px] tracking-widest uppercase">SİSTEM YÜKLENİYOR...</div>;

    return (
        <div className="min-h-screen w-full bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">

            {/* ÜST NAVİGASYON - ESKİ SADE HALİ */}
            <nav className="sticky top-0 z-50 w-full bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 px-6">
                <div className="w-full h-16 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white"><ChefHat size={20} /></div>
                        <h1 className="text-[12px] font-black text-white tracking-[0.2em] uppercase italic">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                    </div>

                    <div className="flex items-center bg-slate-950/50 p-1 rounded-xl border border-white/5 shadow-inner">
                        <button onClick={() => setAktifSekme('liste')} className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                            <LayoutDashboard size={14} /> ENVANTER
                        </button>
                        <button onClick={() => setAktifSekme('ayarlar')} className={`flex items-center gap-2 px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                            <Database size={14} /> KÜTÜPHANE
                        </button>
                    </div>

                    <div className="relative flex-1 max-w-md hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input type="text" placeholder="Gıdalarda hızlı arama..." className="w-full pl-9 pr-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-[10px] text-white outline-none focus:border-indigo-500 transition-all font-bold" onChange={(e) => setAramaTerimi(e.target.value)} />
                    </div>
                </div>
            </nav>

            <main className="w-full p-6 lg:p-10">
                {aktifSekme === 'liste' ? (
                    /* --- ENVANTER GÖRÜNÜMÜ --- */
                    <div className="flex flex-col lg:flex-row gap-10 w-full">
                        <div className="w-full lg:w-[380px] shrink-0">
                            <div className="bg-[#0F172A] p-8 rounded-[32px] border border-white/5 shadow-2xl sticky top-24">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2 text-white"><Package size={16} className="text-indigo-400" /><h3 className="text-[11px] font-black uppercase tracking-[0.2em]">Stok Girişi</h3></div>
                                </div>

                                <form onSubmit={envanterEkle} className="space-y-6">
                                    {/* Ürün Seçimi: Font büyütüldü ve kontrast artırıldı */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Gıda Seç</label>
                                        <select className="w-full p-4 bg-black/50 border border-white/10 rounded-2xl text-[12px] font-bold text-white outline-none focus:border-indigo-500 transition-all cursor-pointer" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                            <option value="">Seçiniz...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>

                                    {/* Saklama Alanı: Daha net butonlar */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nerede Saklanacak?</label>
                                        <div className="grid grid-cols-3 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Miktar ve Tarih: Yazı alanları karartıldı, font parlatıldı */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Miktar</label>
                                            <input type="number" placeholder="0" className="w-full p-4 bg-black border border-white/10 rounded-2xl text-[13px] font-black text-white outline-none focus:border-indigo-500" value={miktarDegeri} onChange={e => setMiktarDegeri(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Tarih</label>
                                            <input type="date" className="w-full p-4 bg-black border border-white/10 rounded-2xl text-[11px] font-bold text-white outline-none focus:border-indigo-500" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4.5 rounded-2xl font-black text-white text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98]">EKLE</button>
                                </form>
                            </div>
                        </div>

                        {/* ENVANTER KARTLARI */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    const yer = u.saklama_yeri;

                                    return (
                                        <div key={u.id} className={`group p-6 rounded-[28px] border transition-all duration-300 ${kritik ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[#0F172A] border-white/5 shadow-xl hover:translate-y-[-4px]'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                {/* TOOLTIP: İkonun üzerine gelince ne olduğu yazar */}
                                                <div
                                                    title={yer === 'buzluk' ? 'Dondurucu / Buzluk' : yer === 'dolap' ? 'Buzdolabı' : 'Kiler'}
                                                    className={`p-3 rounded-2xl cursor-help ${yer === 'buzluk' ? 'bg-blue-500/10 text-blue-400' : yer === 'dolap' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'}`}
                                                >
                                                    {yer === 'buzluk' ? <Snowflake size={20} /> : yer === 'dolap' ? <Thermometer size={20} /> : <Sun size={20} />}
                                                </div>
                                                <button onClick={() => { if (window.confirm('Kayıt silinsin mi?')) supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir); }} className="p-2 opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-500 transition-opacity"><Trash2 size={18} /></button>
                                            </div>

                                            <h4 className="font-black text-white uppercase tracking-tight text-[13px] mb-2 truncate">{u.gida_ad}</h4>

                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-8">
                                                <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-white/5">{u.miktar}</span>
                                                <span className="tracking-widest opacity-60 italic">{u.saklama_yeri}</span>
                                            </div>

                                            <div className="flex items-end justify-between pt-5 border-t border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-600 uppercase mb-1">SKT</span>
                                                    <span className="text-[11px] font-mono font-bold text-slate-400">{new Date(u.skt).toLocaleDateString('tr-TR')}</span>
                                                </div>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${gun <= 0 ? 'bg-rose-600 text-white' : kritik ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
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
                    /* --- KÜTÜPHANE GÖRÜNÜMÜ - ESKİ TEMİZ HALİ --- */
                    <div className="w-full grid grid-cols-1 xl:grid-cols-4 gap-10">
                        <div className="xl:col-span-1">
                            <div className="bg-[#0F172A] p-8 rounded-[32px] border border-white/5 shadow-2xl">
                                <div className="flex items-center gap-2 mb-8 text-white font-black text-[11px] uppercase tracking-widest"><CheckCircle2 size={16} className="text-emerald-500" /> Ürün Tanımla</div>
                                <form onSubmit={kütüphaneEkle} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gıda Adı</label>
                                        <input type="text" placeholder="..." className="w-full p-4 bg-black border border-white/10 rounded-2xl text-[12px] font-bold text-white outline-none focus:border-indigo-500" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Birim</label>
                                        <select className="w-full p-4 bg-black border border-white/10 rounded-2xl text-[12px] font-bold text-white outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}>
                                            <option value="Adet">Adet</option><option value="Kg">Kg</option><option value="Gr">Gr</option><option value="Litre">Litre</option><option value="Paket">Paket</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        {['dolap', 'buzluk', 'kiler'].map(f => (
                                            <div key={f} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                                                <span className="text-[10px] font-black text-slate-500 uppercase">{f} Ömrü</span>
                                                <input type="number" placeholder="0" className="bg-transparent w-12 text-xs text-white text-right outline-none font-black" value={yeniGida[`${f}_omru`]} onChange={e => setYeniGida({ ...yeniGida, [`${f}_omru`]: e.target.value })} />
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-4.5 rounded-2xl font-black text-[11px] text-white uppercase tracking-widest">KAYDET</button>
                                </form>
                            </div>
                        </div>
                        <div className="xl:col-span-3">
                            <div className="bg-[#0F172A] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
                                <div className="p-6 bg-black/20 border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistem Veritabanı</div>
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-black/50 text-slate-500 font-black uppercase">
                                        <tr><th className="p-6">Gıda / Birim</th><th className="p-6 text-center">Dolap</th><th className="p-6 text-center">Buzluk</th><th className="p-6 text-center">Kiler</th><th className="p-6 text-right">#</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {Object.values(gidaVeritabani).map(g => (
                                            <tr key={g.id} className="hover:bg-white/[0.02] text-white font-bold uppercase transition-colors">
                                                <td className="p-6 border-l-2 border-transparent group-hover:border-indigo-500">{g.ad} <span className="text-slate-600 lowercase font-normal italic ml-2">({g.birim})</span></td>
                                                <td className="p-6 text-center text-indigo-400/80">{g.dolap_omru || 0} GÜN</td>
                                                <td className="p-6 text-center text-blue-400/80">{g.buzluk_omru || 0} GÜN</td>
                                                <td className="p-6 text-center text-orange-400/80">{g.kiler_omru || 0} GÜN</td>
                                                <td className="p-6 text-right"><button onClick={() => { if (window.confirm('Kütüphaneden silinsin mi?')) supabase.from('gida_kutuphanesi').delete().eq('id', g.id).then(verileriGetir); }} className="text-slate-800 hover:text-rose-500"><Trash2 size={16} /></button></td>
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