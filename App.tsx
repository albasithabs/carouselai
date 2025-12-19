
import React, { useState, useRef, useEffect } from 'react';
import { CreateScreen } from './components/CreateScreen';
import { EditorScreen } from './components/EditorScreen';
import { ThemeModal } from './components/ThemeModal';
import { generateCarouselContent } from './services/geminiService';
import { CarouselProject, CarouselTone, Slide, Theme, TextStyle } from './types';
import html2canvas from 'html2canvas';

function App() {
    const [view, setView] = useState<'create' | 'editor'>('create');
    const [project, setProject] = useState<CarouselProject | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    
    // History for Undo/Redo
    const [history, setHistory] = useState<CarouselProject[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Sync Primary Color Variable Globally
    useEffect(() => {
        if (project?.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', project.primaryColor);
        }
    }, [project?.primaryColor]);

    const addToHistory = (newProject: CarouselProject) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newProject);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleGenerate = async (topic: string, tone: CarouselTone, length: number, language: string) => {
        setIsGenerating(true);
        try {
            const generatedSlides = await generateCarouselContent(topic, tone, length, language);
            
            const newProject: CarouselProject = {
                id: Date.now().toString(),
                topic,
                tone,
                slideCount: length,
                language: language,
                primaryColor: '#135bec',
                aspectRatio: '4:5',
                slides: generatedSlides,
                themeId: 'modern-blue',
                presetStyle: 'standard', 
                brandConfig: {
                    enabled: true,
                    handle: '@yourbrand',
                    website: 'www.yourwebsite.com'
                },
                lastSaved: new Date()
            };
            
            setProject(newProject);
            setHistory([newProject]);
            setHistoryIndex(0);
            setView('editor');
        } catch (error) {
            console.error("Failed to generate project", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUpdateProject = (updates: Partial<CarouselProject>) => {
        if (!project) return;
        const updated = { ...project, ...updates };
        setProject(updated);
        addToHistory(updated);
    };

    const handleUpdateSlide = (slideId: string, updates: Partial<Slide>) => {
        if (!project) return;
        const updatedProject = {
            ...project,
            slides: project.slides.map(slide => 
                slide.id === slideId ? { ...slide, ...updates } : slide
            )
        };
        setProject(updatedProject);
        addToHistory(updatedProject);
    };

    const handleAddSlide = () => {
        if (!project) return;
        const newSlide: Slide = {
            id: `new-${Date.now()}`,
            title: "New Slide",
            content: "Add content here",
            visualDescription: "Empty",
            layout: 'split',
            backgroundImage: '#111318',
            titleStyle: { fontSize: 48, bold: true, color: 'white', textAlign: 'left' },
            contentStyle: { fontSize: 18, bold: false, color: 'white', textAlign: 'left' },
            bgOverlayOpacity: 0.4,
            bgBlur: 0
        };
        handleUpdateProject({ slides: [...project.slides, newSlide], slideCount: project.slides.length + 1 });
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setProject(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setProject(history[historyIndex + 1]);
        }
    };

    const handleThemeApply = (theme: Theme) => {
        if (!project) return;
        const updatedSlides = project.slides.map(slide => ({
            ...slide,
            backgroundImage: theme.bgStyle,
            titleStyle: { ...slide.titleStyle, fontFamily: theme.fontFamily },
            contentStyle: { ...slide.contentStyle, fontFamily: theme.fontFamily }
        }));
        handleUpdateProject({ themeId: theme.id, primaryColor: theme.primaryColor, slides: updatedSlides });
        setIsThemeModalOpen(false);
    };

    const handleExportJSON = () => {
        if (!project) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${project.topic.replace(/\s+/g, '_')}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setShowExportMenu(false);
    };

    const handleExportJPG = async () => {
        const element = document.getElementById('slide-canvas');
        if (!element || !project) return;
        try {
            const canvas = await html2canvas(element, { useCORS: true, scale: 2, backgroundColor: null });
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement('a');
            link.download = `${project.topic.replace(/\s+/g, '_')}_slide.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Export failed", error);
        }
        setShowExportMenu(false);
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-[#0b0e14] text-white">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-[#282e39] bg-[#111318] px-6 py-3 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="size-8 text-primary cursor-pointer" onClick={() => setView('create')}>
                        <svg className="w-full h-full" viewBox="0 0 48 48" fill="none"><path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path></svg>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-base font-bold leading-tight">{project?.topic || 'CarouselAI'}</h2>
                        {view === 'editor' && <span className="text-xs text-gray-400 font-medium">{project?.aspectRatio} | {project?.presetStyle}</span>}
                    </div>
                </div>
                <div className="flex flex-1 justify-end gap-4 items-center">
                    {view === 'editor' && (
                        <div className="flex items-center border-r border-[#282e39] pr-3 mr-1 gap-1">
                            <button onClick={handleUndo} disabled={historyIndex <= 0} className="flex size-9 items-center justify-center rounded-lg hover:bg-[#282e39] disabled:opacity-30"><span className="material-symbols-outlined text-[20px]">undo</span></button>
                            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="flex size-9 items-center justify-center rounded-lg hover:bg-[#282e39] disabled:opacity-30"><span className="material-symbols-outlined text-[20px]">redo</span></button>
                        </div>
                    )}
                    <div className="relative">
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex h-9 px-4 items-center justify-center rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold gap-2 shadow-lg shadow-primary/20 transition-all">Export<span className="material-symbols-outlined text-[18px]">expand_more</span></button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-11 w-48 bg-[#1e232d] border border-[#282e39] rounded-xl shadow-2xl z-[60] py-1">
                                <button onClick={handleExportJSON} className="w-full text-left px-4 py-3 text-sm hover:bg-[#282e39] flex items-center gap-3"><span className="material-symbols-outlined text-gray-400">code</span>Project JSON</button>
                                <button onClick={handleExportJPG} className="w-full text-left px-4 py-3 text-sm hover:bg-[#282e39] flex items-center gap-3"><span className="material-symbols-outlined text-gray-400">image</span>Current Slide JPG</button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            {view === 'create' && <CreateScreen onGenerate={handleGenerate} isGenerating={isGenerating} />}
            {view === 'editor' && project && <EditorScreen project={project} onUpdateSlide={handleUpdateSlide} onUpdateProject={handleUpdateProject} onOpenThemeModal={() => setIsThemeModalOpen(true)} onAddSlide={handleAddSlide} onDeleteSlide={(i) => {}} onDuplicateSlide={(i) => {}} onMoveSlide={(i, d) => {}} />}
            <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} onApplyTheme={handleThemeApply} currentThemeId={project?.themeId || ''} />
        </div>
    );
}
export default App;
