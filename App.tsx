
import React, { useState, useEffect, useRef } from 'react';
import { GameState, OutputLine } from './types';
import { INITIAL_GAME_STATE, INITIAL_NARRATIVE } from './constants';
import { processPlayerCommand } from './services/geminiService';
import GameScreen from './components/GameScreen';
import InputBar from './components/InputBar';
import Inventory from './components/Inventory';
import LoadingSpinner from './components/LoadingSpinner';
import GameHeader from './components/GameHeader';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [outputText, setOutputText] = useState<OutputLine[]>([
    { type: 'narrative', text: INITIAL_NARRATIVE },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const rainSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    bgMusicRef.current = document.getElementById('bg-music') as HTMLAudioElement;
    rainSoundRef.current = document.getElementById('rain-sound') as HTMLAudioElement;

    if (bgMusicRef.current) {
        bgMusicRef.current.volume = 0.3;
    }
    if (rainSoundRef.current) {
        rainSoundRef.current.volume = 0.5;
    }
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    const musicEl = bgMusicRef.current;
    const rainEl = rainSoundRef.current;

    if (musicEl && rainEl) {
      musicEl.muted = newMutedState;
      rainEl.muted = newMutedState;

      if (!newMutedState) {
        musicEl.play().catch(e => console.error("Music play failed:", e));
        rainEl.play().catch(e => console.error("Rain sound play failed:", e));
      }
    }
  };

  const handleCommand = async (command: string) => {
    if (!command.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setOutputText((prev) => [...prev, { type: 'command', text: command }]);

    try {
      const result = await processPlayerCommand(command, gameState);
      setGameState(result.updatedGameState);
      setOutputText((prev) => [...prev, { type: 'narrative', text: result.narrative }]);
      if (result.updatedGameState.gameWon) {
        setOutputText((prev) => [...prev, { type: 'system-win', text: "축하합니다! 문을 열고 서재에서 탈출했습니다!" }]);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = '처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      setError(errorMessage);
      setOutputText((prev) => [...prev, { type: 'system-error', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const restartGame = () => {
    setGameState(INITIAL_GAME_STATE);
    setOutputText([{ type: 'narrative', text: INITIAL_NARRATIVE }]);
    setError(null);
    setIsLoading(false);
  }

  return (
    <div className="bg-zinc-900 text-gray-300 min-h-screen flex flex-col items-center justify-center p-4 selection:bg-amber-600 selection:text-white" style={{backgroundImage: `url('https://picsum.photos/seed/mystery/1920/1080')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(24, 24, 27, 0.8)'}}>
      <div className="w-full max-w-5xl h-[90vh] bg-black/60 backdrop-blur-sm shadow-2xl shadow-black/50 rounded-lg border border-zinc-700 flex flex-col overflow-hidden">
        <GameHeader onRestart={restartGame} isMuted={isMuted} onToggleMute={toggleMute} />
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          <main className="flex-grow flex flex-col p-4 md:p-6 w-full md:w-2/3 overflow-hidden">
            <GameScreen output={outputText} />
            <div className="mt-auto pt-4">
              {isLoading && <LoadingSpinner />}
              {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}
              <InputBar onCommand={handleCommand} disabled={isLoading || gameState.gameWon} gameWon={gameState.gameWon} />
            </div>
          </main>
          <aside className="w-full md:w-1/3 bg-black/30 border-t md:border-t-0 md:border-l border-zinc-700 p-4 md:p-6 overflow-y-auto">
            <Inventory items={gameState.inventory} />
          </aside>
        </div>
      </div>
      <footer className="text-center text-xs text-zinc-400 mt-2 opacity-75">
        <p>
          Music by <a href="https://pixabay.com/ko/users/shadowsandechoes-30244426/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=153817" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-400 transition-colors">Shadows And Echoes</a> from <a href="https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=153817" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-400 transition-colors">Pixabay</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
