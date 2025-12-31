import React from 'react';
import { ChefHat, List, Settings, LogOut, Circle } from 'lucide-react';

const Layout = ({ children, aktifSekme, setAktifSekme }) => {
    return (
        // w-screen h-screen ile tüm tarayıcıyı kapla
        <div className="flex h-screen w-screen bg-[#0F172A] text-slate-200 overflow-hidden font-sans">

            {/* SOL SIDEBAR - Genişliği sabit, kendisi sabit */}
            <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
                <div className="p-10 flex items-center gap-4">
                    <div className="bg-indigo-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
                        <ChefHat className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-white leading-none">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                </div>

                <nav className="flex-1 px-6 space-y-3">
                    <button
                        onClick={() => setAktifSekme('liste')}
                        className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] font-black transition-all duration-300 ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' : 'hover:bg-slate-800 text-slate-500'}`}
                    >
                        <List size={24} /> Envanter
                    </button>
                    <button
                        onClick={() => setAktifSekme('ayarlar')}
                        className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] font-black transition-all duration-300 ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30' : 'hover:bg-slate-800 text-slate-500'}`}
                    >
                        <Settings size={24} /> Kütüphane
                    </button>
                </nav>

                <div className="p-8 border-t border-slate-800/50">
                    <button className="flex items-center gap-3 text-slate-600 font-bold hover:text-rose-400 transition-all"><LogOut size={20} /> Sistemi Kapat</button>
                </div>
            </aside>

            {/* SAĞ İÇERİK ALANI - BURASI TÜM EKRANA YAYILIR */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-28 bg-slate-900/20 border-b border-slate-800/50 flex items-center justify-between px-16 shrink-0">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                            {aktifSekme === 'liste' ? 'Mevcut Stok Durumu' : 'Kütüphane Yönetimi'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-800/40 px-6 py-3 rounded-full border border-slate-700">
                        <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest text-[10px]">Cloud Sync Active</span>
                    </div>
                </header>

                {/* main etiketinde max-w-none kullanarak kısıtlamayı öldürdük */}
                <main className="flex-1 overflow-y-auto p-16 w-full max-w-none">
                    <div className="w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;