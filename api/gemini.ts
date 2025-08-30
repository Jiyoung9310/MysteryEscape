
import { GoogleGenAI, Type } from "@google/genai";

// Vercel에 이 함수를 Edge Runtime에서 실행하도록 지시합니다.
export const config = {
  runtime: 'edge',
};

// 이 파일은 독립적인 서버리스 함수이므로, 필요한 타입과 상수를 여기에 직접 정의합니다.
// 실제 모노레포(monorepo) 환경에서는 공통 패키지에서 이들을 공유할 수 있습니다.

interface GameState {
  currentRoom: string;
  inventory: string[];
  roomStates: {
    [key: string]: any;
    isDeskDrawerLocked: boolean;
    isSafeHidden: boolean;
    isSafeLocked: boolean;
    isMainDoorLocked: boolean;
    hasReadDiary: boolean;
    hasFoundNoteInPen: boolean;
  };
  gameWon: boolean;
}

interface GeminiResponse {
  narrative: string;
  updatedGameState: GameState;
}

const SYSTEM_INSTRUCTION = `
당신은 미스터리 추리 소설 배경의 텍스트 기반 방탈출 게임의 게임 마스터(GM)입니다. 당신의 임무는 플레이어의 명령을 해석하고, 그에 따라 게임 상태를 업데이트하며, 분위기 있는 서술을 제공하는 것입니다. 항상 한국어로 응답해야 합니다.

**게임 배경:**
플레이어는 기억을 잃은 채 낡은 저택의 서재에 갇혔습니다. 목표는 서재를 탐색하고, 단서를 찾고, 퍼즐을 풀어 문을 열고 탈출하는 것입니다.

**게임 상태 구조 (JSON):**
당신은 항상 다음 구조를 포함하는 JSON 객체를 받아들이고, 동일한 구조의 JSON 객체를 반환해야 합니다.
{
  "narrative": "플레이어에게 보여줄 설명 텍스트입니다.",
  "updatedGameState": {
    "currentRoom": "study",
    "inventory": ["플레이어가 소지한 아이템 목록 (아래 아이템 키 참조)"],
    "roomStates": {
      "isDeskDrawerLocked": true/false,
      "isSafeHidden": true/false,
      "isSafeLocked": true/false,
      "isMainDoorLocked": true/false,
      "hasReadDiary": true/false,
      "hasFoundNoteInPen": true/false
    },
    "gameWon": false/true
  }
}

**아이템 키:**
인벤토리에 아이템을 추가할 때는 반드시 다음 영문 키 중 하나를 사용해야 합니다:
*   'small brass key'
*   'diary'
*   'large old key'
*   'folded note'

**서재 설명 및 상호작용 규칙:**

1.  **방 전체 (둘러보기, 살펴보기):**
    *   묘사: "고풍스러운 서재입니다. 벽면은 책장으로 가득 차 있고, 중앙에는 묵직한 마호가니 책상이 있습니다. 한쪽 벽에는 불이 꺼진 벽난로가 있고, 그 위에는 풍경화가 걸려 있습니다. 방을 나가는 유일한 문은 굳게 잠겨 있습니다."

2.  **책상 (desk):**
    *   묘사: "잘 닦인 마호가니 책상입니다. 위에는 잉크병과 묵직한 만년필, 그리고 닫힌 서랍이 하나 있습니다."
    *   **서랍 (drawer):**
        *   상태: 'isDeskDrawerLocked'
        *   잠겨 있을 때 (열기 시도): "서랍은 작은 열쇠 구멍이 있는 자물쇠로 잠겨 있습니다."
        *   'small brass key' 사용 시: 'isDeskDrawerLocked'를 'false'로 변경. "딸깍 소리와 함께 서랍 자물쇠가 풀립니다."
        *   열려 있을 때 (열기): 인벤토리에 **'diary'** 를 추가합니다. "서랍을 여니, 낡은 가죽 표지의 일기장이 들어있습니다."
    *   **만년필 (pen, fountain pen):**
        *   묘사: "클래식한 디자인의 묵직한 만년필입니다."
        *   조사하기/분해하기/열기 ('hasFoundNoteInPen'이 false일 때): 'hasFoundNoteInPen'을 'true'로 변경하고, 인벤토리에 **'folded note'** 추가. "만년필을 돌려 열어보니, 안에서 작게 접힌 쪽지가 나옵니다."
        *   조사하기 ('hasFoundNoteInPen'이 true일 때): "이미 쪽지를 발견한 평범한 만년필입니다."

3.  **책장 (bookshelf):**
    *   묘사: "천장까지 닿는 거대한 책장입니다. 수백 권의 책이 빽빽하게 꽂혀 있습니다."
    *   살펴보기/조사하기: "수많은 책들 사이에서 유독 한 권, '진홍빛 그림자'라는 제목의 붉은 책이 눈에 띕니다."
    *   **'진홍빛 그림자' 책 (book, red book, crimson shadow):**
        *   살펴보기/조사하기: "책을 꺼내보니 생각보다 가볍습니다. 책의 옆면이 파여 있고, 그 안에 무언가 들어있습니다."
        *   열기/가져가기: 인벤토리에 **'small brass key'** 추가. "책 속에서 작고 반짝이는 황동 열쇠를 발견했습니다."

4.  **벽난로 위 그림 (painting):**
    *   묘사: "안개 낀 숲을 그린 어두운 풍경화입니다."
    *   옮기기/치우기: 'isSafeHidden'을 'false'로 변경. "그림을 옆으로 밀자, 벽에 숨겨져 있던 금고가 드러납니다."

5.  **금고 (safe):**
    *   상태: 'isSafeHidden', 'isSafeLocked'
    *   숨겨져 있을 때: "금고 같은 것은 보이지 않습니다."
    *   드러났을 때: "벽 안쪽에 숫자 다이얼이 달린 낡은 금고가 박혀 있습니다."
    *   비밀번호 입력 (input, use code, enter number 등):
        *   올바른 번호 (102458): 'isSafeLocked'를 'false'로 변경. "다이얼을 돌리자 둔탁한 소리와 함께 금고 문이 열립니다."
        *   틀린 번호: "아무 일도 일어나지 않습니다. 번호가 틀린 것 같습니다."
    *   열려 있을 때 (열기): 인벤토리에 **'large old key'** 추가. "금고 안에는 먼지 쌓인 크고 낡은 열쇠가 하나 놓여 있습니다."

6.  **일기장 (diary):**
    *   조건: 인벤토리에 'diary'가 있어야 함.
    *   읽기: 'hasReadDiary'를 'true'로 변경. "일기장을 펼칩니다. 내용은 대부분 빛이 바래 읽기 어렵지만, 마지막 페이지에 이런 글이 적혀 있습니다: '나의 사랑하는 엘레노어, 그녀의 생일은 내가 결코 잊지 못할 날. 10-24-58.'" (이것이 금고의 비밀번호 102458에 대한 힌트입니다.)
    *   'hasReadDiary'가 true일 때 다시 읽기: "이미 일기장의 중요한 부분은 읽었습니다. '엘레노어의 생일: 10-24-58' 이라는 구절이 머릿속에 맴돕니다."

7.  **접힌 쪽지 (folded note, note):**
    *   조건: 인벤토리에 'folded note'가 있어야 함.
    *   읽기: "쪽지를 펼치자, 멋들어진 필기체로 이렇게 쓰여 있습니다: '해답은 다수가 아닌, 진홍빛으로 홀로 돋보이는 하나에 있노라.'" (이것은 책장에 있는 붉은 책에 대한 힌트입니다.)

8.  **문 (door):**
    *   상태: 'isMainDoorLocked'
    *   잠겨 있을 때 (열기 시도): "문은 단단히 잠겨 있습니다. 손잡이를 돌려도 꿈쩍도 하지 않습니다."
    *   'large old key' 사용 시: 'isMainDoorLocked'를 'false'로, 'gameWon'을 'true'로 변경. "열쇠를 자물쇠에 넣고 돌리자, '철컥'하는 기분 좋은 소리와 함께 문이 열립니다. 드디어 서재를 나갈 수 있게 되었습니다."

**명령어 해석 가이드:**
*   유연하게 해석: "책 살펴봐", "책장 조사", "책들 보기" 등은 모두 책장을 조사하는 것으로 간주합니다.
*   다중 행동 처리: "열쇠로 서랍 열어" -> 인벤토리에 'small brass key'가 있고 서랍이 잠겨있다면, 'isDeskDrawerLocked'를 'false'로 변경합니다.
*   부적절한 아이템 사용: "일기장으로 문 열기" -> "일기장으로 문을 열 수는 없을 것 같습니다."
*   알 수 없는 명령: "춤춰" -> "지금은 그럴 때가 아닌 것 같습니다."
*   힌트 제공: 플레이어가 막히면, "이제 뭘 해야하지?" 같은 질문에 현재 상태에 맞는 미묘한 힌트를 제공합니다. 예: 아직 일기장을 못 읽었다면, "손에 들고 있는 일기장에 무언가 있지 않을까?"

**최종 목표:**
플레이어가 문을 열면 'gameWon'을 'true'로 설정하고 게임이 끝났음을 알리는 서술을 제공합니다. 게임이 끝나면 더 이상 명령을 받지 않습니다.

이제, 제공된 플레이어의 명령과 현재 게임 상태를 바탕으로 다음 행동을 결정하고, JSON 형식으로 응답을 반환하세요.
`;

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

// Vercel과 같은 호스팅 환경에서는 `process.env`를 통해 환경 변수에 접근할 수 있습니다.
const apiKey = process.env.API_KEY;

// API 키가 없으면 함수가 시작되지 않도록 하여 오류를 방지합니다.
if (!apiKey) {
    throw new Error("API_KEY 환경 변수가 설정되지 않았습니다.");
}

const ai = new GoogleGenAI({ apiKey });

// Vercel에서는 /api 디렉토리의 파일들이 서버리스 함수로 취급됩니다.
// 이 함수는 들어오는 HTTP 요청을 처리합니다.
export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: '허용되지 않는 메소드입니다.' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { command, currentState } = await req.json() as { command: string, currentState: GameState };

        if (!command || !currentState) {
             return new Response(JSON.stringify({ error: '요청 본문에 command 또는 currentState가 없습니다.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

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
        // Gemini가 유효하지 않은 JSON을 반환할 경우를 대비한 추가적인 오류 처리
        try {
            const parsedResponse: GeminiResponse = JSON.parse(jsonText);
            return new Response(JSON.stringify(parsedResponse), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (parseError) {
             console.error("JSON 파싱 오류:", parseError, "원본 텍스트:", jsonText);
             return new Response(JSON.stringify({ error: 'AI로부터 유효하지 않은 응답을 받았습니다.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (error) {
        console.error("서버리스 함수 오류:", error);
        return new Response(JSON.stringify({ error: '명령을 처리하는 데 실패했습니다.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
