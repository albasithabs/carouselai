
import React from 'react';
import { getContrastRatio } from '../utils/colorUtils';

interface ContrastCheckerProps {
    bgColor: string; // This usually should be the average background color
    onFix: () => void;
}

export const ContrastChecker: React.FC<ContrastCheckerProps> = ({ bgColor, onFix }) => {
    // Assuming text color is white for most dark backgrounds
    const contrast = getContrastRatio('#ffffff', bgColor);
    const isSafe = contrast >= 4.5;

    if (isSafe) return null;

    return (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-amber-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg animate-bounce">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            LOW CONTRAST DETECTED
            <button 
                onClick={(e) => { e.stopPropagation(); onFix(); }}
                className="bg-white text-amber-600 px-2 py-0.5 rounded-full hover:bg-white/90 transition-colors"
            >
                AUTO FIX
            </button>
        </div>
    );
};
