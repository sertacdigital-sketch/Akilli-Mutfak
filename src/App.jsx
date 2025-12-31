import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Trash2, Snowflake, Thermometer, Sun,
    Search, ArrowRight, ChefHat,
    List, Settings, Save, Circle
} from 'lucide-react';

export default function App() {
    // --- ANA STATE ---
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
    const [yeniGida, setYeniGida] = useState({
        ad: "",
        birim: "Adet",
        dolap_omru: "",
        buzluk_omru: "",
        kiler_omru: ""
    });

    useEffect(() => { verileriGetir(); }, []);

    const verileriGetir = async () => {
        setLoading(true);
        try {
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
        } catch (error) {
            console.error("Veri çekme hatası:", error);
        }
        setLoading(false);
    };

    // --- AKILLI TARİH HESAPLAMA ---
    // Ürün veya Saklama Yeri değiştiğinde SKT'yi otomatik hesaplar
    useEffect(() => {
        if (secilenUrunKey && gidaVeritabani[secilenUrunKey]) {
            const gida = gidaVeritabani[secilenUrunKey];
            const omur = gida[`${saklamaYeri}_omru`] || 0; // örn: dolap_omru

            const bugun = new Date();
            bugun.setDate(bugun.getDate() + parseInt(omur));
            setManuelTarih(bugun.toISOString().split('T')[0]);
        }
    }, [secilenUrunKey, saklamaYeri, gidaVeritabani]);

    // --- ACTIONS (KAYIT İŞLEMLERİ) ---

    const urunEkle = async (e) => {
        e.preventDefault();
        if (!secilenUrunKey || !manuelTarih) return alert("Lütfen ürün ve tarih bilgilerini kontrol edin!");

        const birim = gidaVeritabani[secilenUrunKey]?.birim || '';
        const { error } = await supabase.from('envanter').insert([{
            ad: secilenUrunKey,
            miktar: `${miktar || 1} ${birim}`,
            saklama_yeri: saklamaYeri,
            skt: manuelTarih
        }]);

        if (!error) {
            setSecilenUrunKey("");
            setMiktar("");
            verileriGetir();
        } else {
            alert("Hata: " + error.message);
        }
    };

    const kütüphaneyeEkle = async (e) => {
        e.preventDefault();
        if (!yeniGida.ad) return alert("Gıda adı boş olamaz!");

        const { error } = await supabase.from('gida_kutuphanesi').insert([{
            ad: yeniGida.ad,
            birim: yeniGida.birim,
            dolap_omru: yeniGida.dolap_omru ? parseInt(yeniGida.dolap_omru) : 0,
            buzluk_omru: yeniGida.buzluk_omru ? parseInt(yeniGida.buzluk_omru) : 0,
            kiler_omru: yeniGida.kiler_omru ? parseInt(yeniGida.kiler_omru) : 0
        }]);

        if (!error) {
            setYeniGida({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" });
            verileriGetir();
        } else {
            alert("Hata: " + error.message);
        }
    };

    if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-[#0F172A] text-slate-400 text-xs tracking-widest">SİSTEM YÜKLENİYOR...</div>;

    return (
        <div className="flex h-screen w-screen bg-[#0F172A] text-slate-300 font-sans overflow-hidden text-[13px]">

            {/* SIDEBAR */}
            <aside className="w-56 bg-[#1E293B] border-r border-slate-700/50 flex flex-col shrink-0">
                <div className="p-5 flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20"><ChefHat className="text-white w-4 h-4" /></div>
                    <h1 className="text-sm font-black text-white tracking-tighter uppercase">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                </div>
                <nav className="flex-1 px-3 mt-4 space-y-1">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                        <List size={16} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                        <Settings size={16} /> Kütüphane
                    </button>
                </nav>
            </aside>

            {/* ANA PANEL */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 flex items-center justify-between px-8 shrink-0 border-b border-slate-700/50 bg-[#0F172A]">
                    <h2 className="font-bold text-white uppercase tracking-tight">{aktifSekme === 'liste' ? 'Mevcut Stoklar' : 'Ürün Tanımları'}</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Ara..."
                            className="w-full pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-[11px] text-white outline-none focus:border-indigo-500 transition-all"
                            onChange={(e) => setAramaTerimi(e.target.value)}
                        />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {aktifSekme === 'liste' ? (
                        /* STOK LİSTESİ VE FORM */
                        <div className="flex flex-row gap-8 items-start">
                            <aside className="w-72 shrink-0 bg-[#1E293B] p-5 rounded-xl border border-slate-700/50 shadow-sm">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Yeni Stok Girişi</h3>
                                <form onSubmit={urunEkle} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Ürün</label>
                                        <select className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none focus:border-indigo-500" value={secilenUrunKey} onChange={e => setSecilenUrunKey(e.target.value)}>
                                            <option value="">Seçin...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Konum</label>
                                        <div className="flex gap-1 bg-slate-900 p-1 rounded border border-slate-700">
                                            {['dolap', 'buzluk', 'kiler'].map(t => (
                                                <button key={t} type="button" onClick={() => setSaklamaYeri(t)} className={`flex-1 py-1.5 rounded text-[9px] font-black uppercase transition-all ${saklamaYeri === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>{t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">Miktar</label>
                                            <input type="number" placeholder="1" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none" value={miktar} onChange={e => setMiktar(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold block mb-1 uppercase">SKT (Otomatik)</label>
                                            <input type="date" className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-[10px] text-white outline-none font-bold" value={manuelTarih} onChange={e => setManuelTarih(e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-indigo-600 py-2.5 rounded font-black text-white text-[11px] mt-2 hover:bg-indigo-500 transition-all uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                                        STOKA EKLE <Plus size={14} />
                                    </button>
                                </form>
                            </aside>

                            <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {urunler.filter(u => u.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const gun = Math.ceil((new Date(u.skt) - new Date().setHours(0, 0, 0, 0)) / 86400000);
                                    const kritik = gun <= 3;
                                    return (
                                        <div key={u.id} className={`p-4 rounded-xl border transition-all ${kritik ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[#1E293B] border-slate-700/50'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`p-1.5 rounded ${u.saklama_yeri === 'buzluk' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                                    {u.saklama_yeri === 'buzluk' ? <Snowflake size={14} /> : <Thermometer size={14} />}
                                                </div>
                                                <button onClick={async () => { if (window.confirm('Silinsin mi?')) { await supabase.from('envanter').delete().eq('id', u.id); verileriGetir(); } }} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                            <h4 className="font-bold text-white uppercase tracking-tight">{u.ad}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{u.miktar} • {u.saklama_yeri}</p>
                                            <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                                                <span className="text-[10px] text-slate-500 font-bold">DURUM</span>
                                                <span className={`font-black text-xs ${gun <= 0 ? 'text-rose-600 animate-pulse' : kritik ? 'text-rose-400' : 'text-emerald-500'}`}>
                                                    {gun <= 0 ? 'SÜRESİ DOLDU' : `${gun} GÜN KALDI`}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        </div>
                    ) : (
                        /* KÜTÜPHANE YÖNETİMİ */
                        <div className="flex flex-row gap-8 items-start max-w-6xl">
                            <aside className="w-80 shrink-0 bg-[#1E293B] p-6 rounded-xl border border-slate-700/50">
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 opacity-50">Yeni Ürün Tanımı</h3>
                                <form onSubmit={kütüphaneyeEkle} className="space-y-4">
                                    <input type="text" placeholder="Gıda Adı (Örn: Süt)" className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none focus:border-indigo-500" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    <select className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none" value={yeniGida.birim} onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}>
                                        <option value="Adet">Adet</option><option value="Kg">Kg</option><option value="Litre">Litre</option><option value="Paket">Paket</option>
                                    </select>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Thermometer size={12} className="text-indigo-400" />
                                            <input type="number" placeholder="Dolap (Gün)" className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none" value={yeniGida.dolap_omru} onChange={e => setYeniGida({ ...yeniGida, dolap_omru: e.target.value })} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Snowflake size={12} className="text-blue-400" />
                                            <input type="number" placeholder="Buzluk (Gün)" className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none" value={yeniGida.buzluk_omru} onChange={e => setYeniGida({ ...yeniGida, buzluk_omru: e.target.value })} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sun size={12} className="text-orange-400" />
                                            <input type="number" placeholder="Kiler (Gün)" className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none" value={yeniGida.kiler_omru} onChange={e => setYeniGida({ ...yeniGida, kiler_omru: e.target.value })} />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-600 py-2.5 rounded font-black text-white text-[11px] flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all uppercase tracking-widest mt-2 shadow-lg shadow-emerald-600/10">
                                        <Save size={14} /> TANIMI KAYDET
                                    </button>
                                </form>
                            </aside>

                            <section className="flex-1 bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-hidden shadow-sm">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-900 text-slate-500 uppercase font-black border-b border-slate-700">
                                        <tr>
                                            <th className="p-4">Ürün & Birim</th>
                                            <th className="p-4"><Thermometer size={14} className="inline mr-1" /> Dolap</th>
                                            <th className="p-4"><Snowflake size={14} className="inline mr-1" /> Buzluk</th>
                                            <th className="p-4"><Sun size={14} className="inline mr-1" /> Kiler</th>
                                            <th className="p-4 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {Object.values(gidaVeritabani).map(g => (
                                            <tr key={g.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="p-4 font-bold text-white uppercase tracking-tight">{g.ad} <span className="text-slate-500 font-normal">({g.birim})</span></td>
                                                <td className="p-4 text-indigo-400 font-bold">{g.dolap_omru || 0} GÜN</td>
                                                <td className="p-4 text-blue-400 font-bold">{g.buzluk_omru || 0} GÜN</td>
                                                <td className="p-4 text-orange-400 font-bold">{g.kiler_omru || 0} GÜN</td>
                                                <td className="p-4 text-right">
                                                    <button onClick={async () => { if (window.confirm('Bu tanım silinsin mi?')) { await supabase.from('gida_kutuphanesi').delete().eq('id', g.id); verileriGetir(); } }} className="text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
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