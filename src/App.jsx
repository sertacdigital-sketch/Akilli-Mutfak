import React, { useState, useEffect } from 'react';
import {
    Plus, Trash2, Calendar, ChefHat,
    Snowflake, Sun, Thermometer, Save,
    Package, Database, Search, AlertCircle
} from 'lucide-react';

/**
 * NOT: Ortam kısıtlamaları nedeniyle paket çözünürlüğü hatalarını önlemek adına 
 * Supabase istemcisini CDN üzerinden dinamik olarak yüklüyoruz.
 */

export default function App() {
    const [supabase, setSupabase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [kutuphane, setKutuphane] = useState([]);
    const [envanter, setEnvanter] = useState([]);
    const [sekme, setSekme] = useState('envanter');

    // Yapılandırma - Bu değerlerin boş olması durumunda kullanıcıya uyarı gösterilir
    const SUPABASE_URL = "";
    const SUPABASE_KEY = "";

    // Form State'leri
    const [secilenGida, setSecilenGida] = useState("");
    const [miktar, setMiktar] = useState("");
    const [konum, setKonum] = useState("dolap");
    const [yeniGida, setYeniGida] = useState({ ad: '', birim: 'Adet', dolap: '', buzluk: '', kiler: '' });

    useEffect(() => {
        // Supabase SDK'sını CDN üzerinden yükle
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.async = true;
        script.onload = () => {
            if (window.supabase && SUPABASE_URL && SUPABASE_KEY) {
                const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                setSupabase(client);
            } else {
                setLoading(false);
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (supabase) {
            verileriGetir();
        }
    }, [supabase]);

    async function verileriGetir() {
        setLoading(true);
        try {
            const [libRes, invRes] = await Promise.all([
                supabase.from('gida_kutuphanesi').select('*').order('ad'),
                supabase.from('mutfak_envanteri').select('*').order('skt')
            ]);

            if (libRes.data) setKutuphane(libRes.data);
            if (invRes.data) setEnvanter(invRes.data);
        } catch (err) {
            console.error("Veri çekme hatası:", err);
        } finally {
            setLoading(false);
        }
    }

    async function stokEkle(e) {
        e.preventDefault();
        if (!supabase) return;

        const gida = kutuphane.find(item => item.ad === secilenGida);
        if (!gida) return;

        const omur = konum === 'dolap' ? gida.dolap_omru : (konum === 'buzluk' ? gida.buzluk_omru : gida.kiler_omru);
        const sktTarihi = new Date();
        sktTarihi.setDate(sktTarihi.getDate() + (parseInt(omur) || 7));

        const { error } = await supabase.from('mutfak_envanteri').insert([{
            gida_ad: secilenGida,
            miktar: `${miktar} ${gida.birim}`,
            saklama_yeri: konum,
            skt: sktTarihi.toISOString().split('T')[0]
        }]);

        if (!error) {
            setMiktar("");
            setSecilenGida("");
            verileriGetir();
        }
    }

    async function rehberEkle(e) {
        e.preventDefault();
        if (!supabase) return;

        const { error } = await supabase.from('gida_kutuphanesi').insert([{
            ad: yeniGida.ad,
            birim: yeniGida.birim,
            dolap_omru: parseInt(yeniGida.dolap) || 0,
            buzluk_omru: parseInt(yeniGida.buzluk) || 0,
            kiler_omru: parseInt(yeniGida.kiler) || 0
        }]);

        if (!error) {
            setYeniGida({ ad: '', birim: 'Adet', dolap: '', buzluk: '', kiler: '' });
            verileriGetir();
        }
    }

    async function urunSil(id) {
        if (!supabase) return;
        const { error } = await supabase.from('mutfak_envanteri').delete().eq('id', id);
        if (!error) verileriGetir();
    }

    const gunFarki = (tarih) => {
        const fark = new Date(tarih) - new Date().setHours(0, 0, 0, 0);
        return Math.ceil(fark / (1000 * 60 * 60 * 24));
    };

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <div className="bg-white p-8 rounded-[32px] border border-rose-100 shadow-xl max-w-md text-center">
                    <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-slate-800 mb-2">Kurulum Gerekli</h2>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        Lütfen kodun başındaki <strong>SUPABASE_URL</strong> ve <strong>SUPABASE_KEY</strong> değişkenlerini kendi Supabase bilgilerinizle güncelleyin.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Database className="w-10 h-10 text-indigo-600 animate-pulse" />
                <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Mutfak Yükleniyor...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans">
            <nav className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100">
                            <ChefHat size={20} />
                        </div>
                        <span className="font-black text-xl tracking-tight">Mutfak<span className="text-indigo-600">Base</span></span>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setSekme('envanter')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sekme === 'envanter' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            MUTFAĞIM
                        </button>
                        <button
                            onClick={() => setSekme('rehber')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${sekme === 'rehber' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            GIDA REHBERİ
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 md:p-10">
                {sekme === 'envanter' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-24">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Plus size={18} className="text-indigo-600" /> Ürün Ekle
                                </h2>
                                <form onSubmit={stokEkle} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Gıda Adı</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                                            value={secilenGida}
                                            onChange={e => setSecilenGida(e.target.value)}
                                            required
                                        >
                                            <option value="">Seçiniz...</option>
                                            {kutuphane.map(g => <option key={g.id} value={g.ad}>{g.ad}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Miktar</label>
                                            <input
                                                type="number"
                                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none"
                                                value={miktar}
                                                onChange={e => setMiktar(e.target.value)}
                                                required
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Konum</label>
                                            <select
                                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold outline-none"
                                                value={konum}
                                                onChange={e => setKonum(e.target.value)}
                                            >
                                                <option value="dolap">Dolap</option>
                                                <option value="buzluk">Buzluk</option>
                                                <option value="kiler">Kiler</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                        <Save size={16} /> Veritabanına Kaydet
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                            {envanter.map(item => {
                                const kalan = gunFarki(item.skt);
                                const kritik = kalan <= 2;
                                return (
                                    <div key={item.id} className={`bg-white p-5 rounded-3xl border ${kritik ? 'border-rose-100' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all group`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-2xl ${item.saklama_yeri === 'buzluk' ? 'bg-blue-50 text-blue-500' : (item.saklama_yeri === 'dolap' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500')}`}>
                                                {item.saklama_yeri === 'buzluk' ? <Snowflake size={20} /> : (item.saklama_yeri === 'dolap' ? <Thermometer size={20} /> : <Sun size={20} />)}
                                            </div>
                                            <button onClick={() => urunSil(item.id)} className="text-slate-200 hover:text-rose-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-slate-800">{item.gida_ad}</h3>
                                        <p className="text-sm text-slate-400 font-medium mb-4">{item.miktar}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Calendar size={12} />
                                                <span className="text-[11px] font-bold uppercase tracking-tighter">{item.skt}</span>
                                            </div>
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${kritik ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
                                                {kalan <= 0 ? 'TÜKETİLMELİ' : `${kalan} GÜN`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {envanter.length === 0 && (
                                <div className="col-span-full py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                                    <Package className="mx-auto text-slate-200 mb-2" size={40} />
                                    <p className="text-slate-400 font-bold text-sm tracking-wide">Henüz mutfağınıza bir şey eklemediniz.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4">
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-600">
                                    <Database size={18} /> Yeni Gıda Tanımla
                                </h2>
                                <form onSubmit={rehberEkle} className="space-y-4">
                                    <input
                                        placeholder="Ürün Adı"
                                        className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-transparent focus:border-indigo-100 outline-none"
                                        value={yeniGida.ad}
                                        onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })}
                                        required
                                    />
                                    <input
                                        placeholder="Birim"
                                        className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-none"
                                        value={yeniGida.birim}
                                        onChange={e => setYeniGida({ ...yeniGida, birim: e.target.value })}
                                        required
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase text-center block">Dolap</label>
                                            <input type="number" placeholder="Gün" className="w-full p-2 bg-slate-50 rounded-lg text-center font-bold text-sm" value={yeniGida.dolap} onChange={e => setYeniGida({ ...yeniGida, dolap: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase text-center block">Buzluk</label>
                                            <input type="number" placeholder="Gün" className="w-full p-2 bg-slate-50 rounded-lg text-center font-bold text-sm" value={yeniGida.buzluk} onChange={e => setYeniGida({ ...yeniGida, buzluk: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase text-center block">Kiler</label>
                                            <input type="number" placeholder="Gün" className="w-full p-2 bg-slate-50 rounded-lg text-center font-bold text-sm" value={yeniGida.kiler} onChange={e => setYeniGida({ ...yeniGida, kiler: e.target.value })} />
                                        </div>
                                    </div>
                                    <button className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                                        Rehbere Ekle
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="p-5">Gıda / Birim</th>
                                        <th className="p-5 text-center">Dolap</th>
                                        <th className="p-5 text-center">Buzluk</th>
                                        <th className="p-5 text-center">Kiler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {kutuphane.map(g => (
                                        <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-5 font-bold text-slate-700">
                                                {g.ad} <span className="text-[10px] text-slate-300 ml-1">({g.birim})</span>
                                            </td>
                                            <td className="p-5 text-center text-xs font-bold text-emerald-600">{g.dolap_omru || '-'} G</td>
                                            <td className="p-5 text-center text-xs font-bold text-blue-500">{g.buzluk_omru || '-'} G</td>
                                            <td className="p-5 text-center text-xs font-bold text-amber-500">{g.kiler_omru || '-'} G</td>
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