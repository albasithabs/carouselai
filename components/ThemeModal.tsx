import React, { useState, useEffect } from 'react';
import { Theme } from '../types';

interface ThemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyTheme: (theme: Theme) => void; // Changed from onSelectTheme to allow full config objects
    currentThemeId: string;
}

// Moved constants outside component for cleaner code
const THEMES: Theme[] = [
    {
        id: 'modern-blue',
        name: 'Modern Blue',
        description: 'Clean lines & gradients',
        previewUrl: 'https://picsum.photos/300/400?random=1',
        primaryColor: '#135bec',
        fontFamily: 'Inter',
        bgStyle: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
    },
    {
        id: 'luxury-dark',
        name: 'Luxury Dark',
        description: 'Gold accents on black',
        previewUrl: 'https://picsum.photos/300/400?random=2',
        primaryColor: '#d4af37',
        fontFamily: 'Playfair Display',
        bgStyle: '#000000'
    },
    {
        id: 'pop-art',
        name: 'Pop Art',
        description: 'Bold borders & halftones',
        previewUrl: 'https://picsum.photos/300/400?random=3',
        primaryColor: '#ff0055',
        fontFamily: 'Anton',
        bgStyle: '#ffe600'
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Ample whitespace',
        previewUrl: 'https://picsum.photos/300/400?random=4',
        primaryColor: '#000000',
        fontFamily: 'Inter',
        bgStyle: '#ffffff'
    }
];

// Updated font list with aggressively bold options
const FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Anton', 'Bebas Neue', 'Oswald', 'Montserrat'];

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose, onApplyTheme, currentThemeId }) => {
    const [mode, setMode] = useState<'selection' | 'customization'>('selection');
    
    // State to hold the configuration being edited
    const [selectedId, setSelectedId] = useState(currentThemeId);
    const [customConfig, setCustomConfig] = useState<Theme>(THEMES[0]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode('selection');
            setSelectedId(currentThemeId);
            const found = THEMES.find(t => t.id === currentThemeId) || THEMES[0];
            setCustomConfig({ ...found });
        }
    }, [isOpen, currentThemeId]);

    const handleThemeClick = (theme: Theme) => {
        setSelectedId(theme.id);
        setCustomConfig({ ...theme });
    };

    const handleSave = () => {
        // If we are in customization mode, we save the custom config
        // If in selection mode, we save the selected theme from the list
        if (mode === 'customization') {
            onApplyTheme({
                ...customConfig,
                id: 'custom-' + Date.now(), // Generate new ID for custom themes
                name: 'Custom Theme'
            });
        } else {
            const themeToSave = THEMES.find(t => t.id === selectedId) || THEMES[0];
            onApplyTheme(themeToSave);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="flex flex-col w-full max-w-[1080px] bg-white dark:bg-[#151a25] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-2 md:p-8 md:pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            {mode === 'customization' && (
                                <button 
                                    onClick={() => setMode('selection')}
                                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">arrow_back</span>
                                </button>
                            )}
                            <h2 className="text-[#111318] dark:text-white tracking-tight text-[28px] font-bold leading-tight">
                                {mode === 'selection' ? 'Choose your style' : 'Customize Theme'}
                            </h2>
                        </div>
                        <p className="text-[#637588] dark:text-[#9da6b9] text-base font-normal leading-normal max-w-2xl">
                            {mode === 'selection' 
                                ? "Select a preset to instantly update your carousel's fonts, colors, and layout."
                                : "Fine-tune the colors and typography to match your brand identity."}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50 dark:bg-[#111318]/50">
                    {mode === 'selection' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {THEMES.map((theme) => {
                                const isSelected = selectedId === theme.id;
                                return (
                                    <div 
                                        key={theme.id}
                                        onClick={() => handleThemeClick(theme)}
                                        className={`group relative flex flex-col gap-3 rounded-xl border-2 p-3 cursor-pointer transition-all shadow-sm ${
                                            isSelected 
                                            ? 'border-primary bg-primary/5 dark:bg-[#1a202c]' 
                                            : 'border-transparent hover:border-primary/50 hover:bg-white dark:hover:bg-[#1c2230] bg-white dark:bg-[#151a25]'
                                        }`}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-5 right-5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md">
                                                <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                                            </div>
                                        )}
                                        <div 
                                            className="w-full bg-center bg-no-repeat aspect-[4/5] bg-cover rounded-lg overflow-hidden relative shadow-inner"
                                            style={{ backgroundImage: `url(${theme.previewUrl})` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                                                <div className="flex gap-2 mb-1">
                                                     <div className="w-4 h-4 rounded-full border border-white/30" style={{background: theme.primaryColor}}></div>
                                                     <div className="w-4 h-4 rounded-full border border-white/30" style={{background: theme.bgStyle.includes('gradient') ? 'transparent' : theme.bgStyle}}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-1">
                                            <p className="text-[#111318] dark:text-white text-lg font-bold leading-normal">{theme.name}</p>
                                            <p className="text-[#637588] dark:text-[#9da6b9] text-sm font-normal leading-normal">{theme.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Preview Card */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Live Preview</h3>
                                <div className="aspect-[4/5] rounded-xl shadow-2xl overflow-hidden relative border border-gray-200 dark:border-gray-700">
                                    <div 
                                        className="w-full h-full p-8 flex flex-col justify-center"
                                        style={{ background: customConfig.bgStyle }}
                                    >
                                        <h2 
                                            className="text-4xl font-bold mb-4 leading-tight drop-shadow-md text-white"
                                            style={{ fontFamily: customConfig.fontFamily }}
                                        >
                                            Unlock Your True Potential
                                        </h2>
                                        <div 
                                            className="h-1 w-20 mb-4"
                                            style={{ backgroundColor: customConfig.primaryColor }}
                                        ></div>
                                        <p 
                                            className="text-lg text-white/90"
                                            style={{ fontFamily: customConfig.fontFamily }}
                                        >
                                            Swipe to discover 5 strategies that will change your workflow forever.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex flex-col gap-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Brand Colors</label>
                                    
                                    <div className="space-y-2">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Primary Color</span>
                                        <div className="flex gap-3 items-center">
                                            <input 
                                                type="color" 
                                                value={customConfig.primaryColor}
                                                onChange={(e) => setCustomConfig({...customConfig, primaryColor: e.target.value})}
                                                className="h-10 w-10 rounded cursor-pointer bg-transparent border-0"
                                            />
                                            <input 
                                                type="text" 
                                                value={customConfig.primaryColor}
                                                onChange={(e) => setCustomConfig({...customConfig, primaryColor: e.target.value})}
                                                className="flex-1 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Background</span>
                                        <div className="grid grid-cols-5 gap-2">
                                            {['#000000', '#ffffff', 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 'linear-gradient(135deg, #135bec 0%, #2ecc71 100%)', '#111318'].map((bg, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCustomConfig({...customConfig, bgStyle: bg})}
                                                    className={`h-10 rounded-lg border border-gray-200 dark:border-gray-600 ${customConfig.bgStyle === bg ? 'ring-2 ring-primary' : ''}`}
                                                    style={{ background: bg }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold uppercase tracking-wider text-gray-500">Typography</label>
                                    <div className="space-y-2">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Font Family</span>
                                        <div className="flex flex-col gap-2">
                                            {FONTS.map(font => (
                                                <label key={font} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1a202c]">
                                                    <input 
                                                        type="radio" 
                                                        name="fontFamily"
                                                        checked={customConfig.fontFamily === font}
                                                        onChange={() => setCustomConfig({...customConfig, fontFamily: font})}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <span style={{ fontFamily: font }}>{font}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 md:px-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151a25] shrink-0">
                    {mode === 'selection' ? (
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setMode('customization')}
                                className="flex items-center gap-2 text-primary hover:text-blue-600 font-medium text-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">tune</span>
                                Advanced Customization
                            </button>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500">
                           Customizing <span className="font-bold text-gray-700 dark:text-gray-300">{customConfig.name}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave}
                            className="px-6 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition-all transform hover:scale-105 active:scale-95"
                        >
                            {mode === 'customization' ? 'Apply Custom Theme' : 'Apply Theme'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};