
import React, { useRef } from 'react';
import { extractDominantColor } from '../utils/colorUtils';

interface BrandColorExtractorProps {
    onColorExtracted: (color: string) => void;
}

export const BrandColorExtractor: React.FC<BrandColorExtractorProps> = ({ onColorExtracted }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        img.onload = async () => {
            const color = await extractDominantColor(img);
            onColorExtracted(color);
        };
        img.src = URL.createObjectURL(file);
    };

    return (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">palette</span>
                <span className="text-[11px] font-black uppercase text-primary">Magic Brand Sync</span>
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">Upload your logo and we'll automatically sync the carousel colors to your brand.</p>
            <input 
                type="file" 
                ref={inputRef} 
                onChange={handleChange} 
                accept="image/*" 
                className="hidden" 
            />
            <button 
                onClick={() => inputRef.current?.click()}
                className="w-full py-2 bg-primary text-white text-[11px] font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined text-[16px]">upload_file</span>
                UPLOAD LOGO
            </button>
        </div>
    );
};
