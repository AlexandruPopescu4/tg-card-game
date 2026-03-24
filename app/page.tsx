"use client";

import { useEffect, useState } from "react";

type TgUser = {
  id?: number;
  first_name?: string;
  username?: string;
};

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
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 bg-black text-white">
      <h1 className="text-3xl font-bold">TG Card Game</h1>

      <p className="text-gray-400 text-sm">Telegram Mini App prototype</p>

      <button className="bg-blue-500 text-white px-6 py-3 rounded-xl">
        Start
      </button>

      <p className="text-sm">
        {inTelegram ? "Running in Telegram" : "Running in browser"}
      </p>

      {user && (
        <div className="border border-gray-700 rounded-xl p-4 w-full max-w-sm">
          <p>
            <strong>First name:</strong> {user.first_name}
          </p>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
        </div>
      )}
    </main>
  );
}