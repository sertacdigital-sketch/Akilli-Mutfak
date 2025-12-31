import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, LayoutDashboard, Database,
    Calendar, Package, Trash
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
            const bugun = new Date();
            bugun.setDate(bugun.getDate() + parseInt(omur));
            setSktTarihi(bugun.toISOString().split('T')[0]);
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
        <div className="min-h-screen w-full bg-[#020617] text-slate-300 font-sans overflow-x-hidden">

            {/* ÜST NAVİGASYON - TAM GENİŞLİK (w-full) */}
            <nav className="sticky top-0 z-50 w-full bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 px-6">
                <div className="w-full h-16 flex items-center justify-between">

                    {/* Logo */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
                            <ChefHat className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-[12px] font-black text-white tracking-[0.2em] uppercase italic leading-tight">
                            MUTFAK<span className="text-indigo-400">PRO</span>
                        </h1>
                    </div>

                    {/* Menü */}
                    <div className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-white/5">
                        <button onClick={() => setAktifSekme('liste')} className={`flex items-center gap-2 px-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                            <LayoutDashboard size={14} /> ENVANTER
                        </button>
                        <button onClick={() => setAktifSekme('ayarlar')} className={`flex items-center gap-2 px-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                            <Database size={14} /> KÜTÜPHANE
                        </button>
                    </div>

                    {/* Arama */}
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input
                            type="text"
                            placeholder="Hızlı arama yapın..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-white/10 rounded-xl text-[10px] text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700 font-bold"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </div>
            </nav>

            {/* ANA İÇERİK - TAM GENİŞLİK (w-full) */}
            <main className="w-full p-6 lg:p-10">
                {aktifSekme === 'liste' ? (
                    <div className="flex flex-col lg:flex-row gap-8 w-full">

                        {/* FORM ALANI */}
                        <div className="w-full lg:w-[400px] shrink-0">
                            <div className="bg-[#0F172A] p-8 rounded-[32px] border border-white/5 shadow-2xl sticky top-24">
                                <div className="flex items-center gap-2 mb-8">
                                    <Package size={16} className="text-indigo-400" />
                                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Stok Girişi</h3>
                                </div>

                                <form onSubmit={envanterEkle} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Gıda Seçimi</label>
                                        <select className="w-full p-4 bg-[#020617] border border-white/10 rounded-2xl text-[11px] text-white outline-none focus:ring-2 ring-indigo-500/20 transition-all appearance-none cursor-pointer" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                            <option value="">Seçiniz...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Muhafaza</label>
                                        <div className="grid grid-cols-3 gap-2 bg-[#020617] p-1.5 rounded-2xl border border-white/10">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Miktar</label>
                                            <input type="number" placeholder="1" className="w-full p-4 bg-[#020617] border border-white/10 rounded-2xl text-[11px] text-white outline-none focus:ring-2 ring-indigo-500/20" value={miktarDegeri} onChange={e => setMiktarDegeri(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Son Tarih</label>
                                            <input type="date" className="w-full p-4 bg-[#020617] border border-white/10 rounded-2xl text-[10px] text-white outline-none font-bold" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-white text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98]">
                                        SİSTEME İŞLE
                                    </button>
                                </form>
                            </div>
                        </div>

                        Harika bir fikir, özellikle çok fazla kart olduğunda ikonların neyi temsil ettiğini görmek kullanımı çok kolaylaştırır.

                        Modern arayüzlerde bu tür bilgilendirmeler için Tooltip (İpucu Balonu) kullanılır. Kartların içindeki ikonların üzerine gelindiğinde (hover) "Dondurucu", "Buzdolabı" veya "Kiler" yazısı çıkacak şekilde kodu güncelledim.

                        İşte ikonların üzerine "title" özelliği eklenmiş ve görsel olarak daha belirgin hale getirilmiş güncel kart yapısı:

                        JavaScript

                        {/* KARTLAR ALANI - Tooltip Eklenmiş Hali */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;

                                    // Dinamik İkon ve İpucu Belirleme
                                    const SaklamaIkona = () => {
                                        if (u.saklama_yeri === 'buzluk') return { icon: <Snowflake size={20} />, label: "Dondurucu / Buzluk", color: "bg-blue-500/10 text-blue-400" };
                                        if (u.saklama_yeri === 'dolap') return { icon: <Thermometer size={20} />, label: "Buzdolabı", color: "bg-indigo-500/10 text-indigo-400" };
                                        return { icon: <Sun size={20} />, label: "Kiler / Oda Sıcaklığı", color: "bg-orange-500/10 text-orange-400" };
                                    };

                                    const setup = SaklamaIkona();

                                    return (
                                        <div key={u.id} className={`group p-6 rounded-[28px] border transition-all duration-300 ${kritik ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[#0F172A] border-white/5 shadow-xl hover:translate-y-[-4px]'}`}>
                                            <div className="flex justify-between items-start mb-6">

                                                {/* İkon ve Tooltip Alanı */}
                                                <div
                                                    title={setup.label}
                                                    className={`p-3 rounded-2xl cursor-help transition-transform hover:scale-110 ${setup.color}`}
                                                >
                                                    {setup.icon}
                                                </div>

                                                <button onClick={() => { if (window.confirm('Kayıt silinsin mi?')) supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir); }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-700 hover:text-rose-500"><Trash2 size={18} /></button>
                                            </div>

                                            <h4 className="font-black text-white uppercase tracking-tight text-[13px] mb-2 truncate">{u.gida_ad}</h4>

                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase mb-8">
                                                <span className="bg-slate-950 px-2 py-0.5 rounded-md border border-white/5">{u.miktar}</span>
                                                <span className="tracking-widest opacity-60">{u.saklama_yeri}</span>
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
                    /* KÜTÜPHANE - TAM EKRAN */
                    <div className="w-full grid grid-cols-1 xl:grid-cols-4 gap-8">
                        <div className="xl:col-span-1">
                            <div className="bg-[#0F172A] p-8 rounded-[32px] border border-white/5 shadow-2xl">
                                <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-8 text-center">YENİ TANIMLAMA</h3>
                                {/* Buraya kütüphane ekleme formu gelecek */}
                            </div>
                        </div>
                        <div className="xl:col-span-3">
                            <div className="bg-[#0F172A] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-950/50 text-slate-600 uppercase text-[10px] font-black">
                                        <tr>
                                            <th className="p-6">Ürün</th><th className="p-6 text-center">Dolap</th><th className="p-6 text-center">Buzluk</th><th className="p-6 text-center">Kiler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-[11px]">
                                        {Object.values(gidaVeritabani).map(g => (
                                            <tr key={g.id} className="hover:bg-white/[0.01] transition-colors font-bold text-white uppercase">
                                                <td className="p-6">{g.ad} <span className="text-slate-600 ml-2 font-normal italic">({g.birim})</span></td>
                                                <td className="p-6 text-center text-indigo-400 font-mono">{g.dolap_omru} G</td>
                                                <td className="p-6 text-center text-blue-400 font-mono">{g.buzluk_omru} G</td>
                                                <td className="p-6 text-center text-orange-400 font-mono">{g.kiler_omru} G</td>
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