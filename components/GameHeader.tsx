
import React from 'react';

interface GameHeaderProps {
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ onRestart, isMuted, onToggleMute }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-black/40 border-b border-zinc-700">
      <h1 className="text-xl md:text-2xl font-bold font-serif text-amber-500">
        미스터리 탈출: 잠긴 서재
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMute}
          className="text-2xl text-zinc-300 hover:text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-full p-1 transition-colors"
          aria-label={isMuted ? "소리 켜기" : "소리 끄기"}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button
          onClick={onRestart}
          className="text-sm bg-zinc-700 text-zinc-300 px-4 py-2 rounded-md hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
        >
          다시 시작
        </button>
      </div>
    </header>
  );
};

export default GameHeader;