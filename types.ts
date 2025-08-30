
export interface GameState {
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

export interface GeminiResponse {
  narrative: string;
  updatedGameState: GameState;
}

export interface OutputLine {
    type: 'narrative' | 'command' | 'system-win' | 'system-error';
    text: string;
}