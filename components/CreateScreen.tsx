import React, { useState } from 'react';
import { CarouselTone } from '../types';

interface CreateScreenProps {
    onGenerate: (topic: string, tone: CarouselTone, length: number, language: string) => void;
    isGenerating: boolean;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ onGenerate, isGenerating }) => {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState<CarouselTone>(CarouselTone.Professional);
    const [length, setLength] = useState(7);
    const [language, setLanguage] = useState<string>('English');

    const handleGenerate = () => {
        if (!topic.trim()) return;
        onGenerate(topic, tone, length, language);
    };

    return (
        <div className="flex flex-1 overflow-hidden relative h-full">
            {/* Left Sidebar: Configuration */}
            <aside className="w-full max-w-[400px] flex flex-col bg-white dark:bg-[#111318] border-r border-slate-200 dark:border-[#282e39] overflow-y-auto z-10 shadow-lg md:shadow-none">
                <div className="p-6 pb-2">
                    <h1 className="text-3xl font-black leading-tight tracking-[-0.033em] mb-2 text-slate-900 dark:text-white">Create New Carousel</h1>
                    <p className="text-slate-500 dark:text-[#9da6b9] text-sm leading-normal">Enter a topic below to generate engaging slides with AI assistance.</p>
                </div>

                <div className="flex flex-col gap-8 p-6">
                    {/* Topic Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#9da6b9]">Topic</label>
                        <div className="relative">
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-[#1e232d] border border-slate-200 dark:border-[#3b4354] rounded-xl p-4 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-32 placeholder:text-slate-400 dark:placeholder:text-[#64748b] text-slate-900 dark:text-white"
                                placeholder="e.g. 5 Proven Strategies for Remote Team Productivity..."
                                maxLength={200}
                            />
                            <div className="absolute bottom-3 right-3 text-xs text-slate-400">{topic.length}/200</div>
                        </div>
                    </div>

                    {/* Language Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#9da6b9]">Language</label>
                        <div className="flex gap-3">
                            {['English', 'Indonesian'].map((lang) => (
                                 <label key={lang} className="group relative cursor-pointer flex-1">
                                    <input
                                        type="radio"
                                        name="language"
                                        className="peer sr-only"
                                        checked={language === lang}
                                        onChange={() => setLanguage(lang)}
                                    />
                                    <div className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#3b4354] px-4 py-3 text-sm font-medium text-slate-700 dark:text-white transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary dark:peer-checked:text-white dark:peer-checked:border-primary hover:border-slate-300 dark:hover:border-slate-600">
                                        {lang === 'Indonesian' ? '🇮🇩 Indonesian' : '🇺🇸 English'}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Tone Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#9da6b9]">Tone of Voice</label>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.values(CarouselTone).map((t) => (
                                <label key={t} className="group relative cursor-pointer">
                                    <input
                                        type="radio"
                                        name="tone"
                                        className="peer sr-only"
                                        checked={tone === t}
                                        onChange={() => setTone(t)}
                                    />
                                    <div className="flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#3b4354] px-4 py-3 text-sm font-medium text-slate-700 dark:text-white transition-all peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary dark:peer-checked:text-white dark:peer-checked:border-primary hover:border-slate-300 dark:hover:border-slate-600">
                                        {t}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Slide Count */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#9da6b9]">Length</label>
                            <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">{length} Slides</span>
                        </div>
                        <div className="relative w-full h-6 flex items-center">
                            <input
                                type="range"
                                min="3"
                                max="10"
                                value={length}
                                onChange={(e) => setLength(parseInt(e.target.value))}
                                className="w-full h-1 bg-slate-200 dark:bg-[#3b4354] rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 px-1">
                            <span>3</span>
                            <span>5</span>
                            <span>7</span>
                            <span>10</span>
                        </div>
                    </div>
                </div>

                {/* Action Area */}
                <div className="mt-auto p-6 border-t border-slate-200 dark:border-[#282e39] bg-slate-50 dark:bg-[#151a23]">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !topic.trim()}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary h-12 px-6 text-white text-base font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <span className="animate-spin material-symbols-outlined text-[20px]">progress_activity</span>
                                Generating...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">auto_awesome</span>
                                Generate Content
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-3">Estimated time: ~15 seconds</p>
                </div>
            </aside>

            {/* Right Side: Preview (Empty State) */}
            <main className="flex-1 flex flex-col bg-[#f0f2f5] dark:bg-[#0b0e14] relative overflow-hidden">
                {/* Floating Toolbar (Visual Only) */}
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2 p-2 bg-white dark:bg-[#1e232d] rounded-2xl shadow-xl border border-slate-200 dark:border-[#282e39]">
                    {['title', 'image', 'shapes', 'palette'].map(icon => (
                        <button key={icon} className="size-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined">{icon}</span>
                        </button>
                    ))}
                </div>

                {/* Canvas Area */}
                <div className="flex-1 flex items-center justify-center p-8 md:pl-24 overflow-hidden relative">
                    <div className="relative w-full max-w-[400px] aspect-[4/5] bg-white dark:bg-[#1e232d] rounded-xl shadow-2xl flex flex-col items-center justify-center text-center p-8 border border-slate-200 dark:border-[#282e39] group">
                        {/* Decorative Grid Pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none rounded-xl overflow-hidden">
                            <svg height="100%" width="100%">
                                <defs>
                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />
                            </svg>
                        </div>
                        
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-[#111318] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-600">post_add</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Ready to create?</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[240px] leading-relaxed">
                            Configure your topic on the left and hit "Generate" to see the magic happen.
                        </p>
                    </div>
                </div>

                {/* Bottom Slide Strip (Empty) */}
                <div className="h-40 bg-white dark:bg-[#111318] border-t border-slate-200 dark:border-[#282e39] flex flex-col shrink-0">
                    <div className="px-6 py-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#9da6b9]">Timeline</span>
                        <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">fit_screen</span>
                        </button>
                    </div>
                    <div className="flex-1 flex items-center gap-4 px-6 overflow-x-auto pb-2">
                        <button className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-[#3b4354] flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-slate-50 dark:hover:bg-[#1e232d] transition-colors group">
                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">add</span>
                            <span className="text-[10px] font-bold text-slate-400 group-hover:text-primary">Add Slide</span>
                        </button>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="shrink-0 w-24 h-24 rounded-lg bg-slate-100 dark:bg-[#1e232d] border border-slate-200 dark:border-[#282e39] flex items-center justify-center opacity-30">
                                <span className="text-xs font-bold text-slate-400">{i}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};