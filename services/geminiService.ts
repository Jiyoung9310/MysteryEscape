
import { GameState, GeminiResponse } from '../types';

export const processPlayerCommand = async (command: string, currentState: GameState): Promise<GeminiResponse> => {
    try {
        // Gemini API를 직접 호출하는 대신, 자체 서버리스 함수 엔드포인트를 호출합니다.
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command, currentState }),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error('API 서버 오류:', errorBody);
            throw new Error(`API 호출이 다음 상태 코드로 실패했습니다: ${response.status}. ${errorBody.error || ''}`.trim());
        }

        const result: GeminiResponse = await response.json();
        return result;

    } catch (error) {
        console.error("API Fetch 오류:", error);
        // App 컴포넌트에서 처리할 수 있도록 더 사용자 친화적인 오류를 다시 던집니다.
        throw new Error("게임 서버와 통신하는 데 실패했습니다.");
    }
};
