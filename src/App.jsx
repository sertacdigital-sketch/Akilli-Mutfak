import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ArrowRight, AlertTriangle, ChefHat,
    List, Settings, LogOut, Circle
} from 'lucide-react';

export default function App() {
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");
    const [aramaTerimi, setAramaTerimi] = useState("");
    const [yeniGida, setYeniGida] = useState({ ad: "", birim: "Adet", dolap: "", buzluk: "", kiler: "" });

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

    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return alert("Eksik bilgi!");
        const { error } = await supabase.from('envanter').insert([{
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey].birim}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        }]);
        if (!error) { setSecilenUrunKey(""); setMiktar(""); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-full bg-[#0F172A] flex items-center justify-center text-indigo-500 text-4xl font-black tracking-tighter animate-pulse">MUTFAK YÜKLENİYOR...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#070B14] text-slate-200 font-sans overflow-hidden">

            {/* SIDEBAR - Ultra Geniş ve Ferah */}
            <aside className="w-[400px] bg-slate-900/20 border-r border-white/5 flex flex-col shrink-0">
                <div className="p-16 mb-8 flex flex-col items-start gap-6">
                    <div className="bg-indigo-600 p-5 rounded-[32px] shadow-2xl shadow-indigo-600/40">
                        <ChefHat className="text-white w-12 h-12" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">MUTFAK<span className="text-indigo-500">PRO</span></h1>
                        <p className="text-slate-500 font-bold tracking-[0.4em] text-xs">SMART INVENTORY</p>
                    </div>
                </div>

                <nav className="flex-1 px-10 space-y-6">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-6 px-10 py-8 rounded-[40px] text-xl font-black transition-all duration-500 ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-3xl shadow-indigo-600/40 scale-105' : 'text-slate-500 hover:bg-white/5'}`}>
                        <List size={32} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-6 px-10 py-8 rounded-[40px] text-xl font-black transition-all duration-500 ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-3xl shadow-indigo-600/40 scale-105' : 'text-slate-500 hover:bg-white/5'}`}>
                        <Settings size={32} /> Kütüphane
                    </button>
                </nav>

                <div className="p-16 opacity-30">
                    <button className="flex items-center gap-4 text-lg font-black tracking-widest hover:text-rose-500 transition-all"><LogOut size={24} /> SİSTEMDEN ÇIK</button>
                </div>
            </aside>

            {/* ANA PANEL */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* HEADER - Dev Genişlik */}
                <header className="h-40 flex items-center justify-between px-24 shrink-0">
                    <div className="space-y-2">
                        <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">{aktifSekme === 'liste' ? 'Stoklar' : 'Kütüphane'}</h2>
                        <div className="flex items-center gap-3">
                            <Circle size={10} className="fill-emerald-500 text-emerald-500" />
                            <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Tüm sistemler aktif ve senkronize</p>
                        </div>
                    </div>

                    <div className="relative group w-[500px]">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={28} />
                        <input
                            type="text"
                            placeholder="Ürün adı ile ara..."
                            className="w-full pl-20 pr-10 py-7 bg-white/5 border border-white/10 rounded-full text-white font-bold text-xl outline-none focus:bg-white/10 focus:border-indigo-500/50 transition-all"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </header>

                {/* CONTENT - Boşluklar (Gap) ve Padding Artırıldı */}
                <main className="flex-1 overflow-y-auto p-24 w-full">

                    {aktifSekme === 'liste' ? (
                        <div className="grid grid-cols-12 gap-20 w-full">

                            {/* SOL: ÜRÜN EKLEME FORMU - Artık daha heybetli */}
                            <aside className="col-span-12 3xl:col-span-3">
                                <div className="bg-slate-900/40 p-16 rounded-[60px] border border-white/5 shadow-inner sticky top-0">
                                    <h3 className="text-3xl font-black text-white mb-12 flex items-center gap-5"><Plus size={36} className="text-indigo-500" /> Ürün Girişi</h3>
                                    <form onSubmit={urunEkle} className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Gıda Kategorisi</label>
                                            <select className="w-full p-8 bg-slate-950 border border-white/10 rounded-[32px] font-black text-white text-2xl outline-none focus:border-indigo-500 appearance-none cursor-pointer" value={secilenUrunKey} onChange={e => setSecilenUrunKey(e.target.value)}>
                                                <option value="">Seçim Yapın</option>
                                                {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Muhafaza Ortamı</label>
                                            <div className="grid grid-cols-3 gap-4 bg-slate-950 p-3 rounded-[32px] border border-white/10">
                                                {['dolap', 'buzluk', 'kiler'].map(t => (
                                                    <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-5 rounded-[24px] text-sm font-black uppercase transition-all duration-300 ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-2xl' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Miktar</label>
                                                <input type="number" className="w-full p-8 bg-slate-950 border border-white/10 rounded-[32px] font-black text-white text-2xl outline-none focus:border-indigo-500" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] ml-4">SKT</label>
                                                <input type="date" className="w-full p-8 bg-indigo-900/10 border border-indigo-500/20 rounded-[32px] font-black text-lg text-indigo-400 outline-none" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                            </div>
                                        </div>

                                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-10 rounded-[40px] font-black text-2xl transition-all shadow-3xl shadow-indigo-600/40 flex items-center justify-center gap-6 group">
                                            ENVANTERE KAYDET <ArrowRight className="group-hover:translate-x-3 transition-transform" size={32} />
                                        </button>
                                    </form>
                                </div>
                            </aside>

                            {/* SAĞ: ENVANTER KARTLARI - Tamamen nefes alan düzen */}
                            <section className="col-span-12 3xl:col-span-9">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 4xl:grid-cols-4 gap-12">
                                    {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                        const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                        const kritik = gun <= 3;
                                        return (
                                            <div key={u.id} className={`p-12 rounded-[70px] border-2 transition-all duration-500 hover:-translate-y-4 ${kritik ? 'bg-rose-500/5 border-rose-500/30 shadow-3xl shadow-rose-500/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                                <div className="flex justify-between items-start mb-12">
                                                    <div className={`p-8 rounded-[35px] ${kritik ? 'bg-rose-500 text-white shadow-2xl' : 'bg-slate-950 text-indigo-500 shadow-xl'}`}>
                                                        {u.saklama_yeri === 'buzluk' ? <Snowflake size={48} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={48} /> : <Sun size={48} />}
                                                    </div>
                                                    <button onClick={async () => { if (confirm('Emin misin?')) { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); } }} className="p-5 bg-white/5 text-slate-700 hover:text-rose-500 transition-colors rounded-3xl">
                                                        <Trash2 size={28} />
                                                    </button>
                                                </div>

                                                <div className="space-y-2 mb-12">
                                                    <h4 className="text-4xl font-black text-white uppercase tracking-tighter leading-none truncate">{u.ad}</h4>
                                                    <p className="text-lg font-bold text-slate-500 uppercase tracking-[0.3em]">{u.miktar} • {u.saklama_yeri}</p>
                                                </div>

                                                <div className="pt-10 border-t border-white/10 flex justify-between items-end">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Kalan Kullanım</p>
                                                        <p className={`text-5xl font-black ${kritik ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                            {gun <= 0 ? 'BİTTİ' : `${gun} GÜN`}
                                                        </p>
                                                    </div>
                                                    {kritik && <AlertTriangle className="text-rose-500 animate-bounce" size={56} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                    ) : (
                        /* KÜTÜPHANE SAYFASI - DEV MODU */
                        <div className="w-full space-y-20">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-24 rounded-[80px] shadow-4xl relative overflow-hidden">
                                <div className="relative z-10 space-y-6">
                                    <h2 className="text-8xl font-black text-white tracking-tighter italic">KÜTÜPHANE</h2>
                                    <p className="text-indigo-100 font-bold text-3xl max-w-5xl opacity-80 leading-relaxed uppercase">Gıda veritabanını yönetin ve akıllı SKT sürelerini optimize edin.</p>
                                </div>
                                <ChefHat className="absolute -right-24 -bottom-24 text-white/5 w-[600px] h-[600px] -rotate-12" />
                            </div>

                            <div className="bg-white/5 p-20 rounded-[70px] border border-white/10">
                                <h3 className="text-4xl font-black text-white mb-16">Yeni Gıda Türü Tanımla</h3>
                                <form onSubmit={kutuphaneEkle} className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                                    <input placeholder="Gıda İsmi" className="p-9 bg-slate-950 border border-white/10 rounded-[40px] font-black text-white text-2xl outline-none focus:border-indigo-500" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    <input placeholder="Birim" className="p-9 bg-slate-950 border border-white/10 rounded-[40px] font-black text-white text-2xl outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })} />
                                    <input type="number" placeholder="Dolap (G)" className="p-9 bg-blue-900/10 border border-blue-500/20 rounded-[40px] font-black text-blue-400 text-2xl outline-none" value={yeniGida.dolap} onChange={e => setYeniGida({ ...yeniGida, dolap: e.target.value })} />
                                    <input type="number" placeholder="Buzluk (G)" className="p-9 bg-cyan-900/10 border border-cyan-500/20 rounded-[40px] font-black text-cyan-400 text-2xl outline-none" value={yeniGida.buzluk} onChange={e => setYeniGida({ ...yeniGida, buzluk: e.target.value })} />
                                    <button type="submit" className="bg-white text-slate-900 rounded-[40px] font-black text-xl hover:bg-indigo-500 hover:text-white transition-all shadow-3xl uppercase tracking-widest">KAYDET</button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}