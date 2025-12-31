import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Layout from './components/Layout';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ArrowRight, AlertTriangle
} from 'lucide-react';

export default function App() {
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');

    // Form States
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

    useEffect(() => {
        if (secilenUrunKey && gidaVeritabani[secilenUrunKey]) {
            const gun = gidaVeritabani[secilenUrunKey][saklamaYeri];
            if (gun) {
                const d = new Date();
                d.setDate(d.getDate() + parseInt(gun));
                setManuelTarih(d.toISOString().split('T')[0]);
            }
        }
    }, [secilenUrunKey, saklamaYeri]);

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

    const kutuphaneEkle = async (e) => {
        e.preventDefault();
        if (!yeniGida.ad) return alert("Ad girin!");
        const { error } = await supabase.from('gida_kutuphanesi').insert([{
            ad: yeniGida.ad, birim: yeniGida.birim,
            dolap: yeniGida.dolap ? parseInt(yeniGida.dolap) : null,
            buzluk: yeniGida.buzluk ? parseInt(yeniGida.buzluk) : null,
            kiler: yeniGida.kiler ? parseInt(yeniGida.kiler) : null
        }]);
        if (!error) { setYeniGida({ ad: "", birim: "Adet", dolap: "", buzluk: "", kiler: "" }); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#0F172A] text-indigo-400 font-black italic">SİSTEM BAŞLATILIYOR...</div>;

    return (
        <Layout aktifSekme={aktifSekme} setAktifSekme={setAktifSekme}>
            {aktifSekme === 'liste' ? (
                <div className="flex flex-col 2xl:flex-row gap-12 items-start">
                    {/* ÜRÜN EKLEME FORMU */}
                    <aside className="w-full 2xl:w-[400px] shrink-0 space-y-6">
                        <div className="bg-slate-900/40 p-10 rounded-[45px] border border-slate-800 shadow-2xl backdrop-blur-sm">
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3"><Plus className="text-indigo-400" /> Hızlı Kayıt</h3>
                            <form onSubmit={urunEkle} className="space-y-6">
                                <select className="w-full p-5 bg-slate-900 border border-slate-700 rounded-3xl font-bold text-white outline-none focus:border-indigo-500 transition-all appearance-none" value={secilenUrunKey} onChange={e => setSecilenUrunKey(e.target.value)}>
                                    <option value="">Gıda Seçiniz...</option>
                                    {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                                <div className="grid grid-cols-3 gap-3 bg-slate-900 p-2 rounded-3xl border border-slate-800">
                                    {['dolap', 'buzluk', 'kiler'].map(t => (
                                        <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-400'}`}>{t}</button>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Miktar" className="p-5 bg-slate-900 border border-slate-700 rounded-3xl font-bold text-white outline-none" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                    <input type="date" className="p-5 bg-indigo-900/20 border border-indigo-500/30 rounded-3xl font-bold text-xs text-indigo-300 outline-none" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                </div>
                                <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 rounded-3xl font-black transition-all flex items-center justify-center gap-3">EKLE <ArrowRight /></button>
                            </form>
                        </div>
                    </aside>

                    {/* ENVANTER LİSTESİ */}
                    <section className="flex-1 w-full">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-3xl font-black text-white tracking-tighter">Stoktakiler <span className="text-slate-700 ml-2">({urunler.length})</span></h3>
                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input type="text" placeholder="Ürün ara..." className="pl-14 pr-6 py-4 bg-slate-800/40 border border-slate-700 rounded-full text-white font-bold outline-none w-80" onChange={e => setAramaTerimi(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                return (
                                    <div key={u.id} className={`p-8 rounded-[45px] border-2 bg-slate-800/20 transition-all hover:bg-slate-800/40 ${gun <= 3 ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-800'}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`p-4 rounded-2xl ${gun <= 3 ? 'bg-rose-500 text-white' : 'bg-slate-700 text-indigo-400'}`}>
                                                {u.saklama_yeri === 'buzluk' ? <Snowflake /> : u.saklama_yeri === 'dolap' ? <Thermometer /> : <Sun />}
                                            </div>
                                            <button onClick={async () => { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); }} className="text-slate-600 hover:text-rose-500"><Trash2 size={18} /></button>
                                        </div>
                                        <h4 className="text-2xl font-black text-white uppercase">{u.ad}</h4>
                                        <p className="text-xs font-black text-slate-500 mt-1 uppercase">{u.miktar} • {u.saklama_yeri}</p>
                                        <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-between items-center">
                                            <span className={`text-lg font-black ${gun <= 3 ? 'text-rose-500' : 'text-emerald-400'}`}>{gun <= 0 ? 'TÜKENDİ' : `${gun} GÜN`}</span>
                                            {gun <= 3 && <AlertTriangle className="text-rose-500 animate-pulse" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            ) : (
                /* KÜTÜPHANE SAYFASI */
                <div className="space-y-10">
                    <div className="bg-slate-900/40 p-10 rounded-[45px] border border-slate-800 shadow-2xl">
                        <h3 className="text-xl font-black text-white mb-8">Yeni Gıda Tanımla</h3>
                        <form onSubmit={kutuphaneEkle} className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            <input placeholder="Gıda Adı" className="p-5 bg-slate-900 border border-slate-700 rounded-3xl font-bold text-white outline-none" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                            <input placeholder="Birim" className="p-5 bg-slate-900 border border-slate-700 rounded-3xl font-bold text-white outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })} />
                            <input type="number" placeholder="Dolap" className="p-5 bg-blue-900/10 border border-blue-500/20 rounded-3xl font-bold text-blue-400 outline-none" value={yeniGida.dolap} onChange={e => setYeniGida({ ...yeniGida, dolap: e.target.value })} />
                            <input type="number" placeholder="Buzluk" className="p-5 bg-cyan-900/10 border border-cyan-500/20 rounded-3xl font-bold text-cyan-400 outline-none" value={yeniGida.buzluk} onChange={e => setYeniGida({ ...yeniGida, buzluk: e.target.value })} />
                            <button type="submit" className="bg-indigo-600 text-white rounded-3xl font-black">SİSTEME KAYDET</button>
                        </form>
                    </div>
                    <div className="bg-slate-900/20 rounded-[45px] border border-slate-800 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/50 text-slate-500 text-[10px] font-black uppercase">
                                    <th className="p-8">Gıda</th><th className="p-8 text-center">Birim</th><th className="p-8 text-center text-blue-400">Dolap</th><th className="p-8 text-center text-cyan-400">Buzluk</th><th className="p-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {Object.entries(gidaVeritabani).map(([k, v]) => (
                                    <tr key={k} className="hover:bg-slate-800/30 transition-all">
                                        <td className="p-8 font-black text-white text-xl uppercase">{k}</td>
                                        <td className="p-8 text-center font-bold text-slate-500">{v.birim}</td>
                                        <td className="p-8 text-center font-black text-blue-400">{v.dolap || '-'}</td>
                                        <td className="p-8 text-center font-black text-cyan-400">{v.buzluk || '-'}</td>
                                        <td className="p-8 text-right px-10"><button onClick={async () => { await supabase.from('gida_kutuphanesi').delete().eq('ad', k); verileriGetir(); }} className="text-slate-700 hover:text-rose-500"><Trash2 size={18} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Layout>
    );
}