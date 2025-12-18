
export interface Position {
    x: number;
    y: number;
}

export interface AdditionalText {
    id: string;
    text: string;
    position: Position;
    fontSize: number;
}

export interface AIAsset {
    id: string;
    type: 'icon';
    value: string; // Material symbol name
    position: Position;
    size: number;
    color?: string;
    rotation?: number;
}

export type PresetStyle = 'standard' | 'minimalist' | 'card' | 'bold' | 'geometric';

export interface Slide {
    id: string;
    title: string;
    content: string;
    secondContent?: string;
    visualDescription: string;
    backgroundImage?: string;
    layout: 'title-center' | 'split' | 'text-only' | 'quote' | 'comparison' | 'chat';
    textAlignment?: 'left' | 'center' | 'right';
    titleFontSize?: number;
    titleFontWeight?: string;
    fontFamily?: string;
    overlayPattern?: 'none' | 'grid' | 'dots';
    backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    backgroundScale?: number;
    additionalTexts?: AdditionalText[];
    additionalAssets?: AIAsset[]; // New field for AI Icons
    enableTextHighlight?: boolean; 
    bgOverlayOpacity?: number;     
    bgBlur?: number;               
    generatedVariations?: string[]; 
    titlePosition?: Position;
    contentPosition?: Position;
}

export enum CarouselTone {
    Professional = 'Professional',
    Witty = 'Witty',
    Inspirational = 'Inspirational',
    Educational = 'Educational'
}

export interface BrandConfig {
    enabled: boolean;
    handle: string;
    website: string;
    avatarUrl?: string;
    position?: Position; 
}

export interface CarouselProject {
    id: string;
    topic: string;
    tone: CarouselTone;
    slideCount: number;
    language: string; 
    slides: Slide[];
    themeId: string;
    primaryColor: string;
    presetStyle: PresetStyle;
    brandConfig: BrandConfig;
    lastSaved: Date;
}

export interface Theme {
    id: string;
    name: string;
    description: string;
    previewUrl: string;
    primaryColor: string;
    fontFamily: string;
    bgStyle: string; 
    active?: boolean;
}
