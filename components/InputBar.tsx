
import React, { useState } from 'react';

interface InputBarProps {
  onCommand: (command: string) => void;
  disabled: boolean;
  gameWon: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onCommand, disabled, gameWon }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCommand(inputValue);
    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={gameWon ? "게임이 종료되었습니다." : "무엇을 하시겠습니까? (예: 책상 살펴봐)"}
        disabled={disabled}
        className="flex-grow bg-zinc-800 border border-zinc-600 rounded-md p-2 sm:p-3 text-base text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow disabled:bg-zinc-900 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={disabled}
        className="bg-amber-600 text-white font-bold px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed"
      >
        입력
      </button>
    </form>
  );
};

export default InputBar;
