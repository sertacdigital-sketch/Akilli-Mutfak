import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ArrowRight, ChefHat,
    List, Settings, Save
} from 'lucide-react';

export default function App() {
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    // Envanter State
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");

    // Kütüphane State (Senin tablonun sütunlarına göre)
    const [yeniGida, setYeniGida] = useState({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" });

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

    // --- AKILLI TARİH HESAPLAMA ---
    // Ürün veya Saklama Yeri değiştiğinde SKT'yi otomatik güncelle
    useEffect(() => {
        if (secilenUrunKey && gidaVeritabani[secilenUrunKey]) {
            const gida = gidaVeritabani[secilenUrunKey];
            // Seçilen yere göre ömrü belirle (dolap_omru, buzluk_omru, kiler_omru)
            const omur = gida[`${saklamaYeri}_omru`] || 0;

            const bugun = new Date();
            bugun.setDate(bugun.getDate() + parseInt(omur));
            setManuelTarih(bugun.toISOString().split('T')[0]);
        }
    }, [secilenUrunKey, saklamaYeri, gidaVeritabani]);

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
        const { error } = await supabase.from('gida_kutuphanesi').insert([yeniGida]);
        if (!error) {
            setYeniGida({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" });
            verileriGetir();
        } else { alert("Hata: " + error.message); }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-slate-400 text-xs">Yükleniyor...</div>;

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

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-slate-700/50">
                    <h2 className="font-bold text-white">{aktifSekme === 'liste' ? 'Stoklar' : 'Ürün Kütüphanesi'}</h2>
                    <div className="relative w-60">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input type="text" placeholder="Ara..." className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-xs text-white outline-none" onChange={(e) => setAramaTerimi(e.target.value)} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {aktifSekme === 'liste' ? (
                        <div className="flex flex-row gap-6 items-start">
                            {/* STOK EKLEME FORMU */}
                            <aside className="w-64 shrink-0 bg-[#1E293B] p-4 rounded-xl border border-slate-700/50">
                                <form onSubmit={urunEkle} className="space-y-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Ürün</label>
                                        <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={secilenUrunKey} onChange={e => setSecilenUrunKey(e.target.value)}>
                                            <option value="">Seçin...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Saklama Yeri</label>
                                        <div className="flex gap-1 bg-slate-900 p-1 rounded border border-slate-700">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`flex-1 py-1 rounded text-[9px] font-bold uppercase ${saklamaYeri === t ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-slate-400 block mb-1">Miktar</label>
                                            <input type="number" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 block mb-1">SKT</label>
                                            <input type="date" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-[10px] text-white" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                        </div>
                                    </div>
                                    <button className="w-full bg-indigo-600 py-2 rounded font-bold text-white text-xs mt-2">EKLE</button>
                                </form>
                            </aside>

                            {/* STOK LİSTESİ */}
                            <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    return (
                                        <div key={u.id} className="p-4 rounded-xl bg-[#1E293B] border border-slate-700/50">
                                            <div className="flex justify-between mb-2">
                                                <div className="text-indigo-400">{u.saklama_yeri === 'buzluk' ? <Snowflake size={14} /> : <Thermometer size={14} />}</div>
                                                <button onClick={async () => { if (window.confirm('Silinsin mi?')) { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); } }} className="text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
                                            </div>
                                            <h4 className="font-bold text-white uppercase">{u.ad}</h4>
                                            <p className="text-[10px] text-slate-500">{u.miktar} • {u.saklama_yeri}</p>
                                            <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                                                <span className={`font-black ${gun <= 3 ? 'text-rose-500' : 'text-emerald-500'}`}>{gun <= 0 ? 'BİTTİ' : `${gun} GÜN`}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        </div>
                    ) : (
                        /* KÜTÜPHANE YÖNETİMİ (SENİN TABLONA GÖRE) */
                        <div className="flex flex-row gap-6 items-start h-full">
                            <aside className="w-72 shrink-0 bg-[#1E293B] p-5 rounded-xl border border-slate-700/50 shadow-sm">
                                <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-4 opacity-70">Ürün Tanımla</h3>
                                <form onSubmit={kütüphaneyeEkle} className="space-y-3">
                                    <input type="text" placeholder="Gıda Adı" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}>
                                        <option value="Adet">Adet</option><option value="Kg">Kg</option><option value="Litre">Litre</option>
                                    </select>
                                    <div className="grid grid-cols-1 gap-2">
                                        <input type="number" placeholder="Dolap Ömrü (Gün)" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGida.dolap_omru} onChange={e => setYeniGida({ ...yeniGida, dolap_omru: e.target.value })} />
                                        <input type="number" placeholder="Buzluk Ömrü (Gün)" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGida.buzluk_omru} onChange={e => setYeniGida({ ...yeniGida, buzluk_omru: e.target.value })} />
                                        <input type="number" placeholder="Kiler Ömrü (Gün)" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGida.kiler_omru} onChange={e => setYeniGida({ ...yeniGida, kiler_omru: e.target.value })} />
                                    </div>
                                    <button className="w-full bg-emerald-600 py-2 rounded font-bold text-white text-xs flex items-center justify-center gap-2 mt-2"><Save size={14} /> TANIMLA</button>
                                </form>
                            </aside>

                            <section className="flex-1 bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-900/50 text-slate-500 uppercase border-b border-slate-700">
                                        <tr>
                                            <th className="p-3">Gıda</th>
                                            <th className="p-3">Dolap</th>
                                            <th className="p-3">Buzluk</th>
                                            <th className="p-3">Kiler</th>
                                            <th className="p-3 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {Object.values(gidaVeritabani).map(g => (
                                            <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="p-3 font-bold text-white">{g.ad} ({g.birim})</td>
                                                <td className="p-3 text-indigo-400">{g.dolap_omru} G</td>
                                                <td className="p-3 text-blue-400">{g.buzluk_omru} G</td>
                                                <td className="p-3 text-orange-400">{g.kiler_omru} G</td>
                                                <td className="p-3 text-right">
                                                    <button onClick={async () => { if (window.confirm('Silinsin mi?')) { await supabase.from('gida_kutuphanesi').delete().eq('id', g.id); verileriGetir(); } }} className="text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
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