
import { GoogleGenAI, Type } from "@google/genai";
import { GameState, GeminiResponse } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        narrative: { type: Type.STRING },
        updatedGameState: {
            type: Type.OBJECT,
            properties: {
                currentRoom: { type: Type.STRING },
                inventory: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                roomStates: {
                    type: Type.OBJECT,
                    properties: {
                        isDeskDrawerLocked: { type: Type.BOOLEAN },
                        isSafeHidden: { type: Type.BOOLEAN },
                        isSafeLocked: { type: Type.BOOLEAN },
                        isMainDoorLocked: { type: Type.BOOLEAN },
                        hasReadDiary: { type: Type.BOOLEAN },
                        hasFoundNoteInPen: { type: Type.BOOLEAN },
                    }
                },
                gameWon: { type: Type.BOOLEAN }
            }
        }
    }
};

export const processPlayerCommand = async (command: string, currentState: GameState): Promise<GeminiResponse> => {
    try {
        const prompt = `
플레이어의 현재 상태:
${JSON.stringify(currentState, null, 2)}

플레이어의 명령: "${command}"

위 정보를 바탕으로 게임을 진행하고, 다음에 보여줄 서술(narrative)과 업데이트된 게임 상태(updatedGameState)를 JSON 형식으로 반환하세요.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse: GeminiResponse = JSON.parse(jsonText);
        return parsedResponse;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to process command with Gemini API.");
    }
};