
import React, { useEffect, useRef } from 'react';
import { OutputLine } from '../types';

interface GameScreenProps {
  output: OutputLine[];
}

const GameScreen: React.FC<GameScreenProps> = ({ output }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const getLineStyle = (type: OutputLine['type']) => {
    switch(type) {
      case 'command':
        return 'text-amber-400 font-semibold';
      case 'narrative':
        return 'text-gray-300 font-serif';
      case 'system-win':
        return 'text-green-400 font-bold font-serif text-lg sm:text-xl';
      case 'system-error':
        return 'text-red-400 font-semibold';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="flex-grow overflow-y-auto pr-2 sm:pr-4 -mr-2 sm:-mr-4 text-base sm:text-lg leading-relaxed">
      {output.map((line, index) => (
        <p key={index} className={`mb-4 ${getLineStyle(line.type)}`}>
          {line.type === 'command' && <span className="mr-2 text-zinc-500">&gt;</span>}
          {line.text}
        </p>
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default GameScreen;
