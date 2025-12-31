
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient'; // Yolunu kontrol et
import {
    Plus, Trash2, Calendar, AlertTriangle, CheckCircle,
    Pencil, Save, X, Snowflake, Sun,
    Thermometer, ChefHat, Package, ListFilter, Settings, ChevronDown
} from 'lucide-react';

export default function App() {
    // Veritabanı States
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [urunler, setUrunler] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [secilenUrunKey, setSecilenUrunKey] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktar, setMiktar] = useState("");
    const [manuelTarih, setManuelTarih] = useState("");
    const [aktifSekme, setAktifSekme] = useState('liste');

    // Kütüphane Ekleme States
    const [yeniGida, setYeniGida] = useState({ ad: "", birim: "Adet", dolap: "", buzluk: "", kiler: "" });

    // --- VERİ ÇEKME ---
    const verileriGetir = async () => {
        setLoading(true);
        try {
            // Kütüphaneyi Çek
            const { data: kutuphaneData } = await supabase.from('gida_kutuphanesi').select('*');
            const dbObj = {};
            kutuphaneData?.forEach(item => {
                dbObj[item.ad] = item;
            });
            setGidaVeritabani(dbObj);

            // Envanteri Çek
            const { data: envanterData } = await supabase
                .from('mutfak_envanteri')
                .select('*')
                .order('skt', { ascending: true });
            setUrunler(envanterData || []);
        } catch (error) {
            console.error("Yükleme hatası:", error);
        }
        setLoading(false);
    };

    useEffect(() => { verileriGetir(); }, []);

    // --- OTOMATİK SKT HESAPLAMA ---
    useEffect(() => {
        if (secilenUrunKey && gidaVeritabani[secilenUrunKey]) {
            const gida = gidaVeritabani[secilenUrunKey];
            const gunEkle = saklamaYeri === 'dolap' ? gida.dolap_omru :
                saklamaYeri === 'buzluk' ? gida.buzluk_omru : gida.kiler_omru;

            if (gunEkle) {
                const d = new Date();
                d.setDate(d.getDate() + parseInt(gunEkle));
                setManuelTarih(d.toISOString().split('T')[0]);
            }
        }
    }, [secilenUrunKey, saklamaYeri]);

    // --- ENVANTER İŞLEMLERİ ---
    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return;

        const { data, error } = await supabase.from('mutfak_envanteri').insert([{
            gida_ad: secilenUrunKey,
            miktar: `${miktar || 1} ${gidaVeritabani[secilenUrunKey].birim}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        }]).select();

        if (!error) {
            setUrunler([...urunler, data[0]]);
            setSecilenUrunKey(""); setMiktar("");
        }
    };

    const urunSil = async (id) => {
        const { error } = await supabase.from('mutfak_envanteri').delete().eq('id', id);
        if (!error) setUrunler(urunler.filter(u => u.id !== id));
    };

    // --- KÜTÜPHANE İŞLEMLERİ ---
    const kütüphaneyeEkle = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('gida_kutuphanesi').insert([{
            ad: yeniGida.ad,
            birim: yeniGida.birim,
            dolap_omru: yeniGida.dolap || null,
            buzluk_omru: yeniGida.buzluk || null,
            kiler_omru: yeniGida.kiler || null
        }]);

        if (!error) {
            verileriGetir();
            setYeniGida({ ad: "", birim: "Adet", dolap: "", buzluk: "", kiler: "" });
        }
    };

    const kalanGun = (t) => Math.ceil((new Date(t) - new Date().setHours(0, 0, 0, 0)) / 86400000);

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-indigo-600">Sistem Yükleniyor...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-2.5 rounded-2xl">
                        <ChefHat className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">Mutfak Paneli v2</h1>
                </div>
                <nav className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button onClick={() => setAktifSekme('liste')} className={`px-4 py-2 rounded-lg text-sm font-bold ${aktifSekme === 'liste' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Envanter</button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`px-4 py-2 rounded-lg text-sm font-bold ${aktifSekme === 'ayarlar' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Kütüphane</button>
                </nav>
            </header>

            <main className="p-8">
                {aktifSekme === 'liste' && (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sol Form */}
                        <div className="w-full lg:w-80 shrink-0">
                            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                                <h2 className="text-lg font-bold mb-4">Stok Ekle</h2>
                                <form onSubmit={urunEkle} className="space-y-4">
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                                        value={secilenUrunKey}
                                        onChange={(e) => setSecilenUrunKey(e.target.value)}
                                    >
                                        <option value="">Ürün Seç...</option>
                                        {Object.keys(gidaVeritabani).map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>

                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        {['dolap', 'buzluk', 'kiler'].map(t => (
                                            <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${saklamaYeri === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{t}</button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" placeholder="Miktar" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                        <input type="date" className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-bold" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                    </div>

                                    <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                        <Plus size={18} /> Kaydet
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Sağ Liste */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {urunler.map(u => {
                                const gun = kalanGun(u.skt);
                                return (
                                    <div key={u.id} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all relative group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`p-3 rounded-xl ${gun <= 3 ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                                                {u.saklama_yeri === 'buzluk' ? <Snowflake size={20} /> : <Thermometer size={20} />}
                                            </div>
                                            <button onClick={() => urunSil(u.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-slate-800">{u.gida_ad}</h3>
                                        <p className="text-xs text-slate-400 font-medium">{u.miktar} • {u.saklama_yeri}</p>
                                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                            <span className={`text-xs font-bold ${gun <= 3 ? 'text-rose-500' : 'text-slate-600'}`}>
                                                {gun <= 0 ? "SÜRESİ DOLDU" : `${gun} Gün Kaldı`}
                                            </span>
                                            {gun <= 3 && <AlertTriangle size={14} className="text-rose-500" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {aktifSekme === 'ayarlar' && (
                    <div className="max-w-4xl mx-auto bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                            <h2 className="font-bold">Kütüphane Yönetimi</h2>
                        </div>
                        <form onSubmit={kütüphaneyeEkle} className="p-6 grid grid-cols-1 md:grid-cols-5 gap-3 border-b border-slate-50">
                            <input placeholder="Gıda Adı" className="md:col-span-2 p-3 border rounded-xl" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                            <input placeholder="Dolap (Gün)" type="number" className="p-3 border rounded-xl" value={yeniGida.dolap} onChange={e => setYeniGida({ ...yeniGida, dolap: e.target.value })} />
                            <input placeholder="Buzluk (Gün)" type="number" className="p-3 border rounded-xl" value={yeniGida.buzluk} onChange={e => setYeniGida({ ...yeniGida, buzluk: e.target.value })} />
                            <button className="bg-slate-900 text-white rounded-xl font-bold"><Plus size={20} className="mx-auto" /></button>
                        </form>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black">
                                <tr>
                                    <th className="p-4">Gıda</th>
                                    <th className="p-4 text-center">Dolap</th>
                                    <th className="p-4 text-center">Buzluk</th>
                                    <th className="p-4 text-center">Kiler</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(gidaVeritabani).map(g => (
                                    <tr key={g.id} className="border-b border-slate-50 text-sm">
                                        <td className="p-4 font-bold text-slate-700">{g.ad} <span className="text-[10px] text-slate-400 font-normal">({g.birim})</span></td>
                                        <td className="p-4 text-center text-blue-600 font-bold">{g.dolap_omru || '-'}</td>
                                        <td className="p-4 text-center text-cyan-600 font-bold">{g.buzluk_omru || '-'}</td>
                                        <td className="p-4 text-center text-amber-600 font-bold">{g.kiler_omru || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}