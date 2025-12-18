
import React, { useState, useRef, useEffect } from 'react';
import { CreateScreen } from './components/CreateScreen';
import { EditorScreen } from './components/EditorScreen';
import { ThemeModal } from './components/ThemeModal';
import { generateCarouselContent } from './services/geminiService';
import { CarouselProject, CarouselTone, Slide, Theme } from './types';
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
                slides: generatedSlides.map(s => ({
                    ...s,
                    bgOverlayOpacity: 0.4, 
                    bgBlur: 0,
                    enableTextHighlight: false,
                    fontFamily: 'Inter'
                })),
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

    const updateProject = (updatedProject: CarouselProject) => {
        setProject(updatedProject);
        addToHistory(updatedProject);
    };

    const handleUpdateProject = (updates: Partial<CarouselProject>) => {
        if (!project) return;
        updateProject({ ...project, ...updates });
    };

    const handleUpdateSlide = (slideId: string, updates: Partial<Slide>) => {
        if (!project) return;
        const updatedProject = {
            ...project,
            slides: project.slides.map(slide => 
                slide.id === slideId ? { ...slide, ...updates } : slide
            )
        };
        updateProject(updatedProject);
    };

    const handleAddSlide = () => {
        if (!project) return;
        const newSlide: Slide = {
            id: `new-${Date.now()}`,
            title: "New Slide",
            content: "Add your content here",
            visualDescription: "Empty slide",
            layout: 'split',
            textAlignment: 'left',
            titleFontSize: 48,
            backgroundImage: project.slides[project.slides.length - 1]?.backgroundImage || '#111318',
            fontFamily: project.slides[0]?.fontFamily || 'Inter',
            bgOverlayOpacity: 0.4,
            bgBlur: 0,
            enableTextHighlight: false
        };
        const updatedProject = {
            ...project,
            slides: [...project.slides, newSlide],
            slideCount: project.slides.length + 1
        };
        updateProject(updatedProject);
    };

    const handleDeleteSlide = (index: number) => {
        if (!project || project.slides.length <= 1) return;
        const newSlides = [...project.slides];
        newSlides.splice(index, 1);
        updateProject({ ...project, slides: newSlides, slideCount: newSlides.length });
    };

    const handleDuplicateSlide = (index: number) => {
        if (!project) return;
        const slideToCopy = project.slides[index];
        const newSlide = { ...slideToCopy, id: `copy-${Date.now()}` };
        const newSlides = [...project.slides];
        newSlides.splice(index + 1, 0, newSlide);
        updateProject({ ...project, slides: newSlides, slideCount: newSlides.length });
    };

    const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
        if (!project) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === project.slides.length - 1) return;
        const newSlides = [...project.slides];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
        updateProject({ ...project, slides: newSlides });
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
        
        // Update all slides with theme background and font
        const updatedSlides = project.slides.map(slide => ({
            ...slide,
            backgroundImage: theme.bgStyle,
            fontFamily: theme.fontFamily
        }));
        
        updateProject({ 
            ...project, 
            themeId: theme.id,
            primaryColor: theme.primaryColor,
            slides: updatedSlides 
        });
        
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
            const canvas = await html2canvas(element, { useCORS: true, scale: 2, backgroundColor: null, allowTaint: true });
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement('a');
            link.download = `${project.topic.replace(/\s+/g, '_')}_slide.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Export JPG failed", error);
        }
        setShowExportMenu(false);
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-[#0b0e14] text-white">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#282e39] bg-[#111318] px-6 py-3 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="size-8 text-primary cursor-pointer" onClick={() => setView('create')}>
                        <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-base font-bold leading-tight">{project?.topic || 'CarouselAI'}</h2>
                        {view === 'editor' && <span className="text-xs text-gray-400 font-medium">Global Style: {project?.presetStyle || 'Standard'}</span>}
                    </div>
                </div>
                
                <div className="flex flex-1 justify-end gap-6 items-center">
                    <div className="flex items-center gap-3">
                         {view === 'editor' && (
                            <div className="flex items-center border-r border-[#282e39] pr-3 mr-1 gap-1">
                                <button onClick={handleUndo} disabled={historyIndex <= 0} className="flex size-9 items-center justify-center rounded-lg hover:bg-[#282e39] disabled:opacity-30"><span className="material-symbols-outlined text-[20px]">undo</span></button>
                                <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="flex size-9 items-center justify-center rounded-lg hover:bg-[#282e39] disabled:opacity-30"><span className="material-symbols-outlined text-[20px]">redo</span></button>
                            </div>
                         )}

                        {view === 'create' ? (
                             <button className="hidden sm:flex h-9 px-4 items-center justify-center rounded-lg border border-slate-700 hover:bg-surface-dark transition-colors text-sm font-medium"><span className="material-symbols-outlined text-[18px] mr-2">save</span>Drafts</button>
                        ) : (
                            <button onClick={() => handleGenerate(project!.topic, project!.tone, project!.slideCount, project!.language)} className="flex min-w-[84px] items-center justify-center rounded-lg h-9 px-4 bg-[#282e39] hover:bg-[#353b47] text-white text-sm font-bold gap-2">
                                <span className="material-symbols-outlined text-[18px] text-purple-400">auto_awesome</span>Regenerate
                            </button>
                        )}
                       
                        <div className="relative">
                            <button onClick={() => setShowExportMenu(!showExportMenu)} className="flex h-9 px-4 items-center justify-center rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold gap-2">Export<span className="material-symbols-outlined text-[18px]">expand_more</span></button>
                            {showExportMenu && (
                                <div className="absolute right-0 top-10 w-48 bg-[#1e232d] border border-[#282e39] rounded-lg shadow-xl z-50 py-1">
                                    <button onClick={handleExportJSON} className="w-full text-left px-4 py-2 text-sm hover:bg-[#282e39]">Project JSON</button>
                                    <button onClick={handleExportJPG} className="w-full text-left px-4 py-2 text-sm hover:bg-[#282e39]">Current Slide JPG</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {view === 'create' && <CreateScreen onGenerate={handleGenerate} isGenerating={isGenerating} />}
            {view === 'editor' && project && <EditorScreen project={project} onUpdateSlide={handleUpdateSlide} onUpdateProject={handleUpdateProject} onOpenThemeModal={() => setIsThemeModalOpen(true)} onAddSlide={handleAddSlide} onDeleteSlide={handleDeleteSlide} onDuplicateSlide={handleDuplicateSlide} onMoveSlide={handleMoveSlide} />}
            <ThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} onApplyTheme={handleThemeApply} currentThemeId={project?.themeId || ''} />
        </div>
    );
}

export default App;
