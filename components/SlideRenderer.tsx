
import React from 'react';
import { Slide, PresetStyle, BrandConfig, Position, AdditionalText, AIAsset } from '../types';

interface SlideRendererProps {
    slide: Slide;
    presetStyle: PresetStyle;
    brandConfig: BrandConfig;
    slideIndex: number;
    totalSlides: number;
    draggingId?: string | null;
    tempPositions?: {
        [key: string]: Position;
    };
    onTextChange: (field: 'title' | 'content' | 'secondContent' | string, value: string) => void;
    onMouseDown: (e: React.MouseEvent, id: string, x: number, y: number) => void;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
    slide,
    presetStyle,
    brandConfig,
    slideIndex,
    totalSlides,
    draggingId,
    tempPositions,
    onTextChange,
    onMouseDown
}) => {
    const titlePos = tempPositions?.title || slide.titlePosition || { x: 0, y: 0 };
    const contentPos = tempPositions?.content || slide.contentPosition || { x: 0, y: 0 };
    const brandPos = tempPositions?.brand || brandConfig.position || { x: 0, y: 0 };
    
    const highlightEnabled = slide.enableTextHighlight ?? false;

    const renderEditableText = (
        text: string, 
        field: 'title' | 'content' | 'secondContent' | string, 
        baseStyles: React.CSSProperties,
        isContent: boolean = false,
        className: string = ""
    ) => (
        <div 
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onTextChange(field, e.currentTarget.innerText)}
            className={`outline-none cursor-text empty:before:content-[attr(data-placeholder)] empty:before:text-white/30 transition-all ${
                highlightEnabled 
                ? `${isContent ? 'bg-white text-black' : 'bg-black text-white'} px-3 py-1 box-decoration-clone inline-block` 
                : 'text-white drop-shadow-xl block'
            } hover:ring-2 hover:ring-primary/40 rounded-sm ${className}`}
            style={baseStyles}
            data-placeholder={`Enter text...`}
        >
            {text}
        </div>
    );

    const renderLayout = () => {
        const isCenter = slide.layout === 'title-center' || slide.layout === 'quote' || presetStyle === 'minimalist';
        
        return (
            <div className={`relative z-10 w-full h-full flex flex-col ${isCenter ? 'items-center text-center justify-center' : 'items-start text-left justify-end'}`}>
                <div className={`w-full transition-all duration-300 ${
                    presetStyle === 'card' ? 'bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl' :
                    presetStyle === 'bold' ? 'bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]' :
                    ''
                }`}>
                    <div 
                        onMouseDown={(e) => onMouseDown(e, 'title', titlePos.x, titlePos.y)}
                        className={`cursor-move mb-4 relative rounded-sm ${draggingId === 'title' ? 'ring-2 ring-primary ring-dashed scale-[1.02] z-50' : 'hover:outline hover:outline-1 hover:outline-primary/50'}`}
                        style={{ transform: `translate(${titlePos.x}px, ${titlePos.y}px)`, transition: draggingId === 'title' ? 'none' : 'transform 0.2s' }}
                    >
                        {renderEditableText(slide.title, 'title', {
                            fontSize: `${slide.titleFontSize || 48}px`,
                            fontWeight: slide.titleFontWeight || '800',
                            color: presetStyle === 'bold' && !highlightEnabled ? 'black' : undefined,
                            lineHeight: '1.1'
                        })}
                    </div>

                    {slide.layout !== 'title-center' && (
                        <div 
                            onMouseDown={(e) => onMouseDown(e, 'content', contentPos.x, contentPos.y)}
                            className={`cursor-move relative rounded-sm ${draggingId === 'content' ? 'ring-2 ring-primary ring-dashed scale-[1.02] z-50' : 'hover:outline hover:outline-1 hover:outline-primary/50'}`}
                            style={{ transform: `translate(${contentPos.x}px, ${contentPos.y}px)`, transition: draggingId === 'content' ? 'none' : 'transform 0.2s' }}
                        >
                            {renderEditableText(slide.content, 'content', {
                                fontSize: '18px',
                                fontWeight: '500',
                                color: presetStyle === 'bold' && !highlightEnabled ? 'black' : 'rgba(255,255,255,0.9)',
                                lineHeight: '1.5'
                            }, true)}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const bgIsImageOrGradient = slide.backgroundImage?.startsWith('url') || 
                               slide.backgroundImage?.startsWith('data:image') || 
                               slide.backgroundImage?.includes('gradient');
                               
    const backgroundScale = slide.backgroundScale ?? 1.1; 

    return (
        <div 
            id="slide-canvas"
            className={`relative w-[400px] h-[500px] overflow-hidden rounded-lg shadow-2xl ring-4 ring-primary/50 select-none animate-slide-transition ${getPresetClasses(presetStyle)}`}
            style={{ fontFamily: slide.fontFamily || 'Inter' }}
        >
            <div 
                className="absolute inset-0 z-0 transition-all duration-700 bg-surface-darker"
                style={{
                    backgroundColor: !bgIsImageOrGradient ? (slide.backgroundImage || 'var(--primary-color)') : undefined,
                    backgroundImage: bgIsImageOrGradient ? slide.backgroundImage : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: slide.backgroundPosition || 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: `blur(${slide.bgBlur || 0}px)`,
                    transform: `scale(${backgroundScale})`
                }}
            />
            
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: `rgba(0,0,0, ${slide.bgOverlayOpacity ?? 0.4})` }} />

            {slide.overlayPattern === 'grid' && (
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            )}
            
            {renderLayout()}

            {/* AI Assets (Icons/Stickers) */}
            {slide.additionalAssets?.map((asset) => {
                const pos = tempPositions?.[`asset-${asset.id}`] || asset.position || { x: 0, y: 0 };
                return (
                    <div 
                        key={asset.id}
                        onMouseDown={(e) => onMouseDown(e, `asset-${asset.id}`, pos.x, pos.y)}
                        className={`absolute left-0 top-0 cursor-move z-20 group ${draggingId === `asset-${asset.id}` ? 'ring-2 ring-primary ring-dashed scale-[1.1]' : 'hover:outline hover:outline-1 hover:outline-primary/50'}`}
                        style={{ 
                            transform: `translate(${pos.x}px, ${pos.y}px) rotate(${asset.rotation || 0}deg)`, 
                            transition: draggingId === `asset-${asset.id}` ? 'none' : 'transform 0.2s' 
                        }}
                    >
                        <span className="material-symbols-outlined select-none" style={{ fontSize: `${asset.size}px`, color: asset.color || 'white' }}>
                            {asset.value}
                        </span>
                    </div>
                );
            })}

            {slide.additionalTexts?.map((extra) => {
                const pos = tempPositions?.[`extra-${extra.id}`] || extra.position || { x: 0, y: 0 };
                return (
                    <div key={extra.id} onMouseDown={(e) => onMouseDown(e, `extra-${extra.id}`, pos.x, pos.y)} className={`absolute left-0 top-0 cursor-move z-30 group ${draggingId === `extra-${extra.id}` ? 'ring-2 ring-primary ring-dashed' : ''}`} style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
                        {renderEditableText(extra.text, `extra-${extra.id}`, { fontSize: `${extra.fontSize}px`, fontWeight: '600' }, true)}
                    </div>
                );
            })}

            {brandConfig?.enabled && (
                <div onMouseDown={(e) => onMouseDown(e, 'brand', brandPos.x, brandPos.y)} className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between z-20 cursor-move" style={{ transform: `translate(${brandPos.x}px, ${brandPos.y}px)` }}>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border bg-white/20 text-white border-white/30">{brandConfig.handle.charAt(1).toUpperCase()}</div>
                        <span className="text-sm font-semibold">{brandConfig.handle}</span>
                    </div>
                    <span className="text-xs font-medium opacity-70">{brandConfig.website}</span>
                </div>
            )}
        </div>
    );
};

const getPresetClasses = (preset: PresetStyle) => {
    switch (preset) {
        case 'card': return 'p-10 flex flex-col items-center justify-center';
        case 'bold': return 'p-6 flex flex-col border-[12px] border-black';
        case 'minimalist': return 'p-12 flex flex-col items-center text-center justify-center';
        default: return 'p-8 flex flex-col';
    }
};
