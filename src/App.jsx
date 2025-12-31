import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import {
    Plus, Minus, Trash2, Snowflake, Thermometer, Sun,
    Search, ChefHat, Package, CheckCircle2, Calendar, Edit3, Save, X, RefreshCw
} from 'lucide-react';

export default function App() {
    // --- STATE TANIMLAMALARI ---
    const [gidaVeritabani, setGidaVeritabani] = useState({});
    const [envanter, setEnvanter] = useState([]);
    const [loading, setLoading] = useState(true);
    const [aktifSekme, setAktifSekme] = useState('liste');
    const [aramaTerimi, setAramaTerimi] = useState("");

    // Envanter Formu State
    const [secilenGidaAd, setSecilenGidaAd] = useState("");
    const [saklamaYeri, setSaklamaYeri] = useState("dolap");
    const [miktarDegeri, setMiktarDegeri] = useState(1);
    const [sktTarihi, setSktTarihi] = useState("");

    // Kütüphane Formu & Düzenleme State
    const [duzenlemeModu, setDuzenlemeModu] = useState(null);
    const [yeniGida, setYeniGida] = useState({
        ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: ""
    });

    // --- BAŞLANGIÇ VERİ ÇEKME ---
    useEffect(() => { verileriGetir(); }, []);

    const verileriGetir = async () => {
        setLoading(true);
        try {
            // Kütüphaneyi Çek
            const { data: kutData } = await supabase.from('gida_kutuphanesi').select('*');
            if (kutData) {
                const obj = {};
                kutData.forEach(i => obj[i.ad] = i);
                setGidaVeritabani(obj);
            }
            // Envanteri Çek
            const { data: envData } = await supabase.from('mutfak_envanteri').select('*').order('skt', { ascending: true });
            if (envData) setEnvanter(envData);
        } catch (err) { console.error("Veri çekme hatası:", err); }
        setLoading(false);
    };

    // --- YARDIMCI FONKSİYONLAR ---

    // Birime göre artış/azalış miktarını belirle (Kg ise 0.1, Gr ise 50, Adet ise 1)
    const getStep = () => {
        const birim = gidaVeritabani[secilenGidaAd]?.birim;
        if (birim === 'Kg' || birim === 'Litre') return 0.1;
        if (birim === 'Gr') return 50;
        return 1;
    };

    // Envanter formu için otomatik SKT hesaplayıcı
    useEffect(() => {
        if (secilenGidaAd && gidaVeritabani[secilenGidaAd]) {
            const gida = gidaVeritabani[secilenGidaAd];
            const omur = gida[`${saklamaYeri}_omru`] || 0;
            if (omur > 0) {
                const bugun = new Date();
                bugun.setDate(bugun.getDate() + parseInt(omur));
                setSktTarihi(bugun.toISOString().split('T')[0]);
            }
        }
    }, [secilenGidaAd, saklamaYeri, gidaVeritabani]);

    // --- MASTER DATA GÜNCELLEME MANTIĞI ---
    // Kütüphanede ömür değişirse, envanterdeki mevcut ürünlerin SKT'sini yeniden hesaplar
    const guncelleEnvanterTarihleri = async (gidaAd, yeniOmurler) => {
        try {
            // 1. Bu gıdaya ait tüm envanter kayıtlarını bul
            const { data: envKayitlari } = await supabase
                .from('mutfak_envanteri')
                .select('*')
                .eq('gida_ad', gidaAd);

            if (!envKayitlari || envKayitlari.length === 0) return;

            // 2. Her kayıt için eklenme tarihini baz alarak yeni SKT hesapla
            const updates = envKayitlari.map(item => {
                const yeniOmur = yeniOmurler[`${item.saklama_yeri}_omru`] || 0;

                // Eğer yeni ömür girilmemişse veya 0 ise işlem yapma
                if (!yeniOmur || parseInt(yeniOmur) === 0) return null;

                const baslangicTarihi = new Date(item.eklenme_tarihi); // DB'deki oluşturulma tarihi
                baslangicTarihi.setDate(baslangicTarihi.getDate() + parseInt(yeniOmur));
                const yeniSkt = baslangicTarihi.toISOString().split('T')[0];

                return supabase
                    .from('mutfak_envanteri')
                    .update({ skt: yeniSkt })
                    .eq('id', item.id);
            });

            // 3. Tüm güncellemeleri paralel çalıştır
            await Promise.all(updates.filter(u => u !== null));
            console.log(`${gidaAd} için envanter tarihleri güncellendi.`);

        } catch (err) {
            console.error("Toplu SKT güncelleme hatası:", err);
        }
    };

    // --- CRUD İŞLEMLERİ ---

    const envanterEkle = async (e) => {
        e.preventDefault();
        if (!secilenGidaAd || !sktTarihi) return;
        const birim = gidaVeritabani[secilenGidaAd]?.birim || '';

        const { error } = await supabase.from('mutfak_envanteri').insert([{
            gida_ad: secilenGidaAd,
            miktar: `${miktarDegeri} ${birim}`,
            saklama_yeri: saklamaYeri,
            skt: sktTarihi,
            // eklenme_tarihi veritabanında default now() olarak ayarlı varsayıyoruz
        }]);

        if (!error) {
            setSecilenGidaAd("");
            setMiktarDegeri(1);
            verileriGetir();
        } else {
            alert("Ekleme hatası!");
        }
    };

    const kutuphaneKaydet = async (e) => {
        e.preventDefault();
        if (!yeniGida.ad) return;

        if (duzenlemeModu) {
            // DÜZENLEME MODU
            const { error } = await supabase.from('gida_kutuphanesi').update(yeniGida).eq('id', duzenlemeModu);

            if (!error) {
                // Kütüphane güncellendi, şimdi envanter tarihlerini senkronize et
                await guncelleEnvanterTarihleri(yeniGida.ad, yeniGida);
                setDuzenlemeModu(null);
            }
        } else {
            // YENİ EKLEME MODU
            await supabase.from('gida_kutuphanesi').insert([yeniGida]);
        }

        setYeniGida({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" });
        verileriGetir();
    };

    const duzenleBaslat = (gida) => {
        setDuzenlemeModu(gida.id);
        setYeniGida(gida);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Formun başına kaydır
    };

    // --- RENDER ---
    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-indigo-500 gap-4">
            <RefreshCw className="animate-spin" size={40} />
            <span className="font-black tracking-[0.3em] animate-pulse">YÜKLENİYOR...</span>
        </div>
    );

    return (
        <div className="min-h-screen w-full bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden pb-20">

            {/* HEADER */}
            <nav className="sticky top-0 z-50 w-full bg-[#0F172A]/95 backdrop-blur-md border-b border-white/10 px-6 h-20 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20"><ChefHat size={24} /></div>
                    <h1 className="text-lg font-black text-white tracking-tighter uppercase italic hidden sm:block">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                </div>

                <div className="flex bg-black p-1 rounded-2xl border border-white/5 shadow-inner">
                    <button onClick={() => setAktifSekme('liste')} className={`px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black tracking-widest transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>ENVANTER</button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black tracking-widest transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>KÜTÜPHANE</button>
                </div>

                <div className="relative w-48 lg:w-64 hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input type="text" placeholder="Ara..." className="w-full bg-black border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-colors" onChange={(e) => setAramaTerimi(e.target.value)} />
                </div>
            </nav>

            <main className="p-4 sm:p-6 lg:p-10 max-w-[1920px] mx-auto">
                {aktifSekme === 'liste' ? (
                    <div className="flex flex-col xl:flex-row gap-10">

                        {/* SOL: STOK GİRİŞ PANELİ */}
                        <div className="w-full xl:w-[450px] shrink-0">
                            <div className="bg-[#0F172A] p-6 sm:p-8 rounded-[40px] border border-white/10 shadow-2xl sticky top-28">
                                <div className="flex items-center gap-2 mb-8 text-indigo-400 font-black uppercase text-xs tracking-widest"><Package size={18} /> <span>Stok Girişi</span></div>

                                <form onSubmit={envanterEkle} className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Ürün Seç</label>
                                        <select
                                            className="w-full h-16 bg-black border-2 border-white/5 rounded-2xl px-6 text-base font-black text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer transition-colors"
                                            value={secilenGidaAd}
                                            onChange={e => { setSecilenGidaAd(e.target.value); setMiktarDegeri(1); }}
                                        >
                                            <option value="">Seçiniz...</option>
                                            {Object.keys(gidaVeritabani).sort().map(k => <option key={k} value={k}>{k}</option>)}
                                        </select>
                                    </div>

                                    {/* DİNAMİK MİKTAR STEPPER */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Miktar ({gidaVeritabani[secilenGidaAd]?.birim || 'Birim'})</label>
                                        <div className="flex items-center justify-between bg-black p-2 rounded-3xl border-2 border-white/5 focus-within:border-indigo-500 transition-all">
                                            <button type="button" onClick={() => setMiktarDegeri(v => Math.max(0, parseFloat((v - getStep()).toFixed(2))))} className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-rose-600 active:scale-90 transition-transform"><Minus size={24} /></button>
                                            <div className="flex flex-col items-center">
                                                <input type="number" step={getStep()} className="bg-transparent text-center text-3xl font-black text-white w-28 outline-none" value={miktarDegeri} onChange={e => setMiktarDegeri(parseFloat(e.target.value) || 0)} />
                                            </div>
                                            <button type="button" onClick={() => setMiktarDegeri(v => parseFloat((v + getStep()).toFixed(2)))} className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-emerald-600 active:scale-90 transition-transform"><Plus size={24} /></button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Muhafaza & SKT</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: 'dolap', icon: <Thermometer size={16} />, label: 'Dolap' },
                                                { id: 'buzluk', icon: <Snowflake size={16} />, label: 'Buzluk' },
                                                { id: 'kiler', icon: <Sun size={16} />, label: 'Kiler' }
                                            ].map(t => (
                                                <button key={t.id} type="button" onClick={() => setSaklamaYeri(t.id)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${saklamaYeri === t.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-black border-white/5 text-slate-600 hover:border-white/20'}`}>
                                                    {t.icon} <span className="text-[9px] font-black uppercase">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                                            <input type="date" className="w-full h-16 pl-14 bg-black border-2 border-white/5 rounded-2xl text-sm font-black text-white outline-none focus:border-indigo-500 transition-colors" value={sktTarihi} onChange={e => setSktTarihi(e.target.value)} />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl shadow-indigo-900/40 border-t border-white/20">KAYDET</button>
                                </form>
                            </div>
                        </div>

                        {/* SAĞ: ENVANTER LİSTESİ */}
                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                                {envanter.filter(u => u.gida_ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(u => {
                                    const bugun = new Date().setHours(0, 0, 0, 0);
                                    const skt = new Date(u.skt).setHours(0, 0, 0, 0);
                                    const gun = Math.ceil((skt - bugun) / 86400000);
                                    const kritik = gun <= 3 && gun > 0;
                                    const tukendi = gun <= 0;

                                    return (
                                        <div key={u.id} className={`group relative p-6 rounded-[32px] border-2 transition-all duration-500 ${tukendi ? 'bg-rose-950/20 border-rose-500/30' : kritik ? 'bg-orange-950/20 border-orange-500/30' : 'bg-[#0F172A] border-white/5 hover:border-indigo-500/30'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`p-3 rounded-xl shadow-lg ${u.saklama_yeri === 'buzluk' ? 'bg-blue-600/20 text-blue-400' : u.saklama_yeri === 'dolap' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-orange-600/20 text-orange-400'}`}>
                                                    {u.saklama_yeri === 'buzluk' ? <Snowflake size={20} /> : u.saklama_yeri === 'dolap' ? <Thermometer size={20} /> : <Sun size={20} />}
                                                </div>
                                                <button onClick={() => { if (window.confirm('Silinsin mi?')) supabase.from('mutfak_envanteri').delete().eq('id', u.id).then(verileriGetir); }} className="p-2 opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                                            </div>

                                            <h4 className="font-black text-white uppercase text-sm mb-2 truncate tracking-tight">{u.gida_ad}</h4>

                                            <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase">
                                                <span className="bg-black px-3 py-1 rounded-lg border border-white/5 text-indigo-400 shadow-inner">{u.miktar}</span>
                                                <span className="text-slate-500">{u.saklama_yeri}</span>
                                            </div>

                                            <div className="pt-4 border-t border-white/5 space-y-1">
                                                <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase">
                                                    <span>Durum</span>
                                                    <span>{u.skt.split('-').reverse().join('.')}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs font-black ${tukendi ? 'text-rose-500' : kritik ? 'text-orange-500' : 'text-slate-300'}`}>
                                                        {tukendi ? 'SKT GEÇTİ' : `${gun} GÜN KALDI`}
                                                    </span>
                                                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] ${tukendi ? 'bg-rose-600 text-rose-600' : kritik ? 'bg-orange-500 text-orange-500' : 'bg-emerald-500 text-emerald-500'}`}></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* KÜTÜPHANE SAYFASI */
                    <div className="w-full grid grid-cols-1 xl:grid-cols-4 gap-10">
                        <div className="xl:col-span-1">
                            <div className="bg-[#0F172A] p-8 rounded-[40px] border border-white/10 shadow-2xl sticky top-28">
                                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs tracking-widest">
                                        {duzenlemeModu ? <Edit3 size={18} /> : <CheckCircle2 size={18} />}
                                        <span>{duzenlemeModu ? 'Düzenle & Güncelle' : 'Yeni Tanımla'}</span>
                                    </div>
                                    {duzenlemeModu && <button onClick={() => { setDuzenlemeModu(null); setYeniGida({ ad: "", birim: "Adet", dolap_omru: "", buzluk_omru: "", kiler_omru: "" }) }} className="text-slate-500 hover:text-white"><X size={18} /></button>}
                                </div>

                                {duzenlemeModu && (
                                    <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-2xl text-[10px] text-emerald-200">
                                        <span className="font-bold block mb-1">DİKKAT:</span>
                                        Bu gıdanın saklama ömrünü güncellediğinizde, envanterinizdeki mevcut ürünlerin son kullanma tarihleri otomatik olarak yeniden hesaplanacaktır.
                                    </div>
                                )}

                                <form onSubmit={kutuphaneKaydet} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Ürün Adı</label>
                                        <input type="text" className="w-full h-14 bg-black border-2 border-white/5 rounded-2xl px-5 text-sm font-black text-white outline-none focus:border-emerald-500 transition-colors" value={yeniGida.ad} onChange={e => setYeniGida({ ...yeniGida, ad: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Ölçü Birimi</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Adet', 'Kg', 'Gr', 'Litre', 'Paket'].map(b => (
                                                <button key={b} type="button" onClick={() => setYeniGida({ ...yeniGida, birim: b })} className={`py-2 rounded-xl text-[10px] font-bold border-2 transition-all ${yeniGida.birim === b ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-black border-white/5 text-slate-500 hover:border-white/20'}`}>{b}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        {['dolap', 'buzluk', 'kiler'].map(f => (
                                            <div key={f} className="space-y-1">
                                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">{f} Ömrü (Gün)</label>
                                                <input type="number" className="w-full h-12 bg-black border-2 border-white/5 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500 transition-colors placeholder-slate-700" placeholder="0" value={yeniGida[`${f}_omru`]} onChange={e => setYeniGida({ ...yeniGida, [`${f}_omru`]: e.target.value })} />
                                            </div>
                                        ))}
                                    </div>
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 shadow-emerald-900/30">
                                        {duzenlemeModu ? 'GÜNCELLE VE YANSIT' : 'KÜTÜPHANEYE EKLE'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="xl:col-span-3">
                            <div className="bg-[#0F172A] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
                                <div className="p-6 border-b border-white/5 bg-black/30 font-black text-[10px] tracking-widest text-slate-500 uppercase flex justify-between"><span>Kayıtlı Gıdalar</span> <span>{Object.keys(gidaVeritabani).length} Kayıt</span></div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-white">
                                        <thead className="bg-black text-slate-600 uppercase text-[10px] font-black">
                                            <tr><th className="p-6">Gıda / Birim</th><th className="p-6 text-center">Dolap</th><th className="p-6 text-center">Buzluk</th><th className="p-6 text-center">Kiler</th><th className="p-6 text-right">İşlemler</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-xs">
                                            {Object.values(gidaVeritabani).filter(g => g.ad.toLowerCase().includes(aramaTerimi.toLowerCase())).map(g => (
                                                <tr key={g.id} className="hover:bg-white/[0.03] transition-colors font-black uppercase group">
                                                    <td className="p-6 border-l-4 border-transparent group-hover:border-indigo-500">
                                                        {g.ad}
                                                        <span className="text-slate-600 ml-2 italic lowercase font-normal border border-white/5 px-2 py-0.5 rounded-md">
                                                            {g.birim}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-center"><span className="text-indigo-400">{g.dolap_omru || '-'}</span> <span className="text-slate-600 text-[9px]">GÜN</span></td>
                                                    <td className="p-6 text-center"><span className="text-blue-400">{g.buzluk_omru || '-'}</span> <span className="text-slate-600 text-[9px]">GÜN</span></td>
                                                    <td className="p-6 text-center"><span className="text-orange-400">{g.kiler_omru || '-'}</span> <span className="text-slate-600 text-[9px]">GÜN</span></td>
                                                    <td className="p-6 text-right space-x-2">
                                                        <button onClick={() => duzenleBaslat(g)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all"><Edit3 size={16} /></button>
                                                        <button onClick={() => { if (window.confirm(`${g.ad} kütüphaneden silinsin mi?`)) supabase.from('gida_kutuphanesi').delete().eq('id', g.id).then(verileriGetir); }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all"><Trash2 size={16} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}