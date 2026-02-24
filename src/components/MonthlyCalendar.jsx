import { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAcajZ2Eih9DsRVYAzufcXHGZab-YLO_yg');

// Helpers to generate calendar days
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday is 0, Sunday is 6
}

export default function MonthlyCalendar({ events = [], setEvents }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('Month');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    // Form State
    const [formTitle, setFormTitle] = useState('');
    const [formCategory, setFormCategory] = useState('General');
    const [formContact, setFormContact] = useState('');
    const [formTime, setFormTime] = useState('12:00');

    // AI Context State
    const [aiContext, setAiContext] = useState('');
    const [isGeneratingContext, setIsGeneratingContext] = useState(false);

    // Drag State
    const [draggedEventId, setDraggedEventId] = useState(null);
    const dragNode = useRef(null);

    // Modal Handlers
    const openModal = (date, evt = null) => {
        setIsAnimatingOut(false);
        setSelectedDate(date);
        if (evt) {
            setEditingEvent(evt);
            setFormTitle(evt.title);
            setFormCategory(evt.category);
            setFormContact(evt.contact || '');
            // Format time for input
            const hh = String(evt.hour).padStart(2, '0');
            setFormTime(`${hh}:00`);
        } else {
            setEditingEvent(null);
            setFormTitle('');
            setFormCategory('General');
            setFormContact('');
            setFormTime('12:00');
        }
        setAiContext(''); // Reset AI context on modal open
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            setIsModalOpen(false);
            setEditingEvent(null);
            setSelectedDate(null);
            setIsAnimatingOut(false);
        }, 300); // Wait for transition
    };

    const handleSaveEvent = (e) => {
        e.preventDefault();
        if (!formTitle.trim()) return;

        const [hours] = formTime.split(':').map(Number);
        const parsedHour = hours || 12;
        const timeStr = `At ${parsedHour > 12 ? parsedHour - 12 : parsedHour === 0 ? 12 : parsedHour}:00 ${parsedHour >= 12 ? 'PM' : 'AM'}`;

        const eventData = {
            id: editingEvent ? editingEvent.id : Date.now().toString(),
            title: formTitle.trim(),
            category: formCategory,
            contact: formContact.trim(),
            date: selectedDate,
            hour: parsedHour,
            time: timeStr,
        };

        if (editingEvent) {
            setEvents(events.map(ev => ev.id === editingEvent.id ? eventData : ev));
        } else {
            setEvents([...events, eventData]);
        }
        closeModal();
    };

    const handleDeleteEvent = () => {
        if (editingEvent) {
            setEvents(events.filter(ev => ev.id !== editingEvent.id));
            closeModal();
        }
    };

    const generateAIContext = async () => {
        if (!editingEvent) return;
        setIsGeneratingContext(true);
        setAiContext('');

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `You are AetherCal, an elite AI assistant. The user has an event scheduled:
            Title: ${formTitle}
            Category: ${formCategory}
            Contact: ${formContact || 'None'}
            Time: ${formTime}
            
            Based on these details, generate a very brief (2-3 sentences max) insightful tip, agenda suggestion, or preparation note for the user. Keep it professional but futuristic. Do not use formatting like markdown.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            setAiContext(text);
        } catch (error) {
            console.error("Error generating context:", error);
            setAiContext("Could not connect to the Aether network to generate insights.");
        } finally {
            setIsGeneratingContext(false);
        }
    };

    // Drag Handlers
    const handleDragStart = (e, eventId) => {
        setDraggedEventId(eventId);
        dragNode.current = e.target;
        // Optional drag image offset
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            if (dragNode.current) {
                // visually hide original while dragging
                dragNode.current.style.opacity = '0.5';
            }
        }, 0);
    };

    const handleDragEnd = () => {
        if (dragNode.current) {
            dragNode.current.style.opacity = '1';
        }
        setDraggedEventId(null);
        dragNode.current = null;
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // allow drop
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, targetDate) => {
        e.preventDefault();
        if (draggedEventId) {
            setEvents(events.map(ev => {
                if (ev.id === draggedEventId) {
                    // clone date to safely mutate Time string if we wanted, but for now just move Day
                    return { ...ev, date: targetDate };
                }
                return ev;
            }));
        }
        handleDragEnd();
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const daysInMonth = getDaysInMonth(year, month);
    const startingDay = getFirstDayOfMonth(year, month);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Generate blank grid
    // We need to render padding days before the 1st
    const calendarGrid = [];
    for (let i = 0; i < startingDay; i++) {
        calendarGrid.push(<div key={`empty-${i}`} className="h-24 glass rounded-xl border-white/5 flex flex-col p-3 opacity-20"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        // Check if it's today
        const currentCellDate = new Date(year, month, d);
        const isToday = new Date().toDateString() === currentCellDate.toDateString();
        const dayEvents = events.filter(e => e.date.toDateString() === currentCellDate.toDateString());

        calendarGrid.push(
            <div
                key={`day-${d}`}
                onClick={() => openModal(currentCellDate)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, currentCellDate)}
                className={`h-16 md:h-24 py-1 px-1 md:p-2 glass rounded-xl flex flex-col hover:bg-white/5 transition-all cursor-pointer group ${isToday ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/50 shadow-[0_0_15px_rgba(19,91,236,0.1)]' : 'border-white/10'} ${dayEvents.length > 0 ? 'hover:-translate-y-1 transform duration-300 relative' : ''}`}
            >
                <div className="flex justify-between items-start w-full">
                    <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'dark:text-slate-300 text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}`}>{d}</span>
                    {dayEvents.length > 0 && (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded shadow-sm">{dayEvents.length}</span>
                    )}
                </div>

                {/* Event Chips */}
                <div className="mt-1 flex flex-col gap-1 w-full overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt, i) => (
                        <div
                            key={i}
                            draggable
                            onDragStart={(e) => handleDragStart(e, evt.id)}
                            onDragEnd={handleDragEnd}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal(currentCellDate, evt);
                            }}
                            className="w-full bg-primary/20 border border-primary/30 rounded px-1.5 py-0.5 truncate text-[9px] text-white flex items-center gap-1 shadow-sm hover:bg-primary/40 transition-colors pointer-events-auto cursor-grab active:cursor-grabbing"
                        >
                            <span className="size-1 rounded-full bg-mint shadow-[0_0_5px_rgba(45,212,191,0.8)]"></span>
                            <span className="truncate leading-tight">{evt.title}</span>
                        </div>
                    ))}
                    {dayEvents.length > 2 && (
                        <div className="w-full text-center text-[9px] text-slate-500 font-medium">+{dayEvents.length - 2} more</div>
                    )}
                </div>
            </div>
        );
    }

    // Pad the rest of the grid if necessary to keep the layout (optional, but good for grid stability)
    const remainingCells = 42 - calendarGrid.length; // 6 rows of 7
    for (let i = 0; i < remainingCells; i++) {
        calendarGrid.push(<div key={`empty-end-${i}`} className="h-24 glass rounded-xl border-white/5 flex flex-col p-3 opacity-20"></div>);
    }

    return (
        <div className="flex-1 flex flex-col xl:flex-row overflow-hidden relative">
            {/* Main 3D Timeline Area */}
            <div className="flex-1 relative perspective-view flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto scrollbar-hide">
                {/* Background Ambient Glows */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-personal-lavender/5 rounded-full blur-[120px] pointer-events-none"></div>

                {/* 3D Path */}
                {view === 'Month' && (
                    <div className="w-full max-w-full lg:max-w-4xl glass rounded-[1rem] sm:rounded-[2rem] p-4 sm:p-8 shadow-2xl border-white/5 relative overflow-hidden xl:tilt-container transition-transform duration-700 hover:rotate-0 mb-20 animate-[fadeIn_0.5s_ease-out]">
                        <div className="flex justify-between items-center mb-4 sm:mb-8">
                            <h2 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r dark:from-white from-slate-900 dark:to-slate-400 to-slate-600">{monthName} {year}</h2>
                            <div className="flex gap-1 sm:gap-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest dark:text-slate-500 text-slate-500">
                                <span className="text-center w-full"><span className="sm:hidden">Mo</span><span className="hidden sm:inline">Mon</span></span>
                                <span className="text-center w-full"><span className="sm:hidden">Tu</span><span className="hidden sm:inline">Tue</span></span>
                                <span className="text-center w-full"><span className="sm:hidden">We</span><span className="hidden sm:inline">Wed</span></span>
                                <span className="text-center w-full"><span className="sm:hidden">Th</span><span className="hidden sm:inline">Thu</span></span>
                                <span className="text-center w-full"><span className="sm:hidden">Fr</span><span className="hidden sm:inline">Fri</span></span>
                                <span className="text-center w-full"><span className="sm:hidden">Sa</span><span className="hidden sm:inline">Sat</span></span>
                                <span className="text-center w-full"><span className="sm:hidden">Su</span><span className="hidden sm:inline">Sun</span></span>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-3">
                            {calendarGrid}
                        </div>
                    </div>
                )}

                {view === 'Day' && (
                    <div className="w-full max-w-4xl glass rounded-[2rem] p-8 shadow-2xl border-white/5 relative overflow-y-auto h-[600px] scrollbar-hide animate-[fadeIn_0.5s_ease-out]">
                        <div className="flex justify-between items-center mb-8 sticky top-0 dark:bg-background-dark/80 bg-background-light/80 backdrop-blur-md pb-4 z-10 border-b border-white/5">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r dark:from-mint dark:to-white from-mint to-slate-800">{currentDate.toDateString()}</h2>
                            <span className="px-3 py-1 bg-mint/10 border border-mint/20 text-mint text-xs font-bold uppercase tracking-wider rounded-full">Focused Schedule</span>
                        </div>
                        <div className="flex flex-col gap-6 relative">
                            {/* Time indicators */}
                            <div className="absolute left-[3.5rem] top-0 bottom-0 w-px bg-slate-700/50 z-0 text-white"></div>

                            {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => {
                                const hEvents = events.filter(e => e.date.toDateString() === currentDate.toDateString() && e.hour === hour);
                                return (
                                    <div key={hour} className="flex gap-6 relative z-10 group min-h-[4rem]">
                                        <div className="w-12 text-right pt-2 text-xs font-mono text-slate-500 group-hover:text-slate-300 transition-colors uppercase">
                                            {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2 pt-1 border-t border-slate-700/30 group-hover:border-slate-600/50 transition-colors">
                                            {hEvents.length === 0 ? (
                                                <div className="h-10 w-full rounded border border-dashed border-slate-700/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 cursor-pointer">
                                                    <span className="text-[10px] text-slate-500">+ Click to Add</span>
                                                </div>
                                            ) : hEvents.map((evt, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => openModal(currentDate, evt)}
                                                    className="p-3 bg-slate-800 border-l-4 border-mint rounded shadow-lg flex justify-between items-center hover:-translate-y-0.5 transform transition-transform cursor-pointer group/card border border-white/5"
                                                >
                                                    <div>
                                                        <h4 className="text-sm font-bold dark:text-white text-slate-100 leading-tight">{evt.title}</h4>
                                                        <p className="text-[10px] text-slate-400 font-medium">Category: {evt.category} | Contact: {evt.contact}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-500 group-hover/card:text-mint transition-colors">arrow_forward_ios</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {view === 'Year' && (
                    <div className="w-full max-w-5xl glass rounded-[2rem] p-8 shadow-2xl border-white/5 relative overflow-hidden animate-[fadeIn_0.5s_ease-out]">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary dark:from-personal-lavender dark:to-white to-slate-800">{year} Overview</h2>
                            <div className="flex gap-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-primary"></div> Active Periods</span>
                                <span className="flex items-center gap-1 ml-4"><div className="size-2 rounded-full bg-slate-700"></div> Low Activity</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {Array.from({ length: 12 }, (_, i) => {
                                const mDate = new Date(year, i, 1);
                                const mName = mDate.toLocaleString('default', { month: 'short' });
                                // Heatmap visualization mockup
                                const isActive = events.some(e => e.date.getMonth() === i && e.date.getFullYear() === year);
                                return (
                                    <div key={i} className="glass border-white/5 rounded-xl p-4 flex flex-col items-center justify-center group hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden">
                                        {isActive && <div className="absolute inset-0 bg-primary/10 blur-xl z-0 pointer-events-none"></div>}
                                        <h3 className={`text-sm font-bold tracking-widest uppercase mb-4 relative z-10 ${isActive ? 'dark:text-white text-slate-800' : 'text-slate-500'}`}>{mName}</h3>
                                        <div className="grid grid-cols-4 gap-1 relative z-10">
                                            {Array.from({ length: 16 }, (_, j) => (
                                                <div key={j} className={`size-2 rounded-sm ${isActive && Math.random() > 0.5 ? 'bg-primary/80 shadow-[0_0_5px_rgba(19,91,236,0.8)]' : 'bg-slate-700/50'}`}></div>
                                            ))}
                                        </div>
                                        {isActive && <span className="absolute bottom-2 text-[8px] font-bold text-primary tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Explore</span>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Timeline Navigation Controls */}
                <div className="fixed bottom-10 flex gap-4 z-20">
                    <button onClick={handlePrevMonth} className="size-12 glass rounded-full flex items-center justify-center hover:bg-white/10 hover:shadow-lg transition-all text-slate-300 hover:text-white active:scale-95">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="px-8 glass rounded-full flex items-center gap-2 text-sm font-medium hover:bg-white/10 hover:shadow-lg transition-all dark:text-slate-200 text-slate-700 dark:hover:text-white hover:text-slate-900 active:scale-95">
                        {monthName} {year}
                    </button>
                    <button onClick={handleNextMonth} className="size-12 glass rounded-full flex items-center justify-center hover:bg-white/10 hover:shadow-lg transition-all text-slate-300 hover:text-white active:scale-95">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* Right Sidebar: AI Insights */}
            <aside className="w-full xl:w-80 h-auto xl:h-full shrink-0 glass border-t xl:border-t-0 xl:border-l border-slate-700/30 bg-slate-900/40 backdrop-blur-3xl flex flex-col p-6 overflow-y-auto relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-3 mb-8">
                    <span className="material-symbols-outlined text-primary">insights</span>
                    <h3 className="text-lg font-semibold tracking-tight dark:text-white text-slate-800">AI Insights</h3>
                </div>

                <div className="space-y-6 flex-1">
                    <section className="mb-8">
                        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">View Switcher</h4>
                        <div className="flex p-1 glass rounded-xl bg-slate-800/50">
                            <button onClick={() => setView('Day')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${view === 'Day' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}>Day</button>
                            <button onClick={() => setView('Month')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${view === 'Month' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}>Month</button>
                            <button onClick={() => setView('Year')} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${view === 'Year' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}>Year</button>
                        </div>
                    </section>

                    {/* Blank States for sections */}
                    <section>
                        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">Smart Categorization</h4>
                        <div className="p-6 text-center border-2 border-dashed border-slate-700/50 rounded-xl">
                            <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">auto_Awesome</span>
                            <p className="text-xs text-slate-500">No categorizations yet. Schedule events to see AI suggestions.</p>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">Aether Assistant</h4>
                        <div className="p-6 text-center border-2 border-dashed border-slate-700/50 rounded-xl">
                            <span className="material-symbols-outlined text-slate-600 text-3xl mb-2">assistant</span>
                            <p className="text-xs text-slate-500">Assistant is resting. Add more meetings for scheduling tips.</p>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">Engagement Hub</h4>
                        <div className="flex items-center gap-4 glass p-3 rounded-xl border border-slate-700/50">
                            <div className="size-10 rounded-lg bg-slate-800/80 flex items-center justify-center border border-slate-700">
                                <span className="material-symbols-outlined text-slate-500">{events.length > 0 ? 'groups' : 'group_off'}</span>
                            </div>
                            <div>
                                <p className={`text-xs font-medium ${events.length > 0 ? 'text-white' : 'text-slate-400'}`}>{events.length} Meetings Scheduled</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Overall</p>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 p-3 glass rounded-xl cursor-pointer hover:bg-white/10 transition-all border border-transparent hover:border-slate-600">
                        <span className="material-symbols-outlined text-slate-400">settings</span>
                        <span className="text-xs font-semibold text-slate-300">Timeline Settings</span>
                    </div>
                </div>
            </aside>

            {/* Event Edit/Add Modal Overlay */}
            {isModalOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isAnimatingOut ? 'opacity-0 backdrop-blur-none bg-black/0' : 'opacity-100 backdrop-blur-sm bg-black/60'}`}>
                    {/* Click outside to close */}
                    <div className="absolute inset-0" onClick={closeModal}></div>

                    {/* Modal Content */}
                    <div className={`relative w-full max-w-md apple-liquid-glass rounded-2xl p-6 shadow-2xl transition-all duration-300 transform ${isAnimatingOut ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}>
                        <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors size-8 flex items-center justify-center rounded-full hover:bg-white/10">
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <h3 className="text-xl font-bold dark:text-white text-slate-900 mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">{editingEvent ? 'edit_calendar' : 'add_circle'}</span>
                            {editingEvent ? 'Edit Event' : 'New Event'}
                        </h3>
                        {selectedDate && (
                            <p className="text-xs font-semibold dark:text-mint text-primary uppercase tracking-wider mb-6 pb-4 border-b border-slate-700/50">
                                {selectedDate.toDateString()}
                            </p>
                        )}

                        <form onSubmit={handleSaveEvent} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g. Team Sync"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">Time</label>
                                    <input
                                        type="time"
                                        required
                                        value={formTime}
                                        onChange={(e) => setFormTime(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">Category</label>
                                    <select
                                        value={formCategory}
                                        onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                                    >
                                        <option value="Work">Work</option>
                                        <option value="Personal">Personal</option>
                                        <option value="Dining">Dining</option>
                                        <option value="Call">Call</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1 uppercase tracking-wider">Contact (Optional)</label>
                                <input
                                    type="text"
                                    value={formContact}
                                    onChange={(e) => setFormContact(e.target.value)}
                                    placeholder="e.g. Sarah"
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner"
                                />
                            </div>

                            {/* AI Context Section - Only show if editing an existing event */}
                            {editingEvent && (
                                <div className="pt-2 border-t border-slate-700/50 mt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-mint flex items-center gap-1 uppercase tracking-wider">
                                            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                                            Aether Insights
                                        </label>
                                        {!aiContext && !isGeneratingContext && (
                                            <button
                                                type="button"
                                                onClick={generateAIContext}
                                                className="text-[10px] font-bold bg-mint/10 text-mint border border-mint/20 px-2 py-1 rounded hover:bg-mint/20 transition-colors"
                                            >
                                                Generate Note
                                            </button>
                                        )}
                                    </div>

                                    {isGeneratingContext ? (
                                        <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-700/50 flex items-center gap-3">
                                            <span className="material-symbols-outlined text-mint animate-spin text-sm">sync</span>
                                            <span className="text-xs text-slate-400 italic">Analyzing event context...</span>
                                        </div>
                                    ) : aiContext ? (
                                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs text-slate-300 leading-relaxed">
                                            {aiContext}
                                        </div>
                                    ) : null}
                                </div>
                            )}

                            <div className="pt-6 flex items-center justify-between">
                                {editingEvent ? (
                                    <button
                                        type="button"
                                        onClick={handleDeleteEvent}
                                        className="text-red-400 hover:text-red-300 text-sm font-semibold flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-red-400/10"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                        Delete
                                    </button>
                                ) : (
                                    <div></div> // Spacer
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 rounded-lg text-sm font-semibold dark:text-slate-300 text-slate-700 hover:bg-slate-800 hover:text-white transition-all border border-transparent dark:hover:border-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
