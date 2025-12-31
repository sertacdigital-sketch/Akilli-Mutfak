import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ArrowRight, ChefHat,
    List, Settings, LogOut, Circle, Save, Edit2
} from 'lucide-react';

export default function App() {
    // --- STATE ---
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    // Envanter Form State
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");

    // Kütüphane Form State
    const [yeniGidaAd, setYeniGidaAd] = useState("");
    const [yeniGidaBirim, setYeniGidaBirim] = useState("Adet");
    const [yeniGidaSure, setYeniGidaSure] = useState("");

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

    // --- ACTIONS ---
    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return alert("Eksik bilgi!");
        const { error } = await supabase.from('envanter').insert([{
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey]?.birim || ''}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        }]);
        if (!error) { setSecilenUrunKey(""); setMiktar(""); verileriGetir(); }
    };

    const kütüphaneyeEkle = async (e) => {
        e.preventDefault();
        if (!yeniGidaAd || !yeniGidaSure) return alert("Ad ve süre boş olamaz!");
        const { error } = await supabase.from('gida_kutuphanesi').insert([{
            ad: yeniGidaAd,
            birim: yeniGidaBirim,
            varsayilan_omur: parseInt(yeniGidaSure)
        }]);
        if (!error) { setYeniGidaAd(""); setYeniGidaSure(""); verileriGetir(); }
    };

    const kütüphaneSil = async (id) => {
        if (window.confirm('Bu ürün tipini silerseniz artık listede seçemezsiniz. Emin misiniz?')) {
            await supabase.from('gida_kutuphanesi').delete().eq('id', id);
            verileriGetir();
        }
    };

    // Ürün seçildiğinde tarihi otomatik hesapla
    const handleUrunSecimi = (ad) => {
        setSecilenUrunKey(ad);
        if (gidaVeritabani[ad]) {
            const bugun = new Date();
            bugun.setDate(bugun.getDate() + gidaVeritabani[ad].varsayilan_omur);
            setManuelTarih(bugun.toISOString().split('T')[0]);
        }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-slate-400 text-sm">Yükleniyor...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#0F172A] text-slate-300 font-sans overflow-hidden text-sm">

            {/* SIDEBAR */}
            <aside className="w-60 bg-[#1E293B] border-r border-slate-700/50 flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg"><ChefHat className="text-white w-5 h-5" /></div>
                    <h1 className="text-base font-bold text-white tracking-tight">MutfakPro</h1>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-colors ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <List size={18} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-colors ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Settings size={18} /> Kütüphane
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0F172A]">

                <header className="h-16 flex items-center justify-between px-8 shrink-0 border-b border-slate-700/50">
                    <h2 className="text-base font-bold text-white">{aktifSekme === 'liste' ? 'Mevcut Stoklar' : 'Ürün Tanımları (Kütüphane)'}</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input type="text" placeholder="Ara..." className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-white outline-none" onChange={(e) => setAramaTerimi(e.target.value)} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">

                    {aktifSekme === 'liste' ? (
                        <div className="flex flex-row gap-6 items-start h-full">
                            {/* ENVANTER FORMU */}
                            <aside className="w-[300px] shrink-0 bg-[#1E293B] p-5 rounded-xl border border-slate-700/50 shadow-sm">
                                <h3 className="text-xs font-bold text-white mb-5 flex items-center gap-2 uppercase tracking-wider opacity-70">Stok Ekle</h3>
                                <form onSubmit={urunEkle} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-400 ml-1">Ürün</label>
                                        <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none focus:border-indigo-500" value={secilenUrunKey} onChange={e => handleUrunSecimi(e.target.value)}>
                                            <option value="">Seçin...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-400 ml-1">Miktar</label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="1" className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                            <span className="p-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 rounded-lg min-w-[50px] text-center">{gidaVeritabani[secilenUrunKey]?.birim || '-'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-400 ml-1">SKT</label>
                                        <input type="date" className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                    </div>
                                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2">KAYDET</button>
                                </form>
                            </aside>

                            {/* ENVANTER LİSTESİ (KARTLAR) */}
                            <section className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
                                {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    return (
                                        <div key={u.id} className={`p-4 rounded-xl border transition-all ${kritik ? 'bg-rose-500/5 border-rose-500/20 shadow-sm' : 'bg-[#1E293B] border-slate-700/50'}`}>
                                            <div className="flex justify-between mb-3">
                                                <div className={`p-2 rounded-lg ${u.saklama_yeri === 'buzluk' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>{u.saklama_yeri === 'buzluk' ? <Snowflake size={16} /> : <Thermometer size={16} />}</div>
                                                <button onClick={async () => { if (window.confirm('Silinsin mi?')) { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); } }} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                            <h4 className="text-sm font-bold text-white truncate">{u.ad}</h4>
                                            <p className="text-[10px] text-slate-500">{u.miktar} • {u.saklama_yeri}</p>
                                            <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                                                <span className="text-[10px] text-slate-500 uppercase font-bold">Kalan</span>
                                                <span className={`text-xs font-black ${kritik ? 'text-rose-500' : 'text-emerald-500'}`}>{gun <= 0 ? 'BİTTİ' : `${gun} Gün`}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        </div>
                    ) : (
                        /* KÜTÜPHANE YÖNETİMİ */
                        <div className="flex flex-row gap-6 items-start h-full max-w-[1200px]">
                            {/* KÜTÜPHANE FORMU */}
                            <aside className="w-[300px] shrink-0 bg-[#1E293B] p-5 rounded-xl border border-slate-700/50">
                                <h3 className="text-xs font-bold text-white mb-5 flex items-center gap-2 uppercase tracking-wider opacity-70">Yeni Ürün Tanımla</h3>
                                <form onSubmit={kütüphaneyeEkle} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-400">Ürün Adı (Örn: Süt)</label>
                                        <input type="text" className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" value={yeniGidaAd} onChange={e => setYeniGidaAd(e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-400">Ömür (Gün Olarak)</label>
                                        <input type="number" placeholder="Örn: 7" className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" value={yeniGidaSure} onChange={e => setYeniGidaSure(e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-slate-400">Birim</label>
                                        <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white outline-none" value={yeniGidaBirim} onChange={e => setYeniGidaBirim(e.target.value)}>
                                            <option value="Adet">Adet</option>
                                            <option value="Kg">Kg</option>
                                            <option value="Litre">Litre</option>
                                            <option value="Paket">Paket</option>
                                        </select>
                                    </div>
                                    <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all"><Save size={14} /> Kütüphaneye Kaydet</button>
                                </form>
                            </aside>

                            {/* KÜTÜPHANE LİSTESİ */}
                            <section className="flex-1 bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead className="bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                                        <tr>
                                            <th className="p-4">Ürün Tipi</th>
                                            <th className="p-4">Standart Ömür</th>
                                            <th className="p-4">Birim</th>
                                            <th className="p-4 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {Object.values(gidaVeritabani).filter(g => g.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(g => (
                                            <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="p-4 font-bold text-white">{g.ad}</td>
                                                <td className="p-4 text-indigo-400 font-semibold">{g.varsayilan_omur} Gün</td>
                                                <td className="p-4 text-slate-500">{g.birim}</td>
                                                <td className="p-4 text-right">
                                                    <button onClick={() => kütüphaneSil(g.id)} className="text-slate-600 hover:text-rose-500 transition-colors p-2"><Trash2 size={14} /></button>
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