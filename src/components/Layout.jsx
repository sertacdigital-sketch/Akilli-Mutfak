import React from 'react';
import { ChefHat, List, Settings, LogOut, Circle } from 'lucide-react';

const Layout = ({ children, aktifSekme, setAktifSekme }) => {
    return (
        // flex-row ile yan yana diz, w-full h-full ile ekranı mühürle
        <div className="flex flex-row h-screen w-screen bg-[#070B14] text-slate-200 overflow-hidden font-sans">

            {/* SOL SIDEBAR - Genişliği sabit tutuyoruz */}
            <aside className="w-[350px] bg-slate-900 border-r border-white/5 flex flex-col shrink-0 z-20 shadow-2xl">
                <div className="p-12 flex items-center gap-4">
                    <div className="bg-indigo-600 p-3 rounded-2xl">
                        <ChefHat className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter text-white uppercase">MUTFAK<span className="text-indigo-400">PRO</span></h1>
                </div>

                <nav className="flex-1 px-8 space-y-4">
                    <button
                        onClick={() => setAktifSekme('liste')}
                        className={`w-full flex items-center gap-5 px-8 py-6 rounded-[28px] font-black text-lg transition-all ${aktifSekme === 'liste' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        <List size={26} /> Envanter
                    </button>
                    <button
                        onClick={() => setAktifSekme('ayarlar')}
                        className={`w-full flex items-center gap-5 px-8 py-6 rounded-[28px] font-black text-lg transition-all ${aktifSekme === 'ayarlar' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        <Settings size={26} /> Kütüphane
                    </button>
                </nav>

                <div className="p-10 border-t border-white/5 opacity-30">
                    <button className="flex items-center gap-3 font-bold hover:text-rose-500 transition-all"><LogOut size={20} /> Çıkış Yap</button>
                </div>
            </aside>

            {/* SAĞ İÇERİK ALANI - Asıl Yayılmayı Yapan Yer Burası */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-950/40">
                <header className="h-32 border-b border-white/5 flex items-center justify-between px-20 shrink-0">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        {aktifSekme === 'liste' ? 'Envanter' : 'Kütüphane'}
                    </h2>
                    <div className="flex items-center gap-4 bg-slate-900/80 px-6 py-3 rounded-full border border-white/10">
                        <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Aktif</span>
                    </div>
                </header>

                {/* Main alanı w-full ve p-20 ile içeriği merkeze ama geniş yayacak */}
                <main className="flex-1 overflow-y-auto p-20 w-full scrollbar-hide">
                    {/* Buradaki div'in genişliği 'children'ın nasıl duracağını belirler */}
                    <div className="w-full h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;