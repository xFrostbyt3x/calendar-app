import { useState, useRef } from 'react';

// Helpers
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust to Sunday
    return new Date(d.setDate(diff));
}

export default function WeeklyCalendar({ events = [], setEvents }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Modal State variables (simplified for viewing, could be extracted to a shared hook)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const startOfWeek = getStartOfWeek(currentDate);

    // Generate the 7 days
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
    });

    const handlePrevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };

    const handleNextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const monthName = startOfWeek.toLocaleString('default', { month: 'long' });
    const year = startOfWeek.getFullYear();

    // Hours to display (8 AM to 8 PM)
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);

    return (
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden relative">
            {/* Main Weekly Timeline Area */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto scrollbar-hide">
                {/* Background Ambient Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="w-full max-w-7xl glass rounded-[1rem] sm:rounded-[2rem] p-4 sm:p-8 shadow-2xl border-white/5 relative overflow-hidden animate-[fadeIn_0.5s_ease-out] mb-20">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r dark:from-white from-slate-900 dark:to-slate-400 to-slate-600">
                            {monthName} {year}
                        </h2>
                    </div>

                    {/* Timeline Header (Days) */}
                    <div className="flex border-b border-slate-700/50 pb-2 mb-4 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-20">
                        <div className="w-16 shrink-0"></div> {/* Spacer for time column */}
                        <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-4">
                            {weekDays.map((day, i) => {
                                const isToday = new Date().toDateString() === day.toDateString();
                                return (
                                    <div key={i} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${isToday ? 'bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(19,91,236,0.2)]' : ''}`}>
                                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isToday ? 'text-primary' : 'text-slate-500'}`}>
                                            {day.toLocaleString('default', { weekday: 'short' })}
                                        </span>
                                        <span className={`text-lg sm:text-2xl font-black ${isToday ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {day.getDate()}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Timeline Grid */}
                    <div className="relative overflow-y-auto h-[600px] scrollbar-hide">
                        {hours.map((hour) => (
                            <div key={hour} className="flex min-h-[5rem] group border-b border-slate-700/30">
                                {/* Time Label */}
                                <div className="w-16 shrink-0 text-right pr-4 pt-2 text-xs font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                                    {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                                </div>

                                {/* 7-Day Columns for this hour */}
                                <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-4 relative">
                                    {weekDays.map((day, dIdx) => {
                                        // Find events for this day AND this hour
                                        const cellEvents = events.filter(e => e.date.toDateString() === day.toDateString() && e.hour === hour);

                                        return (
                                            <div key={dIdx} className="relative p-1 border-l border-white/5 hover:bg-white/5 transition-colors cursor-pointer group/cell">
                                                {cellEvents.map((evt, eIdx) => (
                                                    <div
                                                        key={eIdx}
                                                        onClick={() => { setSelectedEvent(evt); setIsModalOpen(true); }}
                                                        className="absolute inset-x-1 top-1 bottom-1 bg-primary/20 border border-primary/50 shadow-[0_0_10px_rgba(19,91,236,0.3)] rounded-lg p-2 overflow-hidden hover:bg-primary/30 transition-all z-10"
                                                    >
                                                        <p className="text-[10px] font-bold text-white truncate leading-tight">{evt.title}</p>
                                                        <p className="text-[8px] text-primary/80 mt-1 truncate">{evt.contact ? `w/ ${evt.contact}` : evt.category}</p>
                                                    </div>
                                                ))}
                                                {cellEvents.length === 0 && (
                                                    <div className="absolute inset-x-1 top-1 bottom-1 border border-dashed border-slate-700/50 rounded-lg opacity-0 group-hover/cell:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-[18px] text-slate-600 material-symbols-outlined">add</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline Navigation Controls */}
                <div className="fixed bottom-10 flex gap-4 z-20">
                    <button onClick={handlePrevWeek} className="size-12 glass rounded-full flex items-center justify-center hover:bg-white/10 hover:shadow-lg transition-all text-slate-300 hover:text-white active:scale-95">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="px-8 glass rounded-full flex items-center gap-2 text-sm font-medium hover:bg-white/10 hover:shadow-lg transition-all dark:text-slate-200 text-slate-700 dark:hover:text-white hover:text-slate-900 active:scale-95">
                        This Week
                    </button>
                    <button onClick={handleNextWeek} className="size-12 glass rounded-full flex items-center justify-center hover:bg-white/10 hover:shadow-lg transition-all text-slate-300 hover:text-white active:scale-95">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Read-Only Modal for Events in Weekly View */}
            {isModalOpen && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
                    <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative w-full max-w-sm apple-liquid-glass rounded-2xl p-6 shadow-2xl z-10 animate-[slideUp_0.3s_ease-out]">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-2">{selectedEvent.title}</h3>
                        <p className="text-sm text-primary font-semibold mb-6">{selectedEvent.time} • {selectedEvent.date.toDateString()}</p>
                        <div className="space-y-3">
                            <p className="text-sm dark:text-slate-300 flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">category</span> {selectedEvent.category}</p>
                            {selectedEvent.contact && <p className="text-sm dark:text-slate-300 flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">person</span> {selectedEvent.contact}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
