import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Layout from './Layout'; // Layout'u import ettiğinden emin ol
import {
    Plus, Trash2, Snowflake, Thermometer, Sun, Save
} from 'lucide-react';

export default function App() {
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [envanter, setEnvanter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    // Form State'leri
    const [secilenGidaAd, setSecilenGidaAd] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktarDegeri, setMiktarDegeri] = useState("");
    const [sktTarihi, setSktTarihi] = useState("");
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
        const { data: envData } = await supabase.from('mutfak_envanteri').select('*').order('skt', { ascending: true });
        if (envData) setEnvanter(envData);
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
        const birim = gidaVeritabani[secilenGidaAd]?.birim || '';
        const { error } = await supabase.from('mutfak_envanteri').insert([{
            gida_ad: secilenGidaAd, miktar: `${miktarDegeri || 1} ${birim}`, saklama_yeri: saklamaYeri, skt: sktTarihi
        }]);
        if (!error) { setSecilenGidaAd(""); setMiktarDegeri(""); verileriGetir(); }
    };

    const kütüphaneEkle = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('gida_kutuphanesi').insert([yeniGida]);
        if (!error) { setYeniGida({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" }); verileriGetir(); }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-slate-500">YÜKLENİYOR...</div>;

    return (
        <Layout aktifSekme={aktifSekme} setAktifSekme={setAktifSekme}>
            {aktifSekme === 'liste' ? (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* ENVANTER FORMU */}
                    <aside className="w-full lg:w-80 shrink-0 bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Stok Girişi</h3>
                        <form onSubmit={envanterEkle} className="space-y-4">
                            {/* Form içerikleri aynı kalsın... */}
                            <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={secilenGidaAd} onChange={e => setSecilenGidaAd(e.target.value)}>
                                <option value="">Seçin...</option>
                                {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                            <div className="flex gap-1 bg-slate-900 p-1 rounded border border-slate-700">
                                {['dolap', 'buzluk', 'kiler'].map(t => (
                                    <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase ${saklamaYeri === t ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{t}</button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" placeholder="Miktar" className="p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={miktarDegeri} onChange={e => setMiktarDegeri(e.target.value)} />
                                <input type="date" className="p-2 bg-slate-900 border border-slate-700 rounded text-[10px] text-white" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                            </div>
                            <button className="w-full bg-indigo-600 py-3 rounded-xl font-black text-white text-xs mt-2 uppercase">EKLE</button>
                        </form>
                    </aside>

                    {/* ENVANTER KARTLARI */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {envanter.map(u => {
                            const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                            return (
                                <div key={u.id} className="p-4 rounded-xl bg-slate-800/40 border border-white/5 shadow-sm">
                                    <div className="flex justify-between mb-3">
                                        <span className="p-1.5 bg-slate-900 rounded-lg text-indigo-400">
                                            {u.saklama_yeri === 'buzluk' ? <Snowflake size={14} /> : <Thermometer size={14} />}
                                        </span>
                                        <button onClick={() => supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir)} className="text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
                                    </div>
                                    <h4 className="font-bold text-white uppercase truncate">{u.gida_ad}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold">{u.miktar} • {u.saklama_yeri}</p>
                                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-end">
                                        <span className="text-[10px] text-slate-400 font-mono">{new Date(u.skt).toLocaleDateString('tr-TR')}</span>
                                        <span className={`font-black text-xs ${gun <= 3 ? 'text-rose-500' : 'text-emerald-500'}`}>{gun} GÜN</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* KÜTÜPHANE SAYFASI */
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Kütüphane formu ve tablosu buraya gelecek (Yukarıdaki mantıklaaside ve div içinde) */}
                    <aside className="w-full lg:w-80 shrink-0 bg-slate-800/40 p-6 rounded-2xl border border-white/5">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Yeni Tanım</h3>
                        <form onSubmit={kütüphaneEkle} className="space-y-3">
                            <input type="text" placeholder="Gıda Adı" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                            <input type="number" placeholder="Dolap Ömrü" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGida.dolap_omru} onChange={e => setYeniGida({ ...yeniGida, dolap_omru: e.target.value })} />
                            <input type="number" placeholder="Buzluk Ömrü" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGida.buzluk_omru} onChange={e => setYeniGida({ ...yeniGida, buzluk_omru: e.target.value })} />
                            <input type="number" placeholder="Kiler Ömrü" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white" value={yeniGida.kiler_omru} onChange={e => setYeniGida({ ...yeniGida, kiler_omru: e.target.value })} />
                            <button className="w-full bg-emerald-600 py-3 rounded-xl font-black text-white text-xs uppercase"><Save size={14} className="inline mr-2" /> Kaydet</button>
                        </form>
                    </aside>
                    <div className="flex-1 bg-slate-800/40 rounded-2xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900/50 text-slate-500 uppercase font-black">
                                <tr>
                                    <th className="p-4">Gıda</th>
                                    <th className="p-4">Dolap</th>
                                    <th className="p-4">Buzluk</th>
                                    <th className="p-4">Kiler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {Object.values(gidaVeritabani).map(g => (
                                    <tr key={g.id} className="text-white">
                                        <td className="p-4 font-bold">{g.ad}</td>
                                        <td className="p-4">{g.dolap_omru} G</td>
                                        <td className="p-4">{g.buzluk_omru} G</td>
                                        <td className="p-4">{g.kiler_omru} G</td>
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