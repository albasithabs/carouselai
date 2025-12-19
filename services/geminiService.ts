
import { GoogleGenAI, Type } from "@google/genai";
import { CarouselTone, Slide, TextStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DEFAULT_TITLE_STYLE: TextStyle = {
    fontSize: 48,
    bold: true,
    color: '#ffffff',
    textAlign: 'left',
    shadow: 'none',
    lineHeight: 1.1,
    fontFamily: 'Inter'
};

const DEFAULT_CONTENT_STYLE: TextStyle = {
    fontSize: 18,
    bold: false,
    color: '#ffffff',
    textAlign: 'left',
    shadow: 'none',
    lineHeight: 1.5,
    fontFamily: 'Inter'
};

export const generateCarouselContent = async (
    topic: string,
    tone: CarouselTone,
    slideCount: number,
    language: string = 'English'
): Promise<Slide[]> => {
    const systemInstruction = `You are a social media expert. Create a ${slideCount}-slide carousel about "${topic}" in ${language}. Tone: ${tone}.
    Return JSON array of objects: { title, content, visualDescription }.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Topic: ${topic}`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            content: { type: Type.STRING },
                            visualDescription: { type: Type.STRING }
                        },
                        required: ["title", "content", "visualDescription"]
                    }
                }
            }
        });

        const parsedData = JSON.parse(response.text || '[]');
        return parsedData.map((item: any, index: number) => ({
            id: `slide-${Date.now()}-${index}`,
            title: item.title,
            content: item.content,
            visualDescription: item.visualDescription,
            layout: index === 0 ? 'title-center' : 'split',
            backgroundImage: getRandomGradient(index),
            titleStyle: { ...DEFAULT_TITLE_STYLE },
            contentStyle: { ...DEFAULT_CONTENT_STYLE },
            additionalAssets: [],
            bgOverlayOpacity: 0.4,
            bgBlur: 0
        }));
    } catch (error) {
        console.error("Gemini failed:", error);
        return generateMockData(slideCount);
    }
};

export const suggestAssets = async (slideTitle: string, slideContent: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Slide Title: ${slideTitle}. Content: ${slideContent}`,
            config: {
                systemInstruction: "Return a JSON array of 5 Material Symbol icon names (lowercase, underscores) that best represent the visual concept of this slide.",
                responseMimeType: "application/json",
            }
        });
        return JSON.parse(response.text || '[]');
    } catch {
        return ['rocket_launch', 'star', 'lightbulb', 'trending_up', 'psychology'];
    }
};

export const generateImage = async (prompt: string, style?: string, aspectRatio: string = '1:1', type: 'background' | 'isolated' = 'background'): Promise<string | null> => {
    const fullPrompt = `${prompt}${style ? `. Style: ${style}` : ''}${type === 'isolated' ? '. Isolated on white background.' : ''}`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: fullPrompt }] },
            config: { imageConfig: { aspectRatio: aspectRatio as any } }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        return part ? `url('data:${part.inlineData.mimeType};base64,${part.inlineData.data}')` : null;
    } catch (error) {
        return `url('https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/1000')`;
    }
};

const getRandomGradient = (index: number) => {
    const gradients = [
        'linear-gradient(135deg, #135bec 0%, #2ecc71 100%)',
        'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
        'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
        'linear-gradient(135deg, #f1c40f 0%, #e67e22 100%)',
        'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
    ];
    return gradients[index % gradients.length];
};

const generateMockData = (count: number): Slide[] => Array.from({ length: count }).map((_, i) => ({
    id: `mock-${i}`,
    title: i === 0 ? "Unlock Your Potential" : `Strategy #${i}`,
    content: "Slide content here.",
    visualDescription: "Abstract blue waves",
    layout: i === 0 ? 'title-center' : 'split',
    backgroundImage: getRandomGradient(i),
    titleStyle: { ...DEFAULT_TITLE_STYLE },
    contentStyle: { ...DEFAULT_CONTENT_STYLE },
    additionalAssets: []
}));
