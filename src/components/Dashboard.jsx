import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini SDK with the provided key
// In a real production app, this should be an environment variable
const genAI = new GoogleGenerativeAI('AIzaSyAcajZ2Eih9DsRVYAzufcXHGZab-YLO_yg');

export default function Dashboard({ events, setEvents }) {
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [proposedEvent, setProposedEvent] = useState(null);

    // Existing blank timeline
    const timelineHours = Array.from({ length: 14 }, (_, i) => i + 9); // 9 AM to 10 PM

    const handlePromptSubmit = async (e) => {
        if (e.key === 'Enter' && prompt.trim()) {
            setIsProcessing(true);

            try {
                // Initialize the model
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

                // Construct a strict prompt asking for JSON back
                const systemPrompt = `
You are an AI Smart Scheduling Assistant processing natural language input into a structured event object.
The user wants to schedule an event. Your job is to extract or infer the details and output raw JSON ONLY. 

Please extract the following keys:
1. "title": A clean, concise title for the event based on what was said.
2. "hour": An integer between 9 and 22 representing the hour of the day (9 AM to 10 PM in 24h time).
3. "time": A short string describing the time in English, e.g., "Today at 2 PM".
4. "category": Choose the single best fit from ["Work", "Personal", "Dining", "Call", "Fitness", "General"].
5. "contact": The name of the person they are meeting with, if applicable, otherwise "None".

Example JSON format:
{
  "title": "Lunch with Sarah",
  "hour": 13,
  "time": "Today at 1 PM",
  "category": "Dining",
  "contact": "Sarah"
}

Now parse this user request: "${prompt}"
Output nothing but the raw JSON block.`;

                const result = await model.generateContent(systemPrompt);
                const responseText = result.response.text();

                // Clean the output (remove markdown fences if any)
                let cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

                const parsedData = JSON.parse(cleanedText);

                // Ensure hour is within bounds
                let boundedHour = parsedData.hour;
                if (!boundedHour || boundedHour < 9 || boundedHour > 22) boundedHour = 14;

                setProposedEvent({
                    title: parsedData.title || prompt,
                    category: parsedData.category || 'General',
                    contact: parsedData.contact || 'None',
                    time: parsedData.time || 'Today at 2 PM',
                    hour: boundedHour,
                });
            } catch (error) {
                console.error("AI Generation Error:", error);
                // Fallback to basic extraction if Gemini fails
                setProposedEvent({
                    title: prompt,
                    category: 'General',
                    contact: 'None',
                    time: 'Today at 2 PM',
                    hour: 14,
                });
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleCancel = () => {
        setPrompt('');
        setProposedEvent(null);
    };

    const handleCreateEvent = () => {
        if (proposedEvent) {
            setEvents([...events, { ...proposedEvent, date: new Date(), title: prompt }]);
            setPrompt('');
            setProposedEvent(null);
        }
    };

    return (
        <div className="relative flex-1 flex flex-col overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 blur-xl opacity-50 scale-105 pointer-events-none">
                <div className="flex h-full grow flex-col">
                    <main className="p-4 sm:p-20 flex flex-col lg:flex-row gap-4 sm:gap-8">
                        <div className="flex-1 h-[400px] sm:h-[600px] bg-slate-800/20 rounded-xl border border-slate-800"></div>
                        <div className="w-full lg:w-80 h-[300px] sm:h-[600px] bg-slate-800/20 rounded-xl border border-slate-800"></div>
                    </main>
                </div>
            </div>

            {/* Main Interactive Modals over background */}
            <div className="relative z-10 flex-1 overflow-y-auto pt-8 sm:pt-16 pb-24 px-4 sm:px-8 flex items-start justify-center">
                {/* Modal Container */}
                <div className="glass-morphism w-full max-w-3xl rounded-xl shadow-2xl border border-slate-700/50 mt-4 sm:mt-10">

                    {/* Search & Input Section */}
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
                            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">AI Smart Scheduler</h2>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-mint/20 to-primary/20 rounded-xl blur opacity-30 group-focus-within:opacity-100 transition duration-500"></div>
                            <div className="relative flex flex-col gap-4 bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500">search</span>
                                    <input
                                        type="text"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={handlePromptSubmit}
                                        placeholder="Type an event description e.g., 'Lunch with team on Friday at noon' (Press Enter)"
                                        className="flex-1 text-xl font-medium tracking-tight bg-transparent border-none outline-none focus:ring-0 text-white placeholder-slate-500 w-full"
                                        disabled={isProcessing}
                                    />
                                    {isProcessing && <span className="material-symbols-outlined animate-spin text-primary">sync</span>}
                                </div>
                            </div>
                        </div>

                        {/* AI Tag Indicators */}
                        {proposedEvent && (
                            <div className="flex flex-wrap gap-3 mt-6">
                                <div className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-primary/10 border border-primary/20 px-4 text-primary neon-glow-lavender hover:bg-primary/20 transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-[18px]">category</span>
                                    <p className="text-sm font-semibold leading-normal">Category: {proposedEvent.category}</p>
                                </div>
                                <div className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-mint/10 border border-mint/20 px-4 text-mint neon-glow-mint hover:bg-mint/20 transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                    <p className="text-sm font-semibold leading-normal">Contact: {proposedEvent.contact}</p>
                                </div>
                                <div className="flex h-9 items-center justify-center gap-x-2 rounded-full bg-lavender/10 border border-lavender/20 px-4 text-lavender neon-glow-lavender hover:bg-lavender/20 transition-colors cursor-pointer">
                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                    <p className="text-sm font-semibold leading-normal">Time: {proposedEvent.time}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 3D Timeline Preview Section */}
                    <div className="mt-4 border-t border-slate-700/50 bg-slate-900/40 relative">
                        <div className="px-4 sm:px-8 py-4 flex justify-between items-center relative z-20">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Smart Preview: Timeline</h3>
                            <div className="flex gap-2">
                                <button className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors">
                                    <span className="material-symbols-outlined text-sm">unfold_more</span>
                                </button>
                            </div>
                        </div>

                        <div className="h-64 relative overflow-y-auto timeline-grid perspective-[1000px] scrollbar-hide">
                            {/* Perspective Container */}
                            <div className="relative flex flex-col transform rotate-x-[25deg] origin-top py-8">

                                {timelineHours.map(hour => {
                                    const hourEvents = events.filter(e => e.date.toDateString() === new Date().toDateString() && e.hour === hour);

                                    return (
                                        <div key={hour} className={`relative w-full h-16 border-y ${proposedEvent && proposedEvent.hour === hour ? 'border-primary/20 bg-primary/5' : 'border-slate-800/50 hover:bg-slate-800/20'} flex items-center px-4 sm:px-12 transition-colors cursor-default group`}>
                                            <span className={`text-[10px] ${proposedEvent && proposedEvent.hour === hour ? 'text-primary/80' : 'text-slate-600'} absolute left-2 font-mono bg-slate-900/40 sm:bg-transparent px-1 rounded`}>
                                                {hour.toString().padStart(2, '0')}:00
                                            </span>

                                            {/* Render Confirmed Events */}
                                            {hourEvents.map((evt, idx) => (
                                                <div key={idx} className="h-12 w-48 sm:w-64 bg-slate-800 border-2 border-slate-600 rounded-lg ml-12 sm:ml-40 flex items-center px-2 sm:px-4 gap-2 sm:gap-3 z-10 hover:border-slate-400 transition-colors cursor-pointer absolute shadow-md">
                                                    <span className="material-symbols-outlined text-slate-300 text-base sm:text-lg">event_available</span>
                                                    <div className="truncate text-left w-full">
                                                        <p className="text-xs text-white font-bold leading-none truncate">{evt.title}</p>
                                                        <p className="text-[10px] text-slate-400 leading-tight">Confirmed</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Render Proposed Event overlaying if conflicts (simplified for prototype) */}
                                            {proposedEvent && proposedEvent.hour === hour && (
                                                <div className="h-12 w-48 sm:w-64 bg-primary border-2 border-mint/40 rounded-lg ml-12 sm:ml-40 flex items-center px-2 sm:px-4 gap-2 sm:gap-3 shadow-[0_0_30px_rgba(19,91,236,0.3)] relative z-20 transform transition-transform group-hover:scale-[1.02] group-hover:-translate-y-1">
                                                    <span className="material-symbols-outlined text-white text-base sm:text-lg">event</span>
                                                    <div className="truncate text-left w-full">
                                                        <p className="text-xs text-white font-bold leading-none truncate">{prompt}</p>
                                                        <p className="text-[10px] text-white/70 leading-tight">AI Generated</p>
                                                    </div>
                                                </div>
                                            )}

                                            {proposedEvent && proposedEvent.hour === hour && (
                                                <div className="absolute right-2 sm:right-12 flex gap-2 sm:gap-4 z-20">
                                                    <div className="hidden sm:flex items-center gap-1 text-[10px] text-mint font-bold uppercase tracking-tighter bg-mint/10 px-2 py-1 rounded-full border border-mint/20">
                                                        <span className="material-symbols-outlined text-xs">check_circle</span> {hourEvents.length > 0 ? "Replaces existing?" : "No Conflicts"}
                                                    </div>
                                                    <div className="sm:hidden flex items-center justify-center size-6 bg-mint/10 rounded-full border border-mint/20 text-mint">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}

                            </div>

                            {/* Gradient Fades */}
                            <div className="sticky top-0 inset-x-0 h-12 bg-gradient-to-b from-[#101622] to-transparent z-10 pointer-events-none"></div>
                            <div className="sticky bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#101622] to-transparent z-10 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-slate-700/50 bg-slate-900/80 gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 text-xs text-slate-500 order-2 sm:order-1">
                            <kbd className="px-1.5 py-0.5 rounded border border-slate-600 bg-slate-800 font-mono text-slate-300">Tab</kbd>
                            <span>to iterate suggestions</span>
                        </div>
                        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
                            <button onClick={handleCancel} className="px-5 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
                            <button
                                onClick={handleCreateEvent}
                                className={`flex items-center gap-2 px-6 py-2 text-white text-sm font-bold rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${proposedEvent ? 'bg-primary shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/50' : 'bg-slate-700 text-slate-400 cursor-not-allowed hidden'}`}
                                disabled={!proposedEvent}
                            >
                                Create Event
                                <span className="material-symbols-outlined text-sm">keyboard_return</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
