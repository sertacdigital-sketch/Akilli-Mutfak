import React from 'react';
import { ChefHat, List, Settings, LogOut, Circle } from 'lucide-react';

const Layout = ({ children, aktifSekme, setAktifSekme }) => {
    return (
        // flex-row ile yan yana diz, w-screen h-screen ile tüm tarayıcıyı kapla
        <div className="flex flex-row h-screen w-screen bg-[#0F172A] text-slate-300 overflow-hidden font-sans text-sm">

            {/* SOL SIDEBAR - 240px Standart Genişlik */}
            <aside className="w-60 bg-[#1E293B] border-r border-slate-700/50 flex flex-col shrink-0 z-20 shadow-xl">
                {/* Logo Alanı */}
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-600/20">
                        <ChefHat className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-base font-bold text-white tracking-tight uppercase">
                        MUTFAK<span className="text-indigo-400">PRO</span>
                    </h1>
                </div>

                {/* Navigasyon */}
                <nav className="flex-1 px-3 space-y-1">
                    <button
                        onClick={() => setAktifSekme('liste')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${aktifSekme === 'liste'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                    >
                        <List size={18} /> Envanter
                    </button>
                    <button
                        onClick={() => setAktifSekme('ayarlar')}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${aktifSekme === 'ayarlar'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                    >
                        <Settings size={18} /> Kütüphane
                    </button>
                </nav>

                {/* Alt Çıkış Butonu */}
                <div className="p-6 border-t border-slate-700/50">
                    <button className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest">
                        <LogOut size={14} /> Sistemi Kapat
                    </button>
                </div>
            </aside>

            {/* SAĞ İÇERİK ALANI */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0F172A]">
                {/* Header - Daha ince (h-16) ve temiz */}
                <header className="h-16 border-b border-slate-700/50 flex items-center justify-between px-8 shrink-0 bg-[#0F172A]/80 backdrop-blur-sm z-10">
                    <div>
                        <h2 className="text-base font-bold text-white tracking-tight">
                            {aktifSekme === 'liste' ? 'Mevcut Stok Durumu' : 'Ürün Kütüphanesi'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700">
                        <Circle size={6} className="fill-emerald-500 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Sistem Aktif
                        </span>
                    </div>
                </header>

                {/* Ana İçerik Alanı */}
                <main className="flex-1 overflow-y-auto p-8 w-full">
                    {/* Children'ın genişliğini kısıtlamıyoruz ki grid yapısı yayılsın */}
                    <div className="w-full h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;