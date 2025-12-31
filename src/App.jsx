import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ArrowRight, ChefHat,
    List, Settings, LogOut, Circle, Save
} from 'lucide-react';

export default function App() {
    // --- STATE YÖNETİMİ ---
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    // Envanter (Stok) Form State
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");

    // Kütüphane (Tanımlama) Form State
    const [yeniGidaAd, setYeniGidaAd] = useState("");
    const [yeniGidaBirim, setYeniGidaBirim] = useState("Adet");
    const [yeniGidaSure, setYeniGidaSure] = useState("");

    useEffect(() => { verileriGetir(); }, []);

    const verileriGetir = async () => {
        setLoading(true);
        // 1. Kütüphane Verilerini Çek
        const { data: kutData } = await supabase.from('gida_kutuphanesi').select('*');
        if (kutData) {
            const obj = {};
            kutData.forEach(i => obj[i.ad] = i);
            setGidaVeritabani(obj);
        }
        // 2. Envanter Verilerini Çek
        const { data: envData } = await supabase.from('envanter').select('*').order('skt', { ascending: true });
        if (envData) setUrunler(envData);
        setLoading(false);
    };

    // --- ÜRÜN EKLEME (STOK) ---
    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return alert("Lütfen ürün ve tarih seçin!");
        const { error } = await supabase.from('envanter').insert([{
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey]?.birim || ''}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        }]);
        if (!error) { setSecilenUrunKey(""); setMiktar(""); verileriGetir(); }
    };

    // --- KÜTÜPHANE YÖNETİMİ (ÜRÜN TANIMLAMA) ---
    const kütüphaneyeEkle = async (e) => {
        e.preventDefault();
        if (!yeniGidaAd || !yeniGidaSure) return alert("İsim ve saklama süresi zorunludur!");
        const { error } = await supabase.from('gida_kutuphanesi').insert([{
            ad: yeniGidaAd,
            birim: yeniGidaBirim,
            varsayilan_omur: parseInt(yeniGidaSure)
        }]);
        if (!error) { setYeniGidaAd(""); setYeniGidaSure(""); verileriGetir(); }
        else { alert("Hata: " + error.message); }
    };

    const kütüphaneSil = async (id) => {
        if (window.confirm('Bu ürün tanımını silmek istediğinize emin misiniz?')) {
            await supabase.from('gida_kutuphanesi').delete().eq('id', id);
            verileriGetir();
        }
    };

    // Stok eklerken ürün seçilince tarihi otomatik öner
    const handleUrunSecimi = (ad) => {
        setSecilenUrunKey(ad);
        if (gidaVeritabani[ad]) {
            const bugun = new Date();
            bugun.setDate(bugun.getDate() + gidaVeritabani[ad].varsayilan_omur);
            setManuelTarih(bugun.toISOString().split('T')[0]);
        }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-slate-400 text-xs">Sistem Hazırlanıyor...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#0F172A] text-slate-300 font-sans overflow-hidden text-[13px]">

            {/* SIDEBAR */}
            <aside className="w-56 bg-[#1E293B] border-r border-slate-700/50 flex flex-col shrink-0">
                <div className="p-5 flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg"><ChefHat className="text-white w-4 h-4" /></div>
                    <h1 className="text-sm font-bold text-white tracking-tight">MutfakPro</h1>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition-colors ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <List size={16} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition-colors ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Settings size={16} /> Kütüphane
                    </button>
                </nav>
            </aside>

            {/* ANA PANEL */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-slate-700/50 bg-[#0F172A]">
                    <h2 className="font-bold text-white">{aktifSekme === 'liste' ? 'Mevcut Stoklar' : 'Ürün Kütüphanesi'}</h2>
                    <div className="relative w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input type="text" placeholder="Ara..." className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-[11px] text-white outline-none" onChange={(e) => setAramaTerimi(e.target.value)} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">

                    {aktifSekme === 'liste' ? (
                        /* ENVANTER (STOK) GÖRÜNÜMÜ */
                        <div className="flex flex-row gap-6 items-start">
                            <aside className="w-64 shrink-0 bg-[#1E293B] p-4 rounded-xl border border-slate-700/50">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Stok Girişi</h3>
                                <form onSubmit={urunEkle} className="space-y-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Ürün Tipi</label>
                                        <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={secilenUrunKey} onChange={e => handleUrunSecimi(e.target.value)}>
                                            <option value="">Seçin...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Miktar</label>
                                        <div className="flex gap-1">
                                            <input type="number" placeholder="1" className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                            <span className="p-2 bg-slate-800 rounded text-[10px] font-bold text-indigo-400">{gidaVeritabani[secilenUrunKey]?.birim || '-'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">SKT</label>
                                        <input type="date" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                    </div>
                                    <button className="w-full bg-indigo-600 py-2 rounded font-bold text-white text-xs mt-2 hover:bg-indigo-500 transition-colors">KAYDET</button>
                                </form>
                            </aside>

                            <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    return (
                                        <div key={u.id} className={`p-4 rounded-xl border ${kritik ? 'bg-rose-500/5 border-rose-500/20 shadow-sm' : 'bg-[#1E293B] border-slate-700/50'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="bg-slate-900 p-1.5 rounded text-indigo-400"><Thermometer size={14} /></div>
                                                <button onClick={async () => { if (window.confirm('Silinsin mi?')) { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); } }} className="text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
                                            </div>
                                            <h4 className="font-bold text-white truncate">{u.ad}</h4>
                                            <p className="text-[10px] text-slate-500 uppercase font-medium">{u.miktar} • {u.saklama_yeri}</p>
                                            <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase">Kalan</span>
                                                <span className={`font-black ${kritik ? 'text-rose-500 text-sm' : 'text-emerald-500 text-xs'}`}>{gun <= 0 ? 'BİTTİ' : `${gun} Gün`}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        </div>
                    ) : (
                        /* KÜTÜPHANE (ÜRÜN TANIMLAMA) GÖRÜNÜMÜ */
                        <div className="flex flex-row gap-6 items-start h-full max-w-5xl">
                            <aside className="w-64 shrink-0 bg-[#1E293B] p-5 rounded-xl border border-slate-700/50 shadow-sm">
                                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 opacity-70">Ürün Tanımla</h3>
                                <form onSubmit={kütüphaneyeEkle} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Gıda İsmi (Örn: Domates)</label>
                                        <input type="text" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGidaAd} onChange={e => setYeniGidaAd(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Saklama Süresi (Gün)</label>
                                        <input type="number" placeholder="Örn: 7" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGidaSure} onChange={e => setYeniGidaSure(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Birim</label>
                                        <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGidaBirim} onChange={e => setYeniGidaBirim(e.target.value)}>
                                            <option value="Adet">Adet</option>
                                            <option value="Kg">Kg</option>
                                            <option value="Litre">Litre</option>
                                            <option value="Paket">Paket</option>
                                        </select>
                                    </div>
                                    <button className="w-full bg-emerald-600 py-2.5 rounded font-bold text-white text-xs mt-2 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
                                        <Save size={14} /> TANIMLA
                                    </button>
                                </form>
                            </aside>

                            <section className="flex-1 bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse text-[11px]">
                                    <thead className="bg-slate-900/50 text-slate-500 uppercase tracking-widest border-b border-slate-700">
                                        <tr>
                                            <th className="p-3">Ürün Tipi</th>
                                            <th className="p-3">Ömür</th>
                                            <th className="p-3">Birim</th>
                                            <th className="p-3 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {Object.values(gidaVeritabani).filter(g => g.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(g => (
                                            <tr key={g.id} className="hover:bg-slate-800/40">
                                                <td className="p-3 font-bold text-white">{g.ad}</td>
                                                <td className="p-3 text-indigo-400 font-semibold">{g.varsayilan_omur} Gün</td>
                                                <td className="p-3 text-slate-500">{g.birim}</td>
                                                <td className="p-3 text-right">
                                                    <button onClick={() => kütüphaneSil(g.id)} className="text-slate-600 hover:text-rose-500 p-1"><Trash2 size={14} /></button>
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