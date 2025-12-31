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

    if (loading) return <div className="h-screen w-full bg-[#0F172A] flex items-center justify-center text-white">Yükleniyor...</div>;

    return (
        // min-w-full ve h-screen ile ekranın dışına taşmayı engelle ve tam kapla
        <div className="flex h-screen w-full min-w-full bg-[#0F172A] text-slate-200 font-sans overflow-hidden">

            {/* SIDEBAR - 320px Sabit Genişlik */}
            <aside className="w-[320px] bg-slate-900 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto">
                <div className="p-10 flex items-center gap-4">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-600/20">
                        <ChefHat className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-xl font-black text-white tracking-tighter uppercase">Mutfak Pro</h1>
                </div>

                <nav className="flex-1 px-6 space-y-2">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-800'}`}>
                        <List size={20} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-800'}`}>
                        <Settings size={20} /> Kütüphane
                    </button>
                </nav>

                <div className="p-8 border-t border-white/5 opacity-50">
                    <button className="flex items-center gap-3 text-sm font-bold"><LogOut size={18} /> Oturumu Kapat</button>
                </div>
            </aside>

            {/* SAĞ TARAF: HEADER + CONTENT (ASIL SORUN BURADAYDI) */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20">

                {/* HEADER - Tam Genişlik */}
                <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 shrink-0">
                    <h2 className="text-2xl font-black text-white">{aktifSekme === 'liste' ? 'Stoklar' : 'Kütüphane'}</h2>
                    <div className="flex items-center gap-4 bg-slate-900/50 px-5 py-2 rounded-full border border-white/5">
                        <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Veritabanı Online</span>
                    </div>
                </header>

                {/* ANA İÇERİK - grid-cols-12 ile geniş alanı zorla */}
                <main className="flex-1 overflow-y-auto p-12">
                    <div className="w-full max-w-none">

                        {aktifSekme === 'liste' ? (
                            <div className="grid grid-cols-12 gap-10">

                                {/* SOL PANEL (FORMLAR) - 3/12 yer kaplar */}
                                <div className="col-span-12 xl:col-span-4 2xl:col-span-3">
                                    <div className="bg-slate-900/50 p-8 rounded-[40px] border border-white/5">
                                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3"><Plus size={18} className="text-indigo-400" /> Yeni Ürün</h3>
                                        <form onSubmit={urunEkle} className="space-y-5">
                                            <select className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl font-bold text-white outline-none focus:border-indigo-500 transition-all" value={secilenUrunKey} onChange={e => setSecilenUrunKey(e.target.value)}>
                                                <option value="">Ürün Seç...</option>
                                                {Object.keys(gidaVeritabani).map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>

                                            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl">
                                                {['dolap', 'buzluk', 'kiler'].map(t => (
                                                    <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{t}</button>
                                                ))}
                                            </div>

                                            <div className="flex gap-4">
                                                <input type="number" placeholder="Mik." className="w-20 p-4 bg-slate-950 border border-white/10 rounded-2xl font-bold text-white" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                                <input type="date" className="flex-1 p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-2xl font-bold text-xs text-indigo-300" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                            </div>

                                            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2">KAYDET <ArrowRight size={18} /></button>
                                        </form>
                                    </div>
                                </div>

                                {/* SAĞ PANEL (KARTLAR) - 9/12 yer kaplayarak ekranı doldurur */}
                                <div className="col-span-12 xl:col-span-8 2xl:col-span-9">
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input type="text" placeholder="Ürünlerde ara..." className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-white/5 rounded-full font-bold outline-none" onChange={e => setAramaTerimi(e.target.value)} />
                                        </div>
                                    </div>

                                    {/* KART GRİDİ - Burada genişliği zorlamak için cols sayılarını artırdık */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
                                        {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                            const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                            return (
                                                <div key={u.id} className="bg-slate-900/30 p-6 rounded-[35px] border border-white/5 hover:bg-slate-900/60 transition-all">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="p-4 bg-slate-950 rounded-2xl text-indigo-400">
                                                            {u.saklama_yeri === 'buzluk' ? <Snowflake /> : u.saklama_yeri === 'dolap' ? <Thermometer /> : <Sun />}
                                                        </div>
                                                        <button onClick={async () => { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); }} className="text-slate-600 hover:text-rose-500 p-2"><Trash2 size={16} /></button>
                                                    </div>
                                                    <h4 className="text-xl font-black text-white uppercase truncate">{u.ad}</h4>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{u.miktar} • {u.saklama_yeri}</p>
                                                    <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                                                        <span className={`font-black ${gun <= 3 ? 'text-rose-500' : 'text-emerald-400'}`}>{gun <= 0 ? 'SÜRE DOLDU' : `${gun} GÜN`}</span>
                                                        {gun <= 3 && <AlertTriangle size={20} className="text-rose-500 animate-pulse" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        ) : (
                            /* KÜTÜPHANE SAYFASI - BURASI DA ARTIK TAM GENİŞLİK */
                            <div className="w-full space-y-8">
                                <div className="bg-indigo-600 p-12 rounded-[50px] shadow-2xl relative overflow-hidden">
                                    <h2 className="text-4xl font-black text-white relative z-10">Gıda Tanımları</h2>
                                    <ChefHat size={200} className="absolute -right-10 -bottom-10 text-white/10 -rotate-12" />
                                </div>
                                {/* ... Kütüphane form ve tablo içeriği (w-full olarak gelecek) ... */}
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}