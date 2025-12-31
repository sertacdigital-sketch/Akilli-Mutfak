import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    ChefHat, Search, ArrowRight, AlertTriangle
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
            console.error("Hata:", e);
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
        if (!yeniGida.ad) return alert("Gıda adı boş olamaz!");

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
            verileriGetir();
        }
    };

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
        await supabase.from('envanter').delete().eq('id', id);
        setUrunler(prev => prev.filter(u => u.id !== id));
    };

    const kutuphaneSil = async (ad) => {
        if (confirm(`${ad} kütüphaneden silinecek, emin misin?`)) {
            await supabase.from('gida_kutuphanesi').delete().eq('ad', ad);
            verileriGetir();
        }
    }

    const kalanGun = (t) => Math.ceil((new Date(t) - new Date().setHours(0, 0, 0, 0)) / 86400000);

    if (loading) return <div className="h-screen flex items-center justify-center font-bold">Yükleniyor...</div>;

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col font-sans">
            {/* HEADER */}
            <header className="w-full bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2 rounded-xl"><ChefHat className="text-white w-6 h-6" /></div>
                    <h1 className="text-xl font-black">MUTFAK PRO</h1>
                </div>
                <nav className="flex bg-slate-100 p-1 rounded-xl">
                    {['liste', 'ayarlar'].map((tab) => (
                        <button key={tab} onClick={() => setAktifSekme(tab)} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${aktifSekme === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
                            {tab === 'liste' ? 'ENVANTER' : 'KÜTÜPHANE'}
                        </button>
                    ))}
                </nav>
            </header>

            <main className="w-full flex-1 p-6">
                {aktifSekme === 'liste' ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* FORM */}
                        <aside className="w-full lg:w-[380px] bg-white rounded-[32px] p-8 shadow-xl border border-slate-100 h-fit">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Plus /> Ürün Ekle</h2>
                            <form onSubmit={urunEkle} className="space-y-4">
                                <select className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" value={secilenUrunKey} onChange={(e) => setSecilenUrunKey(e.target.value)}>
                                    <option value="">Gıda Seç...</option>
                                    {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                                <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
                                    {['dolap', 'buzluk', 'kiler'].map(t => (
                                        <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-2 rounded-xl text-[10px] font-black uppercase ${saklamaYeri === t ? 'bg-white text-indigo-600' : 'text-slate-400'}`}>{t}</button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Miktar" className="p-4 bg-slate-50 border rounded-2xl font-bold" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                    <input type="date" className="p-4 bg-indigo-50 border rounded-2xl font-bold text-xs" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                </div>
                                <button className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2">Ekle <ArrowRight size={18} /></button>
                            </form>
                        </aside>

                        {/* LISTE */}
                        <section className="flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black">Stok Durumu</h2>
                                <input type="text" placeholder="Ara..." className="p-3 bg-white border rounded-full text-sm font-semibold w-64 outline-none focus:ring-2 focus:ring-indigo-100" onChange={(e) => setAramaTerimi(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = kalanGun(u.skt);
                                    return (
                                        <div key={u.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative group">
                                            <button onClick={() => urunSil(u.id)} className="absolute top-4 right-4 p-2 text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                                            <div className="p-4 bg-indigo-50 w-fit rounded-2xl mb-4 text-indigo-600">
                                                {u.saklama_yeri === 'buzluk' ? <Snowflake /> : u.saklama_yeri === 'dolap' ? <Thermometer /> : <Sun />}
                                            </div>
                                            <h3 className="text-xl font-black">{u.ad}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase">{u.miktar} • {u.saklama_yeri}</p>
                                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                                <span className={`text-sm font-black ${gun <= 3 ? 'text-rose-600' : 'text-slate-700'}`}>{gun <= 0 ? 'SÜRESİ DOLDU' : `${gun} Gün Kaldı`}</span>
                                                {gun <= 3 && <AlertTriangle className="text-rose-500" size={18} />}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* KÜTÜPHANE EKLEME FORMU */}
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black mb-6">Kütüphaneye Yeni Gıda Tanımla</h2>
                            <form onSubmit={veritabaninaEkle} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <input placeholder="Gıda Adı" className="p-4 bg-slate-50 border rounded-2xl font-bold" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                <input placeholder="Birim (Adet/Kg)" className="p-4 bg-slate-50 border rounded-2xl font-bold" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })} />
                                <input type="number" placeholder="Dolap (Gün)" className="p-4 bg-blue-50 border rounded-2xl font-bold" value={yeniGida.dolap} onChange={e => setYeniGida({ ...yeniGida, dolap: e.target.value })} />
                                <input type="number" placeholder="Buzluk (Gün)" className="p-4 bg-cyan-50 border rounded-2xl font-bold" value={yeniGida.buzluk} onChange={e => setYeniGida({ ...yeniGida, buzluk: e.target.value })} />
                                <button type="submit" className="bg-indigo-600 text-white rounded-2xl font-black">KAYDET</button>
                            </form>
                        </div>
                        {/* TABLO */}
                        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Gıda</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase">Birim</th>
                                        <th className="p-6 text-[10px] font-black text-blue-600 uppercase">Dolap</th>
                                        <th className="p-6 text-[10px] font-black text-cyan-600 uppercase">Buzluk</th>
                                        <th className="p-6 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(gidaVeritabani).map(([key, val]) => (
                                        <tr key={key} className="border-t border-slate-50">
                                            <td className="p-6 font-bold">{key}</td>
                                            <td className="p-6 font-semibold text-slate-500">{val.birim}</td>
                                            <td className="p-6 font-black text-blue-600">{val.dolap || '-'}</td>
                                            <td className="p-6 font-black text-cyan-600">{val.buzluk || '-'}</td>
                                            <td className="p-6 text-right"><button onClick={() => kutuphaneSil(key)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button></td>
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