'use client';

import { useEffect, useState } from 'react';

// TypeScript declarations for Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initDataUnsafe: {
          user?: {
            first_name: string;
            username?: string;
            id: number;
          };
        };
        expand(): void;
      };
    };
  }
}

interface TelegramUser {
  first_name: string;
  username?: string;
  id: number;
}

export default function Home() {
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    // Detect Telegram WebApp after component mounts
    const checkTelegram = () => {
      if (window.Telegram?.WebApp) {
        setIsTelegram(true);
        const webApp = window.Telegram.WebApp;
        
        // Get user data if available
        if (webApp.initDataUnsafe?.user) {
          setUser(webApp.initDataUnsafe.user);
        }
        
        // Expand the Web App
        webApp.expand();
      }
    };

    // Check immediately or wait for script to load
    if (window.Telegram?.WebApp) {
      checkTelegram();
    } else {
      // Wait a bit for the script to load
      const timer = setTimeout(checkTelegram, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 py-8">
      <main className="flex flex-col items-center justify-center text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          TG Card Game
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Telegram Mini App prototype
        </p>
        
        {user && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm w-full">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">User Info:</h3>
            <p className="text-sm text-gray-600">Name: {user.first_name}</p>
            {user.username && <p className="text-sm text-gray-600">@{user.username}</p>}
            <p className="text-sm text-gray-600">ID: {user.id}</p>
          </div>
        )}
        
        <button className="w-full max-w-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-6">
          Start
        </button>
        
        <p className="text-sm text-gray-500">
          {isTelegram ? 'Running in Telegram' : 'Running in browser'}
        </p>
      </main>
    </div>
  );
}
