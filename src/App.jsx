import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; // Yolun doğru olduğundan emin ol
import {
    Plus, Trash2, Calendar, AlertTriangle, CheckCircle,
    Utensils, Pencil, Save, X, Snowflake, Sun,
    Thermometer, ChefHat, BookOpen, Clock, Coffee,
    Soup, Salad, Carrot, ArrowRight, ChevronDown,
    Package, LayoutGrid, ListFilter, Settings, HardDrive
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
    const [duzenlemeId, setDuzenlemeId] = useState(null);
    const [veriDuzenlemeKey, setVeriDuzenlemeKey] = useState(null);

    // Form States
    const [editVeri, setEditVeri] = useState({ dolap: "", buzluk: "", kiler: "", birim: "" });
    const [yeniGidaAd, setYeniGidaAd] = useState("");
    const [yeniGidaBirim, setYeniGidaBirim] = useState("Adet");
    const [yeniGidaDolap, setYeniGidaDolap] = useState("");
    const [yeniGidaBuzluk, setYeniGidaBuzluk] = useState("");
    const [yeniGidaKiler, setYeniGidaKiler] = useState("");

    // --- VERİ ÇEKME (SUPABASE) ---
    useEffect(() => {
        verileriGetir();
    }, []);

    const verileriGetir = async () => {
        setLoading(true);
        // 1. Kütüphaneyi Çek (Settings tablosu)
        const { data: kutData } = await supabase.from('gida_kutuphanesi').select('*');
        if (kutData) {
            const kutObj = {};
            kutData.forEach(item => {
                kutObj[item.ad] = { ...item };
            });
            setGidaVeritabani(kutObj);
        }

        // 2. Envanteri Çek (Ana liste)
        const { data: envData } = await supabase.from('envanter').select('*').order('skt', { ascending: true });
        if (envData) setUrunler(envData);

        setLoading(false);
    };

    // --- OTOMATİK SKT HESAPLAMA ---
    useEffect(() => {
        if (secilenUrunKey && gidaVeritabani[secilenUrunKey]) {
            const gidaBilgi = gidaVeritabani[secilenUrunKey];
            const rafOmru = gidaBilgi[saklamaYeri];
            if (rafOmru) {
                const d = new Date();
                d.setDate(d.getDate() + parseInt(rafOmru));
                setManuelTarih(d.toISOString().split('T')[0]);
            } else {
                setManuelTarih("");
            }
        }
    }, [secilenUrunKey, saklamaYeri, gidaVeritabani]);

    // --- ACTIONS (SUPABASE) ---
    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return;

        const yeni = {
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey]?.birim || ''}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        };

        const { error } = await supabase.from('envanter').insert([yeni]);
        if (!error) verileriGetir();
        setSecilenUrunKey(""); setMiktar("");
    };

    const urunSil = async (id) => {
        const { error } = await supabase.from('envanter').delete().eq('id', id);
        if (!error) setUrunler(urunler.filter(u => u.id !== id));
    };

    const veritabaninaEkle = async (e) => {
        e.preventDefault();
        if (!yeniGidaAd) return;
        const yeniGida = {
            ad: yeniGidaAd,
            birim: yeniGidaBirim,
            dolap: yeniGidaDolap ? parseInt(yeniGidaDolap) : null,
            buzluk: yeniGidaBuzluk ? parseInt(yeniGidaBuzluk) : null,
            kiler: yeniGidaKiler ? parseInt(yeniGidaKiler) : null
        };
        const { error } = await supabase.from('gida_kutuphanesi').insert([yeniGida]);
        if (!error) verileriGetir();
        setYeniGidaAd(""); setYeniGidaDolap(""); setYeniGidaBuzluk(""); setYeniGidaKiler("");
    };

    const veriSil = async (ad) => {
        const { error } = await supabase.from('gida_kutuphanesi').delete().eq('ad', ad);
        if (!error) verileriGetir();
    };

    const kalanGun = (t) => Math.ceil((new Date(t) - new Date().setHours(0, 0, 0, 0)) / 86400000);

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-indigo-600">Yükleniyor...</div>;

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col overflow-x-hidden font-sans text-slate-900">
            <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); body, html, #root { margin: 0; padding: 0; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }` }} />

            {/* Header */}
            <header className="w-full bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-[60]">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100">
                        <ChefHat className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Mutfak Paneli</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">Bulut Senkronizasyonu Aktif</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Nav */}
            <div className="w-full px-8 mt-6">
                <nav className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                    {[
                        { id: 'liste', label: 'Envanter', icon: Package },
                        { id: 'plan', label: 'Tüketim Planı', icon: ListFilter },
                        { id: 'ayarlar', label: 'Raf Ömrü Ayarları', icon: Settings }
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setAktifSekme(tab.id)} className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${aktifSekme === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <main className="flex-1 w-full p-8 pt-6">
                {/* 1. SEKME: ENVANTER LİSTESİ */}
                {aktifSekme === 'liste' && (
                    <div className="flex flex-col xl:flex-row gap-10 w-full max-w-[1600px] mx-auto">
                        <div className="w-full xl:w-[400px] shrink-0">
                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 sticky top-32">
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Ürün Ekle</h2>
                                <form onSubmit={urunEkle} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase">Gıda Türü</label>
                                        <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-semibold outline-none" value={secilenUrunKey} onChange={(e) => setSecilenUrunKey(e.target.value)}>
                                            <option value="">Ürün Seç...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase">Saklama Alanı</label>
                                        <div className="flex p-1 bg-slate-50 rounded-2xl border">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="number" placeholder="Miktar" className="p-4 bg-slate-50 border rounded-2xl font-semibold" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                        <input type="date" className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl font-bold text-xs text-indigo-700" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                    </div>
                                    <button className="w-full bg-slate-900 text-white py-5 rounded-[20px] font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                                        <Plus size={20} /> Stoka Kaydet
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {urunler.map(u => {
                                const k = kalanGun(u.skt);
                                const isCritical = k <= 2;
                                return (
                                    <div key={u.id} className={`group bg-white p-6 rounded-[32px] border transition-all ${isCritical ? 'border-rose-100 shadow-xl shadow-rose-50' : 'border-slate-100'}`}>
                                        <div className="flex justify-between mb-6">
                                            <div className={`p-4 rounded-[22px] ${isCritical ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {u.saklama_yeri === 'buzluk' ? <Snowflake /> : u.saklama_yeri === 'dolap' ? <Thermometer /> : <Sun />}
                                            </div>
                                            <button onClick={() => urunSil(u.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all border border-slate-100">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <h3 className="font-extrabold text-slate-800 text-xl">{u.ad}</h3>
                                        <p className="text-sm font-bold text-slate-400 italic mt-1">{u.miktar}</p>
                                        <div className="mt-8 pt-5 border-t border-slate-50 flex justify-between items-center">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 block uppercase">Durum</span>
                                                <span className={`text-[13px] font-extrabold ${isCritical ? 'text-rose-500' : 'text-slate-700'}`}>
                                                    {k <= 0 ? 'SÜRESİ DOLDU' : `${k} Gün Kaldı`}
                                                </span>
                                            </div>
                                            {isCritical && <AlertTriangle className="text-rose-500" size={20} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. SEKME: AYARLAR (KÜTÜPHANE) */}
                {aktifSekme === 'ayarlar' && (
                    <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-10">
                        <div className="w-full lg:w-[400px] shrink-0">
                            <div className="bg-white p-8 rounded-[32px] border border-slate-100">
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Yeni Tanım</h2>
                                <form onSubmit={veritabaninaEkle} className="space-y-4">
                                    <input type="text" placeholder="Gıda Adı" className="w-full p-4 bg-slate-50 border rounded-2xl font-semibold" value={yeniGidaAd} onChange={e => setYeniGidaAd(e.target.value)} />
                                    <input type="text" placeholder="Birim (Adet, kg...)" className="w-full p-4 bg-slate-50 border rounded-2xl font-semibold" value={yeniGidaBirim} onChange={e => setYeniGidaBirim(e.target.value)} />
                                    <div className="grid grid-cols-3 gap-3">
                                        <input type="number" placeholder="Dolap" className="p-3 bg-slate-50 border rounded-xl font-bold text-center" value={yeniGidaDolap} onChange={e => setYeniGidaDolap(e.target.value)} />
                                        <input type="number" placeholder="Buzluk" className="p-3 bg-slate-50 border rounded-xl font-bold text-center" value={yeniGidaBuzluk} onChange={e => setYeniGidaBuzluk(e.target.value)} />
                                        <input type="number" placeholder="Kiler" className="p-3 bg-slate-50 border rounded-xl font-bold text-center" value={yeniGidaKiler} onChange={e => setYeniGidaKiler(e.target.value)} />
                                    </div>
                                    <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                                        Kütüphaneye Ekle
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="flex-1 bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-5">Gıda / Birim</th>
                                        <th className="p-5 text-center">Dolap</th>
                                        <th className="p-5 text-center">Buzluk</th>
                                        <th className="p-5 text-center">Kiler</th>
                                        <th className="p-5 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(gidaVeritabani).map(([key, val]) => (
                                        <tr key={key} className="border-b border-slate-50 hover:bg-slate-50/50">
                                            <td className="p-5">
                                                <p className="font-bold text-slate-700">{key}</p>
                                                <span className="text-[10px] text-slate-400 uppercase font-medium">{val.birim}</span>
                                            </td>
                                            <td className="p-5 text-center font-bold text-blue-600">{val.dolap || '-'} G</td>
                                            <td className="p-5 text-center font-bold text-cyan-600">{val.buzluk || '-'} G</td>
                                            <td className="p-5 text-center font-bold text-amber-600">{val.kiler || '-'} G</td>
                                            <td className="p-5 text-right">
                                                <button onClick={() => veriSil(key)} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={16} /></button>
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