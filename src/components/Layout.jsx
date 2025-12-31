import React from 'react';
import { ChefHat, List, Settings, LogOut, Circle } from 'lucide-react';

const Layout = ({ children, aktifSekme, setAktifSekme }) => {
    return (
        <div className="flex h-screen w-screen bg-[#070B14] text-slate-200 overflow-hidden font-sans">

            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col shrink-0 z-20 shadow-2xl">
                <div className="p-8 flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl"><ChefHat className="text-white w-5 h-5" /></div>
                    <h1 className="text-lg font-black tracking-tighter text-white uppercase">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button onClick={() => setAktifSekme('liste')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5'}`}>
                        <List size={20} /> Envanter
                    </button>
                    <button onClick={() => setAktifSekme('ayarlar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:bg-white/5'}`}>
                        <Settings size={20} /> Kütüphane
                    </button>
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-rose-500 transition-all uppercase tracking-widest"><LogOut size={16} /> Çıkış</button>
                </div>
            </aside>

            {/* CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-950/40">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 shrink-0">
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                        {aktifSekme === 'liste' ? 'Envanter' : 'Kütüphane'}
                    </h2>
                    <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-full border border-white/10">
                        <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Aktif</span>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-10 w-full scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;