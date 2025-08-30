
import React from 'react';

interface InventoryProps {
  items: string[];
}

const Inventory: React.FC<InventoryProps> = ({ items }) => {
  const itemMap: { [key: string]: { name: string; description: string; icon: string } } = {
    'small brass key': { name: '작은 황동 열쇠', description: '작고 섬세한 열쇠. 서랍에 맞을 것 같다.', icon: '🔑' },
    'diary': { name: '가죽 일기장', description: '낡고 해진 일기장. 중요한 내용이 있을지도 모른다.', icon: '📖' },
    'large old key': { name: '크고 낡은 열쇠', description: '육중한 철제 열쇠. 방문 열쇠인 것 같다.', icon: '🗝️' },
    'folded note': { name: '접힌 쪽지', description: '만년필 안에 숨겨져 있던 종이. 힌트가 적혀있다.', icon: '📜' },
  };

  return (
    <div className="h-full">
      <h2 className="text-2xl font-bold font-serif text-amber-400 border-b-2 border-amber-600/30 pb-2 mb-4">소지품</h2>
      {items.length === 0 ? (
        <p className="text-zinc-400 italic">아무것도 가지고 있지 않습니다.</p>
      ) : (
        <ul className="space-y-4">
          {items.map((itemKey) => {
            const item = itemMap[itemKey];
            if (!item) return null;
            return (
              <li key={itemKey} className="bg-zinc-800/50 p-3 rounded-md border border-zinc-700">
                <p className="text-lg font-semibold text-white">{item.icon} {item.name}</p>
                <p className="text-sm text-zinc-400">{item.description}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Inventory;