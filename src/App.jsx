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

    if (loading) return <div className="h-screen w-full bg-[#0F172A] flex items-center justify-center text-white text-3xl font-black italic animate-pulse">SİSTEM YÜKLENİYOR...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden">

            {/* SIDEBAR - Biraz daha genişlettik (350px) */}
            <aside className="w-[350px] bg-slate-900 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto">
                <div className="p-12 flex items-center gap-5">
                    <div className="bg-indigo-600 p-4 rounded-[24px] shadow-2xl shadow-indigo-600/30">
                        <ChefHat className="text-white w-9 h-9" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">MUTFAK</h1>
                        <p className="text-indigo-400 font-bold tracking-[0.2em] text-xs">CONTROL PANEL</p>
                    </div>
                </div>

                <nav className="flex-1 px-8 space-y-4">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-5 px-8 py-6 rounded-[30px] text-lg font-black transition-all duration-300 ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>
                        <List size={26} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-5 px-8 py-6 rounded-[30px] text-lg font-black transition-all duration-300 ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 translate-x-2' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}>
                        <Settings size={26} /> Kütüphane
                    </button>
                </nav>

                <div className="p-10 border-t border-white/5">
                    <button className="flex items-center gap-4 text-slate-600 font-black hover:text-rose-500 transition-colors">
                        <LogOut size={22} /> OTURUMU KAPAT
                    </button>
                </div>
            </aside>

            {/* SAĞ TARAF - Tam Ekran Hakimiyeti */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950/40">

                {/* HEADER - Daha yüksek ve daha büyük font */}
                <header className="h-32 border-b border-white/5 flex items-center justify-between px-20 shrink-0 backdrop-blur-md">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">{aktifSekme === 'liste' ? 'Mutfak Stokları' : 'Ürün Kütüphanesi'}</h2>

                    <div className="flex items-center gap-8">
                        <div className="relative w-[450px]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                            <input
                                type="text"
                                placeholder="Hızlıca ara..."
                                className="w-full pl-16 pr-8 py-5 bg-slate-900/80 border border-white/10 rounded-full text-white font-bold text-lg outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                onChange={(e) => setAramaTerimi(e.target.value)}
                            />
                        </div>
                        <div className="h-12 w-[1px] bg-white/10"></div>
                        <div className="flex items-center gap-4">
                            <Circle size={10} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Canlı Bağlantı</span>
                        </div>
                    </div>
                </header>

                {/* ANA İÇERİK - max-w-none ile tüm kısıtlamalar iptal */}
                <main className="flex-1 overflow-y-auto p-20 w-full max-w-none">

                    {aktifSekme === 'liste' ? (
                        <div className="flex flex-col 2xl:flex-row gap-16 items-start w-full">

                            {/* SOL: ÜRÜN EKLEME FORMU (Boyutlar büyüdü) */}
                            <aside className="w-full 2xl:w-[450px] shrink-0">
                                <div className="bg-slate-900/50 p-12 rounded-[50px] border border-white/5 shadow-2xl backdrop-blur-xl">
                                    <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4"><Plus size={28} className="text-indigo-400" /> Yeni Kayıt</h3>
                                    <form onSubmit={urunEkle} className="space-y-8">
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-3">Gıda Seçimi</label>
                                            <select className="w-full p-6 bg-slate-950 border border-white/10 rounded-[24px] font-black text-white text-lg outline-none focus:border-indigo-500 transition-all cursor-pointer" value={secilenUrunKey} onChange={e => setSecilenUrunKey(e.target.value)}>
                                                <option value="">Lütfen Seçin...</option>
                                                {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-3">Saklama Alanı</label>
                                            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-2.5 rounded-[24px] border border-white/10">
                                                {['dolap', 'buzluk', 'kiler'].map(t => (
                                                    <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-4 rounded-[18px] text-xs font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-3">Miktar</label>
                                                <input type="number" placeholder="1" className="w-full p-6 bg-slate-950 border border-white/10 rounded-[24px] font-black text-white text-lg outline-none" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-3">Son Tarih</label>
                                                <input type="date" className="w-full p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-[24px] font-black text-sm text-indigo-300 outline-none" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                            </div>
                                        </div>

                                        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-8 rounded-[30px] font-black text-xl transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 group mt-4">
                                            SİSTEME İŞLE <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} />
                                        </button>
                                    </form>
                                </div>
                            </aside>

                            {/* SAĞ: ENVANTER KARTLARI (Büyük ve Yaygın) */}
                            <section className="flex-1 w-full min-w-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 3xl:grid-cols-4 gap-10">
                                    {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                        const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                        const kritik = gun <= 3;
                                        return (
                                            <div key={u.id} className={`p-10 rounded-[60px] border-2 transition-all hover:-translate-y-3 shadow-2xl ${kritik ? 'bg-rose-500/10 border-rose-500/40 shadow-rose-500/10' : 'bg-slate-900/40 border-white/5 hover:bg-slate-900/60 shadow-black/40'}`}>
                                                <div className="flex justify-between items-start mb-10">
                                                    <div className={`p-6 rounded-[30px] ${kritik ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30' : 'bg-slate-950 text-indigo-400 shadow-xl'}`}>
                                                        {u.saklama_yeri === 'buzluk' ? <Snowflake size={40} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={40} /> : <Sun size={40} />}
                                                    </div>
                                                    <button onClick={async () => { if (confirm('Sileyim mi?')) { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); } }} className="p-4 bg-slate-950/50 text-slate-700 hover:text-rose-500 transition-colors rounded-2xl">
                                                        <Trash2 size={24} />
                                                    </button>
                                                </div>

                                                <h4 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight mb-2 truncate">{u.ad}</h4>
                                                <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-10">{u.miktar} • {u.saklama_yeri}</p>

                                                <div className="pt-8 border-t border-white/5 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Tahmini Kalan Ömür</p>
                                                        <p className={`text-4xl font-black ${kritik ? 'text-rose-500' : 'text-emerald-400'}`}>
                                                            {gun <= 0 ? 'TÜKENDİ' : `${gun} GÜN`}
                                                        </p>
                                                    </div>
                                                    {kritik && <AlertTriangle className="text-rose-500 animate-pulse" size={48} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </div>
                    ) : (
                        /* KÜTÜPHANE SAYFASI - DEV TABLO */
                        <div className="w-full space-y-16">
                            <div className="bg-indigo-600 p-20 rounded-[70px] shadow-3xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h2 className="text-7xl font-black text-white mb-6 tracking-tighter italic">Kütüphane</h2>
                                    <p className="text-indigo-100 font-bold text-2xl max-w-4xl opacity-80 leading-relaxed">Gıda türlerini tanımlayın, sistem otomatik SKT takibi yapsın. Mutfaktaki her şeyin kontrolü elinizde olsun.</p>
                                </div>
                                <ChefHat className="absolute -right-20 -bottom-20 text-white/5 w-[500px] h-[500px] -rotate-12" />
                            </div>

                            <div className="bg-slate-900/40 p-16 rounded-[60px] border border-white/5 shadow-2xl">
                                <h3 className="text-3xl font-black text-white mb-12">Yeni Tanım Ekle</h3>
                                <form onSubmit={kutuphaneEkle} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                    <input placeholder="Gıda Adı" className="p-7 bg-slate-950 border border-white/10 rounded-[30px] font-black text-white text-xl outline-none focus:border-indigo-500" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    <input placeholder="Birim" className="p-7 bg-slate-950 border border-white/10 rounded-[30px] font-black text-white text-xl outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })} />
                                    <input type="number" placeholder="Dolap (G)" className="p-7 bg-blue-900/10 border border-blue-500/20 rounded-[30px] font-black text-blue-400 text-xl outline-none" value={yeniGida.dolap} onChange={e => setYeniGida({ ...yeniGida, dolap: e.target.value })} />
                                    <input type="number" placeholder="Buzluk (G)" className="p-7 bg-cyan-900/10 border border-cyan-500/20 rounded-[30px] font-black text-cyan-400 text-xl outline-none" value={yeniGida.buzluk} onChange={e => setYeniGida({ ...yeniGida, buzluk: e.target.value })} />
                                    <button type="submit" className="bg-white text-slate-900 rounded-[30px] font-black text-lg hover:bg-indigo-500 hover:text-white transition-all shadow-2xl shadow-white/5 uppercase">Sisteme Kaydet</button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}