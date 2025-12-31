import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    ChefHat, Search, ArrowRight, AlertTriangle, Menu, X
} from 'lucide-react';

export default function App() {
    // --- STATES ---
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI States
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    // Form States (Yeni Gıda Ekleme)
    const [yeniGida, setYeniGida] = useState({ ad: "", birim: "Adet", dolap: "", buzluk: "", kiler: "" });

    // --- VERİ ÇEKME ---
    useEffect(() => {
        verileriGetir();
    }, []);

    const verileriGetir = async () => {
        setLoading(true);
        try {
            const { data: kutData } = await supabase.from('gida_kutuphanesi').select('*');
            if (kutData) {
                const kutObj = {};
                kutData.forEach(item => { kutObj[item.ad] = item; });
                setGidaVeritabani(kutObj);
            }

            const { data: envData } = await supabase.from('envanter').select('*').order('skt', { ascending: true });
            if (envData) setUrunler(envData);
        } catch (e) {
            console.error("Veritabanı Hatası:", e);
        }
        setLoading(false);
    };

    // --- OTOMATİK SKT HESAPLAMA ---
    useEffect(() => {
        if (secilenUrunKey && gidaVeritabani[secilenUrunKey]) {
            const rafOmru = gidaVeritabani[secilenUrunKey][saklamaYeri];
            if (rafOmru) {
                const d = new Date();
                d.setDate(d.getDate() + parseInt(rafOmru));
                setManuelTarih(d.toISOString().split('T')[0]);
            }
        }
    }, [secilenUrunKey, saklamaYeri, gidaVeritabani]);

    // --- AKSİYONLAR ---
    const veritabaninaEkle = async (e) => {
        e.preventDefault();
        if (!yeniGida.ad) return alert("Gıda ismi girmelisin!");

        const eklenecek = {
            ad: yeniGida.ad,
            birim: yeniGida.birim || "Adet",
            dolap: yeniGida.dolap ? parseInt(yeniGida.dolap) : null,
            buzluk: yeniGida.buzluk ? parseInt(yeniGida.buzluk) : null,
            kiler: yeniGida.kiler ? parseInt(yeniGida.kiler) : null
        };

        const { error } = await supabase.from('gida_kutuphanesi').insert([eklenecek]);
        if (error) {
            alert("Hata: " + error.message);
        } else {
            setYeniGida({ ad: "", birim: "Adet", dolap: "", buzluk: "", kiler: "" });
            await verileriGetir();
            alert("Başarıyla kütüphaneye eklendi!");
        }
    };

    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return alert("Gıda ve tarih seçmelisin!");

        const yeni = {
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey]?.birim || ''}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        };
        const { error } = await supabase.from('envanter').insert([yeni]);
        if (!error) {
            setSecilenUrunKey(""); setMiktar("");
            verileriGetir();
        } else {
            alert("Envanter Hatası: " + error.message);
        }
    };

    const urunSil = async (id) => {
        const { error } = await supabase.from('envanter').delete().eq('id', id);
        if (!error) setUrunler(prev => prev.filter(u => u.id !== id));
    };

    const kutuphaneSil = async (ad) => {
        if (window.confirm(`${ad} kütüphaneden silinsin mi?`)) {
            const { error } = await supabase.from('gida_kutuphanesi').delete().eq('ad', ad);
            if (!error) verileriGetir();
        }
    };

    const kalanGun = (t) => Math.ceil((new Date(t) - new Date().setHours(0, 0, 0, 0)) / 86400000);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white font-black text-2xl animate-pulse">
            MUTFAK YÜKLENİYOR...
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#0F172A] flex flex-col font-sans text-slate-200 overflow-x-hidden">
            {/* HEADER - TAM GENİŞLİK */}
            <header className="w-full bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 py-5 flex justify-between items-center sticky top-0 z-[100]">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-500 p-2 rounded-2xl shadow-lg shadow-indigo-500/20">
                        <ChefHat className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-white">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                </div>

                <nav className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700">
                    <button onClick={() => setAktifSekme('liste')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${aktifSekme === 'liste' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>ENVANTER</button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>KÜTÜPHANE</button>
                </nav>
            </header>

            {/* MAIN CONTENT - TAM GENİŞLİK */}
            <main className="w-full p-8 transition-all duration-500">
                {aktifSekme === 'liste' ? (
                    <div className="w-full flex flex-col xl:flex-row gap-10">

                        {/* SOL: ÜRÜN EKLEME FORMU */}
                        <aside className="w-full xl:w-[400px] shrink-0">
                            <div className="bg-slate-800/40 p-8 rounded-[40px] border border-slate-700/50 sticky top-32 backdrop-blur-sm">
                                <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3"><Plus className="text-indigo-400" /> Ürün Ekle</h2>
                                <form onSubmit={urunEkle} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Gıda Türü</label>
                                        <select className="w-full p-5 bg-slate-900/50 border border-slate-700 rounded-3xl font-bold text-white focus:border-indigo-500 outline-none transition-all appearance-none" value={secilenUrunKey} onChange={(e) => setSecilenUrunKey(e.target.value)}>
                                            <option value="">Seçiniz...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Saklama Konumu</label>
                                        <div className="grid grid-cols-3 gap-3 bg-slate-900/50 p-2 rounded-3xl border border-slate-700">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Miktar</label>
                                            <input type="number" placeholder="1" className="w-full p-5 bg-slate-900/50 border border-slate-700 rounded-3xl font-bold text-white outline-none" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">SKT</label>
                                            <input type="date" className="w-full p-5 bg-indigo-900/20 border border-indigo-500/30 rounded-3xl font-bold text-xs text-indigo-300 outline-none" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                        </div>
                                    </div>

                                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-3xl font-black text-lg transition-all transform active:scale-95 shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-3">
                                        ENVANTERE İŞLE <ArrowRight />
                                    </button>
                                </form>
                            </div>
                        </aside>

                        {/* SAĞ: ENVANTER LİSTESİ */}
                        <section className="flex-1">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <h2 className="text-4xl font-black text-white tracking-tighter">Mevcut Stok <span className="text-slate-700 ml-2">[{urunler.length}]</span></h2>
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input type="text" placeholder="Stoklarda ara..." className="w-full pl-14 pr-6 py-4 bg-slate-800/50 border border-slate-700 rounded-full text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all" onChange={(e) => setAramaTerimi(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-6">
                                {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = kalanGun(u.skt);
                                    const kritik = gun <= 3;
                                    return (
                                        <div key={u.id} className={`group bg-slate-800/30 p-8 rounded-[45px] border-2 transition-all hover:bg-slate-800/50 hover:-translate-y-2 ${kritik ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-800'}`}>
                                            <div className="flex justify-between items-start mb-8">
                                                <div className={`p-5 rounded-3xl ${kritik ? 'bg-rose-500 text-white' : 'bg-slate-700 text-indigo-400'}`}>
                                                    {u.saklama_yeri === 'buzluk' ? <Snowflake size={28} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={28} /> : <Sun size={28} />}
                                                </div>
                                                <button onClick={() => urunSil(u.id)} className="p-3 bg-slate-900 text-slate-500 hover:text-rose-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{u.ad}</h3>
                                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{u.miktar} • {u.saklama_yeri}</p>

                                            <div className="mt-10 pt-6 border-t border-slate-700/50 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Kalan Ömür</p>
                                                    <p className={`text-xl font-black ${kritik ? 'text-rose-500' : 'text-emerald-400'}`}>
                                                        {gun <= 0 ? 'SÜRESİ DOLDU' : `${gun} GÜN`}
                                                    </p>
                                                </div>
                                                {kritik && <AlertTriangle className="text-rose-500 animate-pulse" size={32} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                ) : (
                    /* KÜTÜPHANE AYARLARI */
                    <div className="w-full space-y-10 animate-in fade-in duration-700">
                        <div className="bg-indigo-600 p-12 rounded-[50px] shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-4xl font-black text-white mb-4">Gıda Kütüphanesi</h2>
                                <p className="text-indigo-100 font-bold max-w-xl">Yeni gıda türleri ekleyerek sistemin otomatik son tüketim tarihi hesaplamasını sağlayın.</p>
                            </div>
                            <ChefHat className="absolute -right-10 -bottom-10 text-indigo-500/30 w-80 h-80 rotate-12" />
                        </div>

                        <div className="bg-slate-800/40 p-10 rounded-[40px] border border-slate-700">
                            <h3 className="text-xl font-black text-white mb-8">Yeni Tanım Ekle</h3>
                            <form onSubmit={veritabaninaEkle} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                                <input placeholder="Gıda Adı" className="p-5 bg-slate-900/50 border border-slate-700 rounded-3xl font-bold text-white outline-none" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                <input placeholder="Birim (Litre, Kg...)" className="p-5 bg-slate-900/50 border border-slate-700 rounded-3xl font-bold text-white outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })} />
                                <input type="number" placeholder="Dolap Ömrü" className="p-5 bg-blue-900/20 border border-blue-500/30 rounded-3xl font-bold text-blue-400 outline-none" value={yeniGida.dolap} onChange={e => setYeniGida({ ...yeniGida, dolap: e.target.value })} />
                                <input type="number" placeholder="Buzluk Ömrü" className="p-5 bg-cyan-900/20 border border-cyan-500/30 rounded-3xl font-bold text-cyan-400 outline-none" value={yeniGida.buzluk} onChange={e => setYeniGida({ ...yeniGida, buzluk: e.target.value })} />
                                <button type="submit" className="bg-white text-slate-900 h-[68px] rounded-3xl font-black hover:bg-indigo-400 hover:text-white transition-all">SİSTEME KAYDET</button>
                            </form>
                        </div>

                        <div className="bg-slate-800/20 rounded-[40px] border border-slate-800 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        <th className="p-8">Gıda</th>
                                        <th className="p-8 text-center">Birim</th>
                                        <th className="p-8 text-center text-blue-400">Dolap (G)</th>
                                        <th className="p-8 text-center text-cyan-400">Buzluk (G)</th>
                                        <th className="p-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {Object.entries(gidaVeritabani).map(([key, val]) => (
                                        <tr key={key} className="hover:bg-slate-800/30 transition-all">
                                            <td className="p-8 font-black text-white text-xl">{key}</td>
                                            <td className="p-8 text-center font-bold text-slate-400">{val.birim}</td>
                                            <td className="p-8 text-center font-black text-blue-400">{val.dolap || '-'}</td>
                                            <td className="p-8 text-center font-black text-cyan-400">{val.buzluk || '-'}</td>
                                            <td className="p-8 text-right px-10">
                                                <button onClick={() => kutuphaneSil(key)} className="text-slate-600 hover:text-rose-500 p-3 bg-slate-900/50 rounded-2xl"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}