
import React, { useState, useEffect, useRef } from 'react';
import { CarouselProject, Slide, Position, PresetStyle, AdditionalText, AIAsset } from '../types';
import { generateImage, suggestAssets } from '../services/geminiService';
import { SlideRenderer } from './SlideRenderer';
import { BrandColorExtractor } from './BrandColorExtractor';
import { ContrastChecker } from './ContrastChecker';

interface EditorScreenProps {
    project: CarouselProject;
    onUpdateSlide: (slideId: string, updates: Partial<Slide>) => void;
    onUpdateProject: (updates: Partial<CarouselProject>) => void;
    onOpenThemeModal: () => void;
    onAddSlide: () => void;
    onDeleteSlide: (index: number) => void;
    onDuplicateSlide: (index: number) => void;
    onMoveSlide: (index: number, direction: 'up' | 'down') => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({ 
    project, onUpdateSlide, onUpdateProject, onOpenThemeModal, onAddSlide, onDeleteSlide
}) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'editor' | 'design' | 'templates'>('editor');
    const [isSuggestingIcons, setIsSuggestingIcons] = useState(false);
    const [suggestedIcons, setSuggestedIcons] = useState<string[]>([]);
    
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [tempPositions, setTempPositions] = useState<{[key: string]: Position}>({});

    const activeSlide = project.slides[activeSlideIndex];

    const handleMouseDown = (e: React.MouseEvent, id: string, currentX: number = 0, currentY: number = 0) => {
        if (e.button !== 0) return;
        setDraggingId(id);
        setDragOffset({ x: e.clientX - currentX, y: e.clientY - currentY });
        const init: {[key: string]: Position} = { 
            title: activeSlide.titlePosition || {x:0, y:0}, 
            content: activeSlide.contentPosition || {x:0, y:0},
            brand: project.brandConfig.position || {x:0, y:0}
        };
        activeSlide.additionalAssets?.forEach(a => init[`asset-${a.id}`] = a.position || {x:0, y:0});
        setTempPositions(init);
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!draggingId) return;
            setTempPositions(prev => ({ ...prev, [draggingId]: { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } }));
        };
        const handleUp = () => {
            if (!draggingId) return;
            const final = tempPositions[draggingId];
            if (final) {
                if (draggingId === 'title') onUpdateSlide(activeSlide.id, { titlePosition: final });
                else if (draggingId === 'content') onUpdateSlide(activeSlide.id, { contentPosition: final });
                else if (draggingId === 'brand') onUpdateProject({ brandConfig: { ...project.brandConfig, position: final } });
                else if (draggingId.startsWith('asset-')) {
                    const id = draggingId.replace('asset-', '');
                    onUpdateSlide(activeSlide.id, { additionalAssets: activeSlide.additionalAssets?.map(a => a.id === id ? { ...a, position: final } : a) });
                }
            }
            setDraggingId(null);
        };
        if (draggingId) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
        }
        return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
    }, [draggingId, dragOffset, tempPositions, activeSlide, project.brandConfig]);

    const handleSuggestIcons = async () => {
        setIsSuggestingIcons(true);
        const icons = await suggestAssets(activeSlide.title, activeSlide.content);
        setSuggestedIcons(icons);
        setIsSuggestingIcons(false);
    };

    const addIconToSlide = (iconName: string) => {
        const newAsset: AIAsset = {
            id: Date.now().toString(),
            type: 'icon',
            value: iconName,
            position: { x: 150, y: 200 },
            size: 60,
            color: project.primaryColor
        };
        onUpdateSlide(activeSlide.id, { additionalAssets: [...(activeSlide.additionalAssets || []), newAsset] });
    };

    const handleAutoFixContrast = () => {
        onUpdateSlide(activeSlide.id, { bgOverlayOpacity: 0.7, bgBlur: 5 });
    };

    return (
        <div className="flex flex-1 overflow-hidden h-full bg-[#0d0f14]">
            <aside className="w-[72px] flex flex-col items-center bg-[#111318] border-r border-[#282e39] py-4 gap-4 z-10 shrink-0">
                <button onClick={handleSuggestIcons} className="p-2 rounded-lg text-purple-400 hover:text-white hover:bg-purple-600/20 w-12 h-12 flex flex-col items-center justify-center bg-purple-400/5">
                    <span className="material-symbols-outlined text-[24px]">auto_fix_high</span>
                    <span className="text-[8px] font-bold mt-1 uppercase">Icons</span>
                </button>
                <button onClick={() => setActiveTab('design')} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#282e39] w-12 h-12 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">palette</span>
                    <span className="text-[8px] font-bold mt-1 uppercase">Style</span>
                </button>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="flex-1 flex items-center justify-center p-12 bg-[#0b0e14] relative">
                    <div className="relative transform scale-[1.05]">
                        <ContrastChecker bgColor={project.primaryColor} onFix={handleAutoFixContrast} />
                        <SlideRenderer 
                            slide={activeSlide} 
                            presetStyle={project.presetStyle} 
                            brandConfig={project.brandConfig} 
                            slideIndex={activeSlideIndex} 
                            totalSlides={project.slides.length} 
                            draggingId={draggingId}
                            tempPositions={draggingId ? tempPositions : undefined}
                            onTextChange={(f, v) => onUpdateSlide(activeSlide.id, { [f]: v })}
                            onMouseDown={handleMouseDown}
                        />
                    </div>
                </div>

                <div className="h-32 bg-[#111318] border-t border-[#282e39] flex items-center gap-4 px-6 overflow-x-auto shrink-0 shadow-2xl z-20">
                    {project.slides.map((s, idx) => (
                        <div key={s.id} onClick={() => setActiveSlideIndex(idx)} className={`shrink-0 w-20 aspect-[4/5] rounded-lg border-2 overflow-hidden cursor-pointer ${activeSlideIndex === idx ? 'border-primary scale-105' : 'border-[#282e39] opacity-60'}`} style={{backgroundImage: s.backgroundImage, backgroundSize: 'cover'}} />
                    ))}
                    <button onClick={onAddSlide} className="shrink-0 w-20 aspect-[4/5] rounded-lg border-2 border-dashed border-[#282e39] flex items-center justify-center text-gray-500">+</button>
                </div>
            </main>

            <aside className="w-80 bg-[#111318] border-l border-[#282e39] flex flex-col z-20 overflow-y-auto">
                <div className="p-6 space-y-8">
                    {activeTab === 'design' && (
                        <div className="space-y-6">
                            <BrandColorExtractor onColorExtracted={(c) => onUpdateProject({ primaryColor: c })} />
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Icon Suggestions</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {isSuggestingIcons ? <div className="col-span-3 text-center py-4 animate-pulse text-xs">Asking Gemini...</div> : 
                                        suggestedIcons.map(icon => (
                                            <button key={icon} onClick={() => addIconToSlide(icon)} className="p-3 bg-[#1e232d] hover:bg-primary/20 hover:text-primary rounded-xl border border-white/5 flex flex-col items-center gap-1 transition-all">
                                                <span className="material-symbols-outlined">{icon}</span>
                                            </button>
                                        ))
                                    }
                                    {!isSuggestingIcons && suggestedIcons.length === 0 && (
                                        <button onClick={handleSuggestIcons} className="col-span-3 py-2 border border-dashed border-gray-600 rounded-xl text-[10px] text-gray-500 hover:text-white">Refresh Suggestions</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'editor' && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase">Text Editor</label>
                            <textarea value={activeSlide.title} onChange={(e) => onUpdateSlide(activeSlide.id, { title: e.target.value })} className="w-full bg-[#1e232d] border border-white/5 rounded-xl p-3 text-sm h-24 outline-none focus:ring-1 focus:ring-primary" />
                            <textarea value={activeSlide.content} onChange={(e) => onUpdateSlide(activeSlide.id, { content: e.target.value })} className="w-full bg-[#1e232d] border border-white/5 rounded-xl p-3 text-sm h-32 outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
};
