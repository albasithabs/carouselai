
import React from 'react';
import { Slide, PresetStyle, BrandConfig, Position, TextStyle, AIAsset, AspectRatio } from '../types';

interface SlideRendererProps {
    slide: Slide;
    presetStyle: PresetStyle;
    aspectRatio: AspectRatio;
    brandConfig: BrandConfig;
    slideIndex: number;
    totalSlides: number;
    draggingId?: string | null;
    tempPositions?: {
        [key: string]: Position;
    };
    onTextChange: (field: string, value: string) => void;
    onMouseDown: (e: React.MouseEvent, id: string, x: number, y: number) => void;
}

export const SlideRenderer: React.FC<SlideRendererProps> = ({
    slide,
    presetStyle,
    aspectRatio,
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
    
    const getTextStyle = (style: TextStyle, isTitle: boolean = false): React.CSSProperties => {
        const shadowMap = {
            none: 'none',
            soft: '0 2px 4px rgba(0,0,0,0.3)',
            hard: '2px 2px 0px rgba(0,0,0,0.8)',
            glow: `0 0 15px ${style.color || 'white'}`
        };

        return {
            color: style.color || (presetStyle === 'bold' ? 'black' : 'white'),
            fontSize: `${style.fontSize || (isTitle ? 48 : 18)}px`,
            fontFamily: style.fontFamily || 'Inter',
            fontWeight: style.bold ? '800' : (isTitle ? '800' : '500'),
            fontStyle: style.italic ? 'italic' : 'normal',
            textDecoration: style.underline ? 'underline' : 'none',
            textTransform: style.uppercase ? 'uppercase' : 'none',
            lineHeight: style.lineHeight || 1.1,
            letterSpacing: `${style.letterSpacing || 0}px`,
            textAlign: style.textAlign || 'left',
            textShadow: shadowMap[style.shadow || 'none'],
        };
    };

    const renderEditableText = (
        text: string, 
        field: string, 
        style: TextStyle,
        isContent: boolean = false,
        className: string = ""
    ) => {
        const baseStyles = getTextStyle(style, !isContent);
        const highlightEnabled = slide.enableTextHighlight ?? false;

        return (
            <div 
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => onTextChange(field, e.currentTarget.innerText)}
                className={`outline-none cursor-text empty:before:content-[attr(data-placeholder)] transition-all ${
                    highlightEnabled 
                    ? `px-3 py-1 box-decoration-clone inline-block` 
                    : 'block'
                } hover:ring-2 hover:ring-primary/40 rounded-sm ${className}`}
                style={{
                    ...baseStyles,
                    backgroundColor: highlightEnabled ? (slide.highlightColor || (isContent ? 'white' : 'black')) : 'transparent',
                    opacity: highlightEnabled ? (slide.highlightOpacity ?? 1) : 1
                }}
                data-placeholder={`Enter text...`}
            >
                {text}
            </div>
        );
    };

    const canvasSizes = {
        '1:1': { width: 400, height: 400 },
        '4:5': { width: 400, height: 500 },
        '9:16': { width: 281, height: 500 }
    };
    const currentSize = canvasSizes[aspectRatio];

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
                        {renderEditableText(slide.title, 'title', slide.titleStyle, false)}
                    </div>

                    {slide.layout !== 'title-center' && (
                        <div 
                            onMouseDown={(e) => onMouseDown(e, 'content', contentPos.x, contentPos.y)}
                            className={`cursor-move relative rounded-sm ${draggingId === 'content' ? 'ring-2 ring-primary ring-dashed scale-[1.02] z-50' : 'hover:outline hover:outline-1 hover:outline-primary/50'}`}
                            style={{ transform: `translate(${contentPos.x}px, ${contentPos.y}px)`, transition: draggingId === 'content' ? 'none' : 'transform 0.2s' }}
                        >
                            {renderEditableText(slide.content, 'content', slide.contentStyle, true)}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const bgIsImageOrGradient = slide.backgroundImage?.startsWith('url') || 
                               slide.backgroundImage?.startsWith('data:image') || 
                               slide.backgroundImage?.includes('gradient');
                               
    const backgroundFilters = `
        blur(${slide.bgBlur || 0}px)
        brightness(${slide.bgBrightness ?? 1})
        contrast(${slide.bgContrast ?? 1})
        saturate(${slide.bgSaturation ?? 1})
    `;

    return (
        <div 
            id="slide-canvas"
            className={`relative overflow-hidden shadow-2xl ring-4 ring-primary/50 select-none animate-slide-transition ${getPresetClasses(presetStyle)}`}
            style={{ 
                width: currentSize.width, 
                height: currentSize.height,
                borderRadius: `${slide.cornerRadius || 8}px`,
                border: `${slide.borderWidth || 0}px solid ${slide.borderColor || 'white'}`
            }}
        >
            <div 
                className="absolute inset-0 z-0 transition-all duration-700"
                style={{
                    backgroundColor: !bgIsImageOrGradient ? (slide.backgroundImage || 'var(--primary-color)') : undefined,
                    backgroundImage: bgIsImageOrGradient ? slide.backgroundImage : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: slide.backgroundPosition || 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: backgroundFilters,
                    transform: `scale(${slide.backgroundScale ?? 1.1})`
                }}
            />
            
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundColor: `rgba(0,0,0, ${slide.bgOverlayOpacity ?? 0.4})` }} />

            {slide.overlayPattern === 'grid' && (
                <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            )}
            
            {renderLayout()}

            {/* AI Assets */}
            {slide.additionalAssets?.map((asset) => {
                const pos = tempPositions?.[`asset-${asset.id}`] || asset.position || { x: 0, y: 0 };
                return (
                    <div 
                        key={asset.id}
                        onMouseDown={(e) => onMouseDown(e, `asset-${asset.id}`, pos.x, pos.y)}
                        className={`absolute left-0 top-0 cursor-move z-20 group ${draggingId === `asset-${asset.id}` ? 'ring-2 ring-primary ring-dashed scale-[1.1]' : 'hover:outline hover:outline-1 hover:outline-primary/50'}`}
                        style={{ 
                            transform: `translate(${pos.x}px, ${pos.y}px) rotate(${asset.rotation || 0}deg)`, 
                            transition: draggingId === `asset-${asset.id}` ? 'none' : 'transform 0.2s',
                            zIndex: asset.zIndex || 20
                        }}
                    >
                        <span className="material-symbols-outlined select-none" style={{ fontSize: `${asset.size}px`, color: asset.color || 'white' }}>
                            {asset.value}
                        </span>
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
            <div className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                {slideIndex + 1} / {totalSlides}
            </div>
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
