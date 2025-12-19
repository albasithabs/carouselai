
export interface Position {
    x: number;
    y: number;
}

export interface TextStyle {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    uppercase?: boolean;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
    letterSpacing?: number;
    textAlign?: 'left' | 'center' | 'right';
    shadow?: 'none' | 'soft' | 'hard' | 'glow';
}

export interface AdditionalText {
    id: string;
    text: string;
    position: Position;
    style: TextStyle;
}

export interface AIAsset {
    id: string;
    type: 'icon';
    value: string; // Material symbol name
    position: Position;
    size: number;
    color?: string;
    rotation?: number;
    zIndex?: number;
}

export type PresetStyle = 'standard' | 'minimalist' | 'card' | 'bold' | 'geometric';
export type AspectRatio = '1:1' | '4:5' | '9:16';

export interface Slide {
    id: string;
    title: string;
    content: string;
    secondContent?: string;
    visualDescription: string;
    backgroundImage?: string;
    layout: 'title-center' | 'split' | 'text-only' | 'quote' | 'comparison' | 'chat';
    
    // Detailed Typography
    titleStyle: TextStyle;
    contentStyle: TextStyle;
    
    // Background Tuning
    backgroundPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    backgroundScale?: number;
    bgBrightness?: number;
    bgContrast?: number;
    bgSaturation?: number;
    bgGrayscale?: number;
    
    // Floating Elements
    additionalTexts?: AdditionalText[];
    additionalAssets?: AIAsset[];
    
    // Visual Enhancements
    enableTextHighlight?: boolean; 
    highlightColor?: string;
    highlightOpacity?: number;
    bgOverlayOpacity?: number;     
    bgBlur?: number;               
    
    // Borders & Corners
    cornerRadius?: number;
    borderWidth?: number;
    borderColor?: string;

    // AI Assets Persistence
    generatedVariations?: string[]; 
    
    // Positioning
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
    aspectRatio: AspectRatio;
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
