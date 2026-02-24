import { useState } from 'react';

export default function Settings({ theme, setTheme, colorTheme, setColorTheme }) {
    return (
        <div className="flex-1 flex overflow-hidden relative p-8 sm:p-20 justify-center">
            <div className="w-full max-w-2xl glass-morphism rounded-3xl p-8 sm:p-12 shadow-2xl border-white/5 relative z-10 self-start animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center gap-4 mb-10">
                    <div className="size-12 rounded-2xl apple-liquid-glass flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl">settings</span>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Preferences</h2>
                </div>

                <div className="space-y-8">
                    {/* Theme Toggle Section */}
                    <section className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Appearance</h3>
                                <p className="text-sm text-slate-400">Switch between light and dark themes.</p>
                            </div>
                            <div className="flex bg-slate-800/80 p-1 rounded-xl glass border border-slate-700/50">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${theme === 'light' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">light_mode</span>
                                    Light
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${theme === 'dark' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                                    Dark
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Color Theme Section */}
                    <section className="bg-slate-900/40 border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Aesthetic Palette</h3>
                                <p className="text-sm text-slate-400">Choose a custom color profile for AetherCal.</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                {/* Default */}
                                <button
                                    onClick={() => setColorTheme('default')}
                                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${colorTheme === 'default' ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(19,91,236,0.3)]' : 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-800'}`}
                                >
                                    <div className="flex gap-1.5 mb-1">
                                        <div className="size-4 rounded-full bg-[#135bec]"></div>
                                        <div className="size-4 rounded-full bg-[#a7f3d0]"></div>
                                        <div className="size-4 rounded-full bg-[#e0e7ff]"></div>
                                    </div>
                                    <span className={`text-xs font-bold ${colorTheme === 'default' ? 'text-primary' : 'text-slate-400'}`}>Aether Blue</span>
                                </button>

                                {/* Obsidian */}
                                <button
                                    onClick={() => setColorTheme('obsidian')}
                                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${colorTheme === 'obsidian' ? 'border-[#8a2be2] bg-[#8a2be2]/10 shadow-[0_0_15px_rgba(138,43,226,0.3)]' : 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-800'}`}
                                >
                                    <div className="flex gap-1.5 mb-1">
                                        <div className="size-4 rounded-full bg-[#8a2be2]"></div>
                                        <div className="size-4 rounded-full bg-[#39ff14]"></div>
                                        <div className="size-4 rounded-full bg-[#9d00ff]"></div>
                                    </div>
                                    <span className={`text-xs font-bold ${colorTheme === 'obsidian' ? 'text-[#8a2be2]' : 'text-slate-400'}`}>Obsidian</span>
                                </button>

                                {/* Cyberpunk */}
                                <button
                                    onClick={() => setColorTheme('cyberpunk')}
                                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${colorTheme === 'cyberpunk' ? 'border-[#f000ff] bg-[#f000ff]/10 shadow-[0_0_15px_rgba(240,0,255,0.3)]' : 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-800'}`}
                                >
                                    <div className="flex gap-1.5 mb-1">
                                        <div className="size-4 rounded-full bg-[#f000ff]"></div>
                                        <div className="size-4 rounded-full bg-[#00ffcc]"></div>
                                        <div className="size-4 rounded-full bg-[#ff007f]"></div>
                                    </div>
                                    <span className={`text-xs font-bold ${colorTheme === 'cyberpunk' ? 'text-[#f000ff]' : 'text-slate-400'}`}>Cyberpunk</span>
                                </button>

                                {/* Sunset */}
                                <button
                                    onClick={() => setColorTheme('sunset')}
                                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${colorTheme === 'sunset' ? 'border-[#ff5e62] bg-[#ff5e62]/10 shadow-[0_0_15px_rgba(255,94,98,0.3)]' : 'border-slate-700/50 bg-slate-800/40 hover:bg-slate-800'}`}
                                >
                                    <div className="flex gap-1.5 mb-1">
                                        <div className="size-4 rounded-full bg-[#ff5e62]"></div>
                                        <div className="size-4 rounded-full bg-[#ff9966]"></div>
                                        <div className="size-4 rounded-full bg-[#ff9a9e]"></div>
                                    </div>
                                    <span className={`text-xs font-bold ${colorTheme === 'sunset' ? 'text-[#ff5e62]' : 'text-slate-400'}`}>Sunset Glass</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Background Orbs */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-mint/5 rounded-full blur-[120px] pointer-events-none"></div>
        </div>
    );
}
