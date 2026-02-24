import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAcajZ2Eih9DsRVYAzufcXHGZab-YLO_yg');

export default function Navigation() {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    // AI Popup State
    const [isAsking, setIsAsking] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const popupRef = useRef(null);

    // Close popup clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target) && !event.target.closest('.search-input-group')) {
                setIsPopupOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAskAetherCal = async (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setIsPopupOpen(true);
            setIsAsking(true);
            setAiResponse('');

            try {
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const systemPrompt = `You are AetherCal, a futuristic, knowledgeable, and concise AI assistant built into a sleek calendar application. 
Answer the user's question directly and elegantly in plain text (no markdown formatting if possible, just natural text). Keep it under 3 sentences unless asked for more details.`;

                const result = await model.generateContent(`${systemPrompt}\nUser Question: ${searchQuery}`);
                const text = result.response.text();
                setAiResponse(text);
            } catch (error) {
                console.error("AI Generation Error:", error);
                setAiResponse("I'm sorry, my connection to the Aether network was interrupted. Please try again.");
            } finally {
                setIsAsking(false);
            }
        }
    };

    return (
        <header className="z-50 flex flex-col md:flex-row flex-wrap items-center justify-between px-4 lg:px-10 py-3 gap-4 border-b border-slate-800 bg-background-dark/50 glass-morphism sticky top-0">
            <div className="flex items-center justify-between w-full md:w-auto md:gap-8">
                <Link to="/" className="flex items-center gap-2 md:gap-4 dark:text-white text-slate-900 hover:opacity-80 transition-opacity">
                    <div className="size-8 apple-liquid-glass rounded-xl flex items-center justify-center text-primary shadow-lg p-1.5 focus:outline-none">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold">AetherCal</h2>
                </Link>
                <nav className="flex items-center gap-4 md:gap-6 ml-auto md:ml-8">
                    <Link to="/" className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-primary' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900'}`}>
                        Monthly View
                    </Link>
                    <Link to="/dashboard" className={`text-sm font-semibold transition-colors ${location.pathname === '/dashboard' ? 'text-primary' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900'}`}>
                        Dashboard
                    </Link>
                    <Link to="/settings" className={`text-sm font-semibold transition-colors flex items-center gap-1 ${location.pathname === '/settings' ? 'text-primary' : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900'}`}>
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        <span className="hidden lg:inline">Settings</span>
                    </Link>
                </nav>
            </div>
            <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
                {/* View Toggles (Only show if not on Dashboard/Settings) */}
                <div className="hidden sm:flex bg-slate-800/80 p-1 rounded-xl glass border border-slate-700/50 mr-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`
                        }
                    >
                        Month
                    </NavLink>
                    <NavLink
                        to="/weekly"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isActive ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white'}`
                        }
                    >
                        Week
                    </NavLink>
                </div>

                {/* AI Chat Group */}
                <div className="relative group search-input-group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <div className="size-6 apple-liquid-glass rounded-lg flex items-center justify-center">
                            <span className={`material-symbols-outlined transition-colors text-sm ${isAsking ? 'text-primary animate-spin' : 'text-slate-400 group-focus-within:text-primary'}`}>{isAsking ? 'sync' : 'magic_button'}</span>
                        </div>
                    </div>
                    <input
                        className="relative w-full flex-1 md:w-64 lg:w-96 h-10 glass rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary/50 focus:border-primary border-transparent text-sm dark:placeholder:text-slate-500 placeholder:text-slate-400 transition-all shadow-lg dark:text-white text-slate-900 dark:bg-slate-900/50 bg-white/50 z-10"
                        placeholder="Ask AetherCal anything..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleAskAetherCal}
                    />

                    {/* AI Response Popup */}
                    <div
                        ref={popupRef}
                        className={`absolute top-full right-0 mt-3 w-[350px] sm:w-[450px] apple-liquid-glass rounded-2xl p-6 shadow-2xl transition-all duration-300 origin-top-right z-[100] ${isPopupOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                            <h3 className="font-bold text-sm dark:text-white text-slate-800 tracking-wide uppercase">AetherCal Response</h3>
                        </div>

                        <div className="min-h-[60px] flex flex-col justify-center">
                            {isAsking ? (
                                <div className="flex flex-col items-center justify-center py-4 space-y-3">
                                    <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Consulting the Aether...</p>
                                </div>
                            ) : (
                                <p className="text-sm dark:text-slate-300 text-slate-700 leading-relaxed font-medium">
                                    {aiResponse}
                                </p>
                            )}
                        </div>

                        {!isAsking && aiResponse && (
                            <div className="mt-6 pt-4 border-t border-slate-700/30 flex justify-end">
                                <button
                                    onClick={() => setIsPopupOpen(false)}
                                    className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-lg"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold dark:text-white text-slate-800">Guest User</p>
                        <p className="text-[10px] dark:text-slate-400 text-slate-500 uppercase tracking-wider font-bold">Standard</p>
                    </div>
                    <div className="size-10 rounded-xl apple-liquid-glass flex items-center justify-center text-slate-400 shadow-md">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
