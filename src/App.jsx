import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ArrowRight, AlertTriangle, ChefHat,
    List, Settings, LogOut, Circle, ShoppingCart
} from 'lucide-react';

export default function App() {
    // --- VERİ STATE'LERİ ---
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- UI STATE'LERİ ---
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");
    const [aramaTerimi, setAramaTerimi] = useState("");
    const [yeniGida, setYeniGida] = useState({ ad: "", birim: "Adet", dolap: "", buzluk: "", kiler: "" });

    // --- VERİ ÇEKME ---
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

    // --- OTOMATİK SKT HESAPLAMA ---
    useEffect(() => {
        if (secilenUrunKey && gidaVeritabani[secilenUrunKey]) {
            const gun = gidaVeritabani[secilenUrunKey][saklamaYeri];
            if (gun) {
                const d = new Date();
                d.setDate(d.getDate() + parseInt(gun));
                setManuelTarih(d.toISOString().split('T')[0]);
            }
        }
    }, [secilenUrunKey, saklamaYeri, gidaVeritabani]);

    // --- FONKSİYONLAR ---
    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return alert("Bilgileri kontrol et!");
        const { error } = await supabase.from('envanter').insert([{
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey].birim}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        }]);
        if (!error) { setSecilenUrunKey(""); setMiktar(""); verileriGetir(); }
    };

    const kutuphaneEkle = async (e) => {
        e.preventDefault();
        if (!yeniGida.ad) return alert("Gıda adı boş olamaz!");
        const { error } = await supabase.from('gida_kutuphanesi').insert([{
            ad: yeniGida.ad,
            birim: yeniGida.birim,
            dolap: yeniGida.dolap ? parseInt(yeniGida.dolap) : null,
            buzluk: yeniGida.buzluk ? parseInt(yeniGida.buzluk) : null,
            kiler: yeniGida.kiler ? parseInt(yeniGida.kiler) : null
        }]);
        if (!error) { setYeniGida({ ad: "", birim: "Adet", dolap: "", buzluk: "", kiler: "" }); verileriGetir(); }
    };

    const urunSil = async (id) => {
        const { error } = await supabase.from('envanter').delete().eq('id', id);
        if (!error) verileriGetir();
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-indigo-400 font-black tracking-widest animate-pulse text-2xl">SİSTEM YÜKLENİYOR...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#0F172A] text-slate-200 overflow-hidden font-sans">

            {/* --- SIDEBAR --- */}
            <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 shadow-2xl">
                <div className="p-10 flex items-center gap-4">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <ChefHat className="text-white w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white leading-none">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Envanter v2.0</p>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-3 mt-4">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] font-black transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>
                        <List size={22} /> Envanter Listesi
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] font-black transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>
                        <Settings size={22} /> Gıda Kütüphanesi
                    </button>
                </nav>

                <div className="p-8 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 mb-6">
                        <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server Connected</span>
                    </div>
                    <button className="flex items-center gap-3 text-slate-600 font-bold hover:text-rose-400 transition-all"><LogOut size={20} /> Çıkış Yap</button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* HEADER */}
                <header className="h-28 bg-slate-900/40 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-16 shrink-0 z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight uppercase">
                            {aktifSekme === 'liste' ? 'Envanter' : 'Kütüphane'}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Stok Yönetim Paneli</p>
                    </div>
                    <div className="relative w-96">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            placeholder="Hızlı arama yapın..."
                            className="w-full pl-16 pr-8 py-4 bg-slate-800/50 border border-slate-700 rounded-full text-white font-bold outline-none focus:border-indigo-500 transition-all"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </header>

                {/* SCROLLABLE AREA */}
                <main className="flex-1 overflow-y-auto p-16 w-full max-w-none custom-scrollbar">

                    {aktifSekme === 'liste' ? (
                        <div className="grid grid-cols-12 gap-12 w-full">

                            {/* SOL: EKLEME FORMU */}
                            <aside className="col-span-12 xl:col-span-4 2xl:col-span-3">
                                <div className="bg-slate-800/30 p-10 rounded-[45px] border border-slate-700/50 sticky top-0 shadow-2xl">
                                    <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3"><Plus className="text-indigo-400" /> Ürün Girişi</h3>
                                    <form onSubmit={urunEkle} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Gıda Tipi</label>
                                            <select className="w-full p-6 bg-slate-900 border border-slate-700 rounded-3xl font-bold text-white outline-none focus:border-indigo-500 appearance-none" value={secilenUrunKey} onChange={e => setSecilenUrunKey(e.target.value)}>
                                                <option value="">Seçiniz...</option>
                                                {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Saklama Yeri</label>
                                            <div className="grid grid-cols-3 gap-3 bg-slate-900 p-2 rounded-3xl border border-slate-700">
                                                {['dolap', 'buzluk', 'kiler'].map(t => (
                                                    <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Miktar</label>
                                                <input type="number" placeholder="1" className="w-full p-6 bg-slate-900 border border-slate-700 rounded-3xl font-bold text-white outline-none" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">SKT</label>
                                                <input type="date" className="w-full p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-3xl font-bold text-indigo-300 outline-none" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                            </div>
                                        </div>

                                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-3xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group">
                                            ENVANTERE İŞLE <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </form>
                                </div>
                            </aside>

                            {/* SAĞ: KARTLAR */}
                            <section className="col-span-12 xl:col-span-8 2xl:col-span-9">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-8">
                                    {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                        const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                        const kritik = gun <= 3;
                                        return (
                                            <div key={u.id} className={`p-8 rounded-[48px] border-2 transition-all hover:-translate-y-2 ${kritik ? 'bg-rose-500/5 border-rose-500/30' : 'bg-slate-800/30 border-slate-800/50 hover:bg-slate-800/50'}`}>
                                                <div className="flex justify-between items-start mb-8">
                                                    <div className={`p-5 rounded-3xl ${kritik ? 'bg-rose-500 text-white' : 'bg-slate-900 text-indigo-400'}`}>
                                                        {u.saklama_yeri === 'buzluk' ? <Snowflake size={30} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={30} /> : <Sun size={30} />}
                                                    </div>
                                                    <button onClick={() => urunSil(u.id)} className="p-3 bg-slate-900/50 text-slate-600 hover:text-rose-500 transition-colors rounded-2xl"><Trash2 size={20} /></button>
                                                </div>
                                                <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-1">{u.ad}</h4>
                                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{u.miktar} • {u.saklama_yeri}</p>

                                                <div className="mt-10 pt-6 border-t border-slate-700/50 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Kalan Süre</p>
                                                        <p className={`text-2xl font-black ${kritik ? 'text-rose-500' : 'text-emerald-400'}`}>{gun <= 0 ? 'DOLDU' : `${gun} GÜN`}</p>
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
                        /* KÜTÜPHANE SAYFASI */
                        <div className="w-full space-y-12">
                            <div className="bg-indigo-600 p-16 rounded-[60px] shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-5xl font-black text-white mb-4">Gıda Kütüphanesi</h2>
                                    <p className="text-indigo-100 font-bold max-w-2xl text-lg opacity-80">Yeni ürün tipleri ekleyerek sistemin otomatik son tüketim tarihi hesaplamasını kalibre edin.</p>
                                </div>
                                <ChefHat className="absolute -right-16 -bottom-16 text-white/10 w-96 h-96 -rotate-12" />
                            </div>

                            <div className="bg-slate-900/40 p-12 rounded-[50px] border border-slate-800 shadow-xl">
                                <h3 className="text-xl font-black text-white mb-8">Sisteme Yeni Gıda Tanımla</h3>
                                <form onSubmit={kutuphaneEkle} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                                    <input placeholder="Gıda Adı" className="p-6 bg-slate-900 border border-slate-700 rounded-3xl font-bold text-white outline-none" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    <input placeholder="Birim (Kg, Adet...)" className="p-6 bg-slate-900 border border-slate-700 rounded-3xl font-bold text-white outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })} />
                                    <input type="number" placeholder="Dolap (Gün)" className="p-6 bg-blue-900/10 border border-blue-500/20 rounded-3xl font-bold text-blue-400 outline-none" value={yeniGida.dolap} onChange={e => setYeniGida({ ...yeniGida, dolap: e.target.value })} />
                                    <input type="number" placeholder="Buzluk (Gün)" className="p-6 bg-cyan-900/10 border border-cyan-500/20 rounded-3xl font-bold text-cyan-400 outline-none" value={yeniGida.buzluk} onChange={e => setYeniGida({ ...yeniGida, buzluk: e.target.value })} />
                                    <button type="submit" className="bg-white text-slate-900 rounded-3xl font-black text-sm hover:bg-indigo-400 hover:text-white transition-all">SİSTEME KAYDET</button>
                                </form>
                            </div>

                            <div className="bg-slate-900/20 rounded-[50px] border border-slate-800 overflow-hidden shadow-2xl">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-800/50 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em]">
                                            <th className="p-10">Ürün Tipi</th>
                                            <th className="p-10 text-center">Birim</th>
                                            <th className="p-10 text-center text-blue-400">Dolap Ömrü</th>
                                            <th className="p-10 text-center text-cyan-400">Buzluk Ömrü</th>
                                            <th className="p-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {Object.entries(gidaVeritabani).map(([k, v]) => (
                                            <tr key={k} className="hover:bg-slate-800/30 transition-all">
                                                <td className="p-10 font-black text-white text-2xl tracking-tight">{k}</td>
                                                <td className="p-10 text-center font-bold text-slate-500">{v.birim}</td>
                                                <td className="p-10 text-center font-black text-blue-400 text-xl">{v.dolap || '-'} GÜN</td>
                                                <td className="p-10 text-center font-black text-cyan-400 text-xl">{v.buzluk || '-'} GÜN</td>
                                                <td className="p-10 text-right"><button onClick={async () => { await supabase.from('gida_kutuphanesi').delete().eq('ad', k); verileriGetir(); }} className="text-slate-700 hover:text-rose-500 p-4 bg-slate-900/50 rounded-2xl"><Trash2 size={20} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}