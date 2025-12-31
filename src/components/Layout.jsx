import React from 'react';
import { ChefHat, List, Settings, LogOut, Circle } from 'lucide-react';

const Layout = ({ children, aktifSekme, setAktifSekme }) => {
    return (
        <div className="flex h-screen w-full bg-[#0F172A] text-slate-200 overflow-hidden font-sans">
            {/* SOL SABİT SIDEBAR */}
            <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 shadow-2xl">
                <div className="p-8 flex items-center gap-4">
                    <div className="bg-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
                        <ChefHat className="text-white w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-white leading-none">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                        <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">Envanter Takip</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 mt-4 space-y-2">
                    <button
                        onClick={() => setAktifSekme('liste')}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                    >
                        <List size={22} /> Envanter Listesi
                    </button>
                    <button
                        onClick={() => setAktifSekme('ayarlar')}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                    >
                        <Settings size={22} /> Gıda Kütüphanesi
                    </button>
                </nav>

                <div className="p-6 m-4 bg-slate-800/50 rounded-3xl border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-1">
                        <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Sistem Durumu</span>
                    </div>
                    <p className="text-xs font-bold text-white">Bulut Senkronize</p>
                </div>
            </aside>

            {/* SAĞ TARAF: HEADER + CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-24 bg-slate-900/30 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-12 shrink-0 z-10">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {aktifSekme === 'liste' ? 'Mevcut Stok Durumu' : 'Kütüphane Yönetimi'}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {aktifSekme === 'liste' ? 'Mutfaktaki tüm ürünlerin listesi' : 'Otomatik SKT sürelerini buradan yönetin'}
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-10 w-[1px] bg-slate-800"></div>
                        <button className="text-slate-400 hover:text-rose-400 transition-colors"><LogOut size={22} /></button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <div className="w-full max-w-none">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;