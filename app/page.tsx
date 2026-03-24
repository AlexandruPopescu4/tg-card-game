"use client";

import { useEffect, useState } from "react";

type TgUser = {
  first_name: string;
  username?: string;
  id: number;
};

interface Card {
  id: number;
  name: string;
  attack: number;
  defense: number;
  speed: number;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe?: {
          user?: TgUser;
        };
      };
    };
  }
}

export default function HomePage() {
  const [inTelegram, setInTelegram] = useState(false);
  const [user, setUser] = useState<TgUser | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  // Mock cards data
  const mockCards: Card[] = [
    { id: 1, name: "Fire Dragon", attack: 8, defense: 6, speed: 4 },
    { id: 2, name: "Ice Wizard", attack: 5, defense: 7, speed: 6 },
    { id: 3, name: "Thunder Knight", attack: 7, defense: 7, speed: 5 },
    { id: 4, name: "Forest Elf", attack: 4, defense: 5, speed: 8 },
    { id: 5, name: "Dark Assassin", attack: 9, defense: 3, speed: 7 },
    { id: 6, name: "Holy Paladin", attack: 6, defense: 8, speed: 4 },
    { id: 7, name: "Water Spirit", attack: 5, defense: 6, speed: 7 },
    { id: 8, name: "Earth Golem", attack: 7, defense: 9, speed: 2 },
    { id: 9, name: "Wind Fairy", attack: 4, defense: 4, speed: 9 },
    { id: 10, name: "Lightning Mage", attack: 8, defense: 5, speed: 6 },
    { id: 11, name: "Shadow Ninja", attack: 7, defense: 4, speed: 8 },
    { id: 12, name: "Crystal Guardian", attack: 5, defense: 9, speed: 3 },
    { id: 13, name: "Flame Phoenix", attack: 9, defense: 6, speed: 7 },
    { id: 14, name: "Frost Giant", attack: 6, defense: 8, speed: 3 },
    { id: 15, name: "Storm Warrior", attack: 7, defense: 6, speed: 6 },
    { id: 16, name: "Moon Priestess", attack: 4, defense: 7, speed: 7 },
    { id: 17, name: "Sun Champion", attack: 8, defense: 7, speed: 5 },
    { id: 18, name: "Night Stalker", attack: 8, defense: 4, speed: 7 },
    { id: 19, name: "Nature Druid", attack: 5, defense: 6, speed: 6 },
    { id: 20, name: "Void Walker", attack: 9, defense: 5, speed: 5 },
    { id: 21, name: "Steel Titan", attack: 7, defense: 9, speed: 2 },
    { id: 22, name: "Mystic Sage", attack: 6, defense: 5, speed: 7 },
    { id: 23, name: "Blood Hunter", attack: 8, defense: 4, speed: 6 },
    { id: 24, name: "Star Guardian", attack: 6, defense: 8, speed: 5 },
    { id: 25, name: "Chaos Demon", attack: 10, defense: 2, speed: 6 },
  ];

  const toggleCardSelection = (cardId: number) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else if (prev.length < 5) {
        return [...prev, cardId];
      }
      return prev;
    });
  };

  useEffect(() => {
    const checkTelegram = () => {
      const tg = window.Telegram?.WebApp;

      if (!tg) {
        setInTelegram(false);
        setUser(null);
        return;
      }

      const isRealTelegram =
        typeof tg.ready === "function" &&
        typeof tg.expand === "function" &&
        typeof tg.initData === "string" &&
        tg.initData.length > 0;

      if (isRealTelegram) {
        tg.ready();
        tg.expand();
        setInTelegram(true);
        setUser(tg.initDataUnsafe?.user ?? null);
      } else {
        setInTelegram(false);
        setUser(null);
      }
    };

    checkTelegram();
    const timeout = setTimeout(checkTelegram, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          TG Card Game
        </h1>

        <p className="text-center text-gray-600 text-sm mb-6">
          Telegram Mini App prototype
        </p>

        {user && (
          <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Name:</strong> {user.first_name}
            </p>
            {user.username && (
              <p className="text-sm text-gray-700">
                <strong>@{user.username}</strong>
              </p>
            )}
            <p className="text-sm text-gray-700">
              <strong>ID:</strong> {user.id}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 text-center">
            Choose 5 cards
          </h2>
          
          <div className="bg-white rounded-lg p-3 mb-4 text-center">
            <p className="text-sm font-medium text-gray-700">
              Selected: {selectedCards.length} / 5
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {mockCards.map(card => {
              const isSelected = selectedCards.includes(card.id);
              return (
                <div
                  key={card.id}
                  onClick={() => toggleCardSelection(card.id)}
                  className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <h3 className="text-xs font-semibold text-gray-900 mb-1 truncate">
                    {card.name}
                  </h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>⚔️ {card.attack}</div>
                    <div>🛡️ {card.defense}</div>
                    <div>💨 {card.speed}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-4">
          Build Deck
        </button>

        <p className="text-center text-sm text-gray-500">
          {inTelegram ? "Running in Telegram" : "Running in browser"}
        </p>
      </div>
    </main>
  );
}