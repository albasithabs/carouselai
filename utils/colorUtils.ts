
export const getLuminance = (hex: string): number => {
    const rgb = hex.replace(/^#/, '').match(/.{2}/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0];
    const a = rgb.map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getContrastRatio = (color1: string, color2: string): number => {
    const l1 = getLuminance(color1) + 0.05;
    const l2 = getLuminance(color2) + 0.05;
    return Math.max(l1, l2) / Math.min(l1, l2);
};

export const extractDominantColor = (imgElement: HTMLImageElement): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('#135bec');

        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        ctx.drawImage(imgElement, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;

        // Sample every 10th pixel for performance
        for (let i = 0; i < imageData.length; i += 40) {
            // Ignore transparent or near-white/black pixels if possible
            if (imageData[i+3] < 128) continue;
            r += imageData[i];
            g += imageData[i+1];
            b += imageData[i+2];
            count++;
        }

        if (count === 0) return resolve('#135bec');
        
        const avgR = Math.floor(r / count);
        const avgG = Math.floor(g / count);
        const avgB = Math.floor(b / count);

        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        resolve(`#${toHex(avgR)}${toHex(avgG)}${toHex(avgB)}`);
    });
};
