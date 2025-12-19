
import React, { useState, useEffect, useRef } from 'react';
import { CarouselProject, Slide, Position, PresetStyle, AIAsset, AspectRatio, TextStyle } from '../types';
import { suggestAssets, generateImage } from '../services/geminiService';
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

const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Anton', 'Bebas Neue', 'Oswald', 'Montserrat'];

export const EditorScreen: React.FC<EditorScreenProps> = ({ 
    project, onUpdateSlide, onUpdateProject, onOpenThemeModal, onAddSlide, onDeleteSlide
}) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'editor' | 'design' | 'typography'>('editor');
    const [isSuggestingIcons, setIsSuggestingIcons] = useState(false);
    const [suggestedIcons, setSuggestedIcons] = useState<string[]>([]);
    
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [tempPositions, setTempPositions] = useState<{[key: string]: Position}>({});

    const activeSlide = project.slides[activeSlideIndex] || project.slides[0];

    const handleMouseDown = (e: React.MouseEvent, id: string, currentX: number = 0, currentY: number = 0) => {
        if (e.button !== 0) return;
        setDraggingId(id);
        setDragOffset({ x: e.clientX - currentX, y: e.clientY - currentY });
        const init: any = { 
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
            position: { x: 50, y: 50 },
            size: 64,
            color: project.primaryColor,
            zIndex: 20
        };
        onUpdateSlide(activeSlide.id, { additionalAssets: [...(activeSlide.additionalAssets || []), newAsset] });
    };

    const updateTextStyle = (type: 'title' | 'content', updates: Partial<TextStyle>) => {
        const field = type === 'title' ? 'titleStyle' : 'contentStyle';
        onUpdateSlide(activeSlide.id, { [field]: { ...activeSlide[field], ...updates } });
    };

    return (
        <div className="flex flex-1 overflow-hidden h-full bg-[#0d0f14]">
            <aside className="w-[72px] flex flex-col items-center bg-[#111318] border-r border-[#282e39] py-4 gap-4 z-30 shrink-0">
                <button onClick={() => setActiveTab('editor')} className={`p-2 rounded-lg w-12 h-12 flex flex-col items-center justify-center transition-all ${activeTab === 'editor' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
                    <span className="material-symbols-outlined">edit_note</span>
                    <span className="text-[8px] font-bold mt-1 uppercase">Main</span>
                </button>
                <button onClick={() => setActiveTab('typography')} className={`p-2 rounded-lg w-12 h-12 flex flex-col items-center justify-center transition-all ${activeTab === 'typography' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
                    <span className="material-symbols-outlined">format_size</span>
                    <span className="text-[8px] font-bold mt-1 uppercase">Type</span>
                </button>
                <button onClick={() => setActiveTab('design')} className={`p-2 rounded-lg w-12 h-12 flex flex-col items-center justify-center transition-all ${activeTab === 'design' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
                    <span className="material-symbols-outlined">palette</span>
                    <span className="text-[8px] font-bold mt-1 uppercase">Style</span>
                </button>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0b0e14]">
                <div className="flex-1 flex items-center justify-center p-8 relative overflow-auto">
                    <div className="relative">
                        <ContrastChecker bgColor={project.primaryColor} onFix={() => onUpdateSlide(activeSlide.id, { bgOverlayOpacity: 0.7, bgBlur: 10 })} />
                        <SlideRenderer 
                            slide={activeSlide} 
                            presetStyle={project.presetStyle} 
                            aspectRatio={project.aspectRatio}
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

                <div className="h-32 bg-[#111318] border-t border-[#282e39] flex items-center gap-4 px-6 overflow-x-auto shrink-0 z-30 shadow-2xl">
                    {project.slides.map((s, idx) => (
                        <div key={s.id} onClick={() => setActiveSlideIndex(idx)} className={`shrink-0 w-20 aspect-[4/5] rounded-lg border-2 overflow-hidden cursor-pointer ${activeSlideIndex === idx ? 'border-primary scale-105' : 'border-[#282e39] opacity-60'}`} style={{backgroundImage: s.backgroundImage, backgroundSize: 'cover'}} />
                    ))}
                    <button onClick={onAddSlide} className="shrink-0 w-20 aspect-[4/5] rounded-lg border-2 border-dashed border-[#282e39] flex items-center justify-center text-gray-500">+</button>
                </div>
            </main>

            <aside className="w-80 bg-[#111318] border-l border-[#282e39] flex flex-col z-40 overflow-y-auto overflow-x-hidden">
                <div className="p-6 space-y-8">
                    {activeTab === 'typography' && (
                        <div className="space-y-6">
                            <section className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Title Typography</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => updateTextStyle('title', { bold: !activeSlide.titleStyle?.bold })} className={`p-2 rounded-lg border ${activeSlide.titleStyle?.bold ? 'bg-primary text-white' : 'bg-white/5 border-white/10'}`}>Bold</button>
                                    <button onClick={() => updateTextStyle('title', { italic: !activeSlide.titleStyle?.italic })} className={`p-2 rounded-lg border ${activeSlide.titleStyle?.italic ? 'bg-primary text-white' : 'bg-white/5 border-white/10'}`}>Italic</button>
                                </div>
                                <select value={activeSlide.titleStyle?.fontFamily} onChange={(e) => updateTextStyle('title', { fontFamily: e.target.value })} className="w-full bg-[#1e232d] border border-white/10 p-2 rounded text-xs">
                                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] text-gray-500"><span>SIZE</span><span>{activeSlide.titleStyle?.fontSize}px</span></div>
                                    <input type="range" min="20" max="100" value={activeSlide.titleStyle?.fontSize} onChange={(e) => updateTextStyle('title', { fontSize: parseInt(e.target.value) })} className="w-full" />
                                </div>
                            </section>
                            <section className="space-y-4 pt-4 border-t border-white/5">
                                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Alignment</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['left', 'center', 'right'].map(align => (
                                        <button key={align} onClick={() => updateTextStyle('title', { textAlign: align as any })} className={`p-2 rounded border ${activeSlide.titleStyle?.textAlign === align ? 'bg-primary text-white' : 'bg-white/5 border-white/10'}`}><span className="material-symbols-outlined">format_align_{align}</span></button>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                    {activeTab === 'design' && (
                        <div className="space-y-6">
                            <section className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Aspect Ratio</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['1:1', '4:5', '9:16'] as AspectRatio[]).map(ar => (
                                        <button key={ar} onClick={() => onUpdateProject({ aspectRatio: ar })} className={`p-2 rounded border text-[10px] font-bold ${project.aspectRatio === ar ? 'bg-primary text-white border-primary' : 'bg-white/5 border-white/10 text-gray-400'}`}>{ar}</button>
                                    ))}
                                </div>
                            </section>
                            <section className="space-y-4 pt-4 border-t border-white/5">
                                <label className="text-[10px] font-black uppercase text-primary tracking-widest">Background Filters</label>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] text-gray-500"><span>BRIGHTNESS</span><span>{activeSlide.bgBrightness || 1}</span></div>
                                    <input type="range" min="0.2" max="2" step="0.1" value={activeSlide.bgBrightness || 1} onChange={(e) => onUpdateSlide(activeSlide.id, { bgBrightness: parseFloat(e.target.value) })} className="w-full" />
                                    <div className="flex justify-between text-[10px] text-gray-500"><span>BLUR</span><span>{activeSlide.bgBlur || 0}px</span></div>
                                    <input type="range" min="0" max="20" value={activeSlide.bgBlur || 0} onChange={(e) => onUpdateSlide(activeSlide.id, { bgBlur: parseInt(e.target.value) })} className="w-full" />
                                </div>
                            </section>
                            <BrandColorExtractor onColorExtracted={(c) => onUpdateProject({ primaryColor: c })} />
                        </div>
                    )}
                    {activeTab === 'editor' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-4">
                                <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Icon Suggestion
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {suggestedIcons.map(icon => (
                                        <button key={icon} onClick={() => addIconToSlide(icon)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all"><span className="material-symbols-outlined text-[20px]">{icon}</span></button>
                                    ))}
                                    {suggestedIcons.length === 0 && <button onClick={handleSuggestIcons} className="col-span-5 py-2 border border-dashed border-gray-600 rounded text-[10px] text-gray-500">Suggest Icons</button>}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-500 uppercase">Text Editor</label>
                                <textarea value={activeSlide.title} onChange={(e) => onUpdateSlide(activeSlide.id, { title: e.target.value })} className="w-full bg-[#1e232d] border border-white/5 rounded-xl p-3 text-sm h-24 outline-none focus:ring-1 focus:ring-primary" />
                                <textarea value={activeSlide.content} onChange={(e) => onUpdateSlide(activeSlide.id, { content: e.target.value })} className="w-full bg-[#1e232d] border border-white/5 rounded-xl p-3 text-sm h-32 outline-none focus:ring-1 focus:ring-primary" />
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
};
