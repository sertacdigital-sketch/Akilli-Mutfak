import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, List, Settings, Save, Circle
} from 'lucide-react';

export default function App() {
    // --- ANA STATE YÖNETİMİ ---
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

    // --- VERİ ÇEKME FONKSİYONU ---
    const verileriGetir = async () => {
        setLoading(true);
        try {
            // 1. Kütüphaneyi Çek
            const { data: kutData } = await supabase.from('gida_kutuphanesi').select('*');
            if (kutData) {
                const obj = {};
                kutData.forEach(i => obj[i.ad] = i);
                setGidaVeritabani(obj);
            }
            // 2. Envanteri Çek (Yeni tablo adına göre)
            const { data: envData } = await supabase.from('mutfak_envanteri').select('*').order('skt', { ascending: true });
            if (envData) setEnvanter(envData);
        } catch (err) {
            console.error("Veri çekme hatası:", err);
        }
        setLoading(false);
    };

    // --- OTOMATİK SKT HESAPLAMA ---
    // Ürün ismi veya Saklama yeri değiştiğinde tarihi otomatik ayarlar
    useEffect(() => {
        if (secilenGidaAd && gidaVeritabani[secilenGidaAd]) {
            const gida = gidaVeritabani[secilenGidaAd];
            const omur = gida[`${saklamaYeri}_omru`] || 0;
            const bugun = new Date();
            bugun.setDate(bugun.getDate() + parseInt(omur));
            setSktTarihi(bugun.toISOString().split('T')[0]);
        }
    }, [secilenGidaAd, saklamaYeri, gidaVeritabani]);

    // --- ENVANTERE ÜRÜN EKLEME ---
    const envanterEkle = async (e) => {
        e.preventDefault();
        if (!secilenGidaAd || !sktTarihi) return alert("Lütfen ürün ve tarih seçin!");

        const birim = gidaVeritabani[secilenGidaAd]?.birim || '';
        const { error } = await supabase.from('mutfak_envanteri').insert([{
            gida_ad: secilenGidaAd,
            miktar: `${miktarDegeri || 1} ${birim}`,
            saklama_yeri: saklamaYeri,
            skt: sktTarihi
        }]);

        if (!error) {
            setSecilenGidaAd("");
            setMiktarDegeri("");
            verileriGetir();
        } else {
            alert("Ekleme Hatası: " + error.message);
        }
    };

    // --- KÜTÜPHANEYE YENİ TANIM EKLEME ---
    const kütüphaneEkle = async (e) => {
        e.preventDefault();
        if (!yeniGida.ad) return alert("İsim zorunlu!");

        const { error } = await supabase.from('gida_kutuphanesi').insert([{
            ad: yeniGida.ad,
            birim: yeniGida.birim,
            dolap_omru: parseInt(yeniGida.dolap_omru || 0),
            buzluk_omru: parseInt(yeniGida.buzluk_omru || 0),
            kiler_omru: parseInt(yeniGida.kiler_omru || 0)
        }]);

        if (!error) {
            setYeniGida({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" });
            verileriGetir();
        } else {
            alert("Kütüphane Hatası: " + error.message);
        }
    };

    if (loading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-slate-500 font-black tracking-[0.2em]">
            YÜKLENİYOR...
        </div>
    );

    return (
        <div className="flex h-screen w-screen bg-[#0F172A] text-slate-300 font-sans overflow-hidden text-[13px]">

            {/* SIDEBAR */}
            <aside className="w-60 bg-[#1E293B] border-r border-slate-700/50 flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3 border-b border-slate-700/30">
                    <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20"><ChefHat className="text-white w-4 h-4" /></div>
                    <h1 className="text-sm font-black text-white tracking-tighter uppercase italic">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                </div>
                <nav className="flex-1 px-4 mt-6 space-y-2">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-800'}`}>
                        <List size={18} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-800'}`}>
                        <Settings size={18} /> Kütüphane
                    </button>
                </nav>
            </aside>

            {/* ANA PANEL */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 flex items-center justify-between px-8 shrink-0 border-b border-slate-700/50 bg-[#0F172A]/50 backdrop-blur-md">
                    <h2 className="font-black text-white uppercase tracking-widest text-xs italic">{aktifSekme === 'liste' ? 'Mevcut Stoklar' : 'Ürün Kütüphanesi'}</h2>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Ürün Ara..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-[11px] text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    {aktifSekme === 'liste' ? (
                        <div className="flex flex-row gap-8 items-start">
                            {/* ENVANTER EKLEME FORMU */}
                            <aside className="w-80 shrink-0 bg-[#1E293B] p-6 rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/20">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Stok Yönetimi</h3>
                                <form onSubmit={envanterEkle} className="space-y-5">
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-black block mb-2 uppercase tracking-tighter">Gıda Türü</label>
                                        <select className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500 cursor-pointer" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                            <option value="">Seçiniz...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-black block mb-2 uppercase tracking-tighter">Saklama Ortamı</label>
                                        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-black block mb-2 uppercase tracking-tighter">Miktar</label>
                                            <input type="number" placeholder="1" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none" value={miktarDegeri} onChange={e => setMiktarDegeri(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-black block mb-2 uppercase tracking-tighter">SKT</label>
                                            <input type="date" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[10px] text-white outline-none font-bold" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 py-3.5 rounded-xl font-black text-white text-[11px] mt-2 hover:bg-indigo-500 transition-all uppercase tracking-[0.1em] shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
                                        Sisteme Kaydet
                                    </button>
                                </form>
                            </aside>

                            {/* ENVANTER KARTLARI (GÜN + TARİH BİRLİKTE) */}
                            <section className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    const formatliTarih = new Date(u.skt).toLocaleDateString('tr-TR');

                                    return (
                                        <div key={u.id} className={`p-5 rounded-2xl border transition-all duration-300 hover:translate-y-[-4px] ${kritik ? 'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-900/10' : 'bg-[#1E293B] border-slate-700/50 shadow-xl shadow-black/10'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-2 rounded-xl ${u.saklama_yeri === 'buzluk' ? 'bg-blue-500/10 text-blue-400' : u.saklama_yeri === 'dolap' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                    {u.saklama_yeri === 'buzluk' ? <Snowflake size={16} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={16} /> : <Sun size={16} />}
                                                </div>
                                                <button onClick={async () => { if (window.confirm('Bu stok silinsin mi?')) { await supabase.from('mutfak_envanteri').delete().eq('id', u.id); verileriGetir(); } }} className="text-slate-600 hover:text-rose-500 transition-colors p-1"><Trash2 size={16} /></button>
                                            </div>

                                            <h4 className="font-black text-white uppercase tracking-tight text-sm truncate mb-1">{u.gida_ad}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{u.miktar} • {u.saklama_yeri}</p>

                                            <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-end">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Son Tarih</span>
                                                    <span className="text-[11px] text-slate-300 font-mono font-bold tracking-tight">{formatliTarih}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`font-black text-xs block leading-none ${gun <= 0 ? 'text-rose-600 animate-pulse' : kritik ? 'text-rose-400' : 'text-emerald-500'}`}>
                                                        {gun <= 0 ? 'TÜKENDİ' : `${gun} GÜN`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        </div>
                    ) : (
                        /* KÜTÜPHANE YÖNETİMİ */
                        <div className="flex flex-row gap-8 items-start max-w-7xl">
                            <aside className="w-80 shrink-0 bg-[#1E293B] p-6 rounded-2xl border border-slate-700/50 shadow-2xl shadow-black/20">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6 opacity-40">Gıda Veritabanı</h3>
                                <form onSubmit={kütüphaneEkle} className="space-y-4">
                                    <input type="text" placeholder="Gıda Adı" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    <select className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none cursor-pointer" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}>
                                        <option value="Adet">Adet</option><option value="Kg">Kg</option><option value="Litre">Litre</option><option value="Paket">Paket</option>
                                    </select>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-3">
                                            <Thermometer size={14} className="text-indigo-400 w-4" />
                                            <input type="number" placeholder="Dolap Ömrü (Gün)" className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" value={yeniGida.dolap_omru} onChange={e => setYeniGida({ ...yeniGida, dolap_omru: e.target.value })} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Snowflake size={14} className="text-blue-400 w-4" />
                                            <input type="number" placeholder="Buzluk Ömrü (Gün)" className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" value={yeniGida.buzluk_omru} onChange={e => setYeniGida({ ...yeniGida, buzluk_omru: e.target.value })} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Sun size={14} className="text-orange-400 w-4" />
                                            <input type="number" placeholder="Kiler Ömrü (Gün)" className="flex-1 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" value={yeniGida.kiler_omru} onChange={e => setYeniGida({ ...yeniGida, kiler_omru: e.target.value })} />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-600 py-3.5 rounded-xl font-black text-white text-[11px] flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all uppercase tracking-[0.1em] mt-2 shadow-xl shadow-emerald-600/10">
                                        <Save size={16} /> Tanımı Kaydet
                                    </button>
                                </form>
                            </aside>

                            <section className="flex-1 bg-[#1E293B] rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl shadow-black/20">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-900/80 text-slate-500 uppercase font-black border-b border-slate-700">
                                        <tr>
                                            <th className="p-5">Gıda & Birim</th>
                                            <th className="p-5">Dolap</th>
                                            <th className="p-5">Buzluk</th>
                                            <th className="p-5">Kiler</th>
                                            <th className="p-5 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {Object.values(gidaVeritabani).map(g => (
                                            <tr key={g.id} className="hover:bg-slate-800/40 transition-colors group">
                                                <td className="p-5 font-black text-white uppercase tracking-tight">{g.ad} <span className="text-slate-500 font-normal ml-2 opacity-50">({g.birim})</span></td>
                                                <td className="p-5 text-indigo-400 font-bold">{g.dolap_omru || 0} GÜN</td>
                                                <td className="p-5 text-blue-400 font-bold">{g.buzluk_omru || 0} GÜN</td>
                                                <td className="p-5 text-orange-400 font-bold">{g.kiler_omru || 0} GÜN</td>
                                                <td className="p-5 text-right">
                                                    <button onClick={async () => { if (window.confirm('Bu gıda tanımı silinsin mi?')) { await supabase.from('gida_kutuphanesi').delete().eq('id', g.id); verileriGetir(); } }} className="text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}