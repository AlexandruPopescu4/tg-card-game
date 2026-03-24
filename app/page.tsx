'use client';

import { useEffect, useState } from 'react';

// TypeScript declarations for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe?: {
          user?: {
            first_name: string;
            username?: string;
            id: number;
          };
        };
      };
    };
  }
}

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

interface Player {
  id: number;
  name: string;
  deck: Card[];
}

interface Match {
  id: number;
  player1: Player;
  player2: Player;
  winner?: Player;
  round: 'quarterfinal' | 'semifinal' | 'final' | 'third_place';
}

interface TournamentResults {
  quarterfinals: Match[];
  semifinals: Match[];
  final: Match;
  thirdPlace: Match;
  top3: [Player, Player, Player]; // 1st, 2nd, 3rd
}

type AppScreen = "builder" | "summary" | "battle" | "tournament";

export default function HomePage() {
  const [inTelegram, setInTelegram] = useState(false);
  const [user, setUser] = useState<TgUser | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("builder");
  const [botDeck, setBotDeck] = useState<Card[]>([]);
  const [tournamentPlayers, setTournamentPlayers] = useState<Player[]>([]);
  const [tournamentMatches, setTournamentMatches] = useState<Match[]>([]);
  const [tournamentResults, setTournamentResults] = useState<TournamentResults | null>(null);

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

  // Helper functions
  const calculateCardPower = (card: Card): number => {
    return card.attack * 0.4 + card.defense * 0.3 + card.speed * 0.3;
  };

  const calculateDeckPower = (deck: Card[]): number => {
    return deck.reduce((total, card) => total + calculateCardPower(card), 0);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getRandomDeck = (): Card[] => {
    const shuffled = shuffleArray(mockCards);
    return shuffled.slice(0, 5);
  };

  const generateTournamentPlayers = (): Player[] => {
    const players: Player[] = [];
    
    // Add current user as Player 1
    const userDeck = selectedCards.map(id => mockCards.find(c => c.id === id)).filter(Boolean) as Card[];
    players.push({
      id: 1,
      name: user?.first_name || "You",
      deck: userDeck
    });
    
    // Add 15 AI players
    for (let i = 2; i <= 16; i++) {
      players.push({
        id: i,
        name: `Player ${i}`,
        deck: getRandomDeck()
      });
    }
    
    return players;
  };

  const generateTournamentBracket = (): Match[] => {
    const players = generateTournamentPlayers();
    const shuffled = shuffleArray(players);
    const matches: Match[] = [];
    
    // Create 8 quarterfinal matches
    for (let i = 0; i < 8; i++) {
      matches.push({
        id: i + 1,
        player1: shuffled[i * 2],
        player2: shuffled[i * 2 + 1],
        round: 'quarterfinal'
      });
    }
    
    return matches;
  };

  const simulateMatch = (player1: Player, player2: Player): Player => {
    const power1 = calculateDeckPower(player1.deck);
    const power2 = calculateDeckPower(player2.deck);
    return power1 >= power2 ? player1 : player2;
  };

  const simulateTournament = (): TournamentResults => {
    const players = generateTournamentPlayers();
    const shuffled = shuffleArray(players);
    
    // Quarterfinals
    const quarterfinals: Match[] = [];
    const quarterfinalWinners: Player[] = [];
    
    for (let i = 0; i < 8; i++) {
      const player1 = shuffled[i * 2];
      const player2 = shuffled[i * 2 + 1];
      const winner = simulateMatch(player1, player2);
      
      const match: Match = {
        id: i + 1,
        player1,
        player2,
        winner,
        round: 'quarterfinal'
      };
      
      quarterfinals.push(match);
      quarterfinalWinners.push(winner);
    }
    
    // Semifinals
    const semifinals: Match[] = [];
    const semifinalWinners: Player[] = [];
    const semifinalLosers: Player[] = [];
    
    for (let i = 0; i < 4; i++) {
      const player1 = quarterfinalWinners[i * 2];
      const player2 = quarterfinalWinners[i * 2 + 1];
      const winner = simulateMatch(player1, player2);
      const loser = winner === player1 ? player2 : player1;
      
      const match: Match = {
        id: i + 1,
        player1,
        player2,
        winner,
        round: 'semifinal'
      };
      
      semifinals.push(match);
      semifinalWinners.push(winner);
      semifinalLosers.push(loser);
    }
    
    // Final
    const finalWinner = simulateMatch(semifinalWinners[0], semifinalWinners[1]);
    const finalLoser = finalWinner === semifinalWinners[0] ? semifinalWinners[1] : semifinalWinners[0];
    
    const final: Match = {
      id: 1,
      player1: semifinalWinners[0],
      player2: semifinalWinners[1],
      winner: finalWinner,
      round: 'final'
    };
    
    // Third place match
    const thirdPlaceWinner = simulateMatch(semifinalLosers[0], semifinalLosers[1]);
    
    const thirdPlace: Match = {
      id: 1,
      player1: semifinalLosers[0],
      player2: semifinalLosers[1],
      winner: thirdPlaceWinner,
      round: 'third_place'
    };
    
    // Top 3
    const top3: [Player, Player, Player] = [finalWinner, finalLoser, thirdPlaceWinner];
    
    return {
      quarterfinals,
      semifinals,
      final,
      thirdPlace,
      top3
    };
  };

  // Event handlers
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

  const handleBuildDeck = () => {
    if (selectedCards.length === 5) {
      setCurrentScreen("summary");
    }
  };

  const handleStartBattle = () => {
    const newBotDeck = getRandomDeck();
    setBotDeck(newBotDeck);
    setCurrentScreen("battle");
  };

  const handleJoinTournament = () => {
    const players = generateTournamentPlayers();
    setTournamentPlayers(players);
    setTournamentMatches([]);
    setTournamentResults(null);
    setCurrentScreen("tournament");
  };

  const handleSimulateTournament = () => {
    const results = simulateTournament();
    setTournamentResults(results);
  };

  const handleGenerateBracket = () => {
    const matches = generateTournamentBracket();
    setTournamentMatches(matches);
  };

  const handleBackToBuilder = () => {
    setCurrentScreen("builder");
  };

  const handleBackToSummary = () => {
    setCurrentScreen("summary");
  };

  // Telegram detection
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

  // Render functions
  const renderBuilderScreen = () => (
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

      <button
        onClick={handleBuildDeck}
        disabled={selectedCards.length !== 5}
        className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-4 ${
          selectedCards.length === 5
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Build Deck {selectedCards.length !== 5 && `(${selectedCards.length}/5)`}
      </button>
    </div>
  );

  const renderSummaryScreen = () => {
    const userDeck = selectedCards.map(id => mockCards.find(c => c.id === id)).filter(Boolean) as Card[];
    const totalPower = calculateDeckPower(userDeck);

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Deck Summary
        </h2>
        
        <div className="space-y-3 mb-6">
          {userDeck.map(card => {
            const power = calculateCardPower(card);
            return (
              <div key={card.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{card.name}</h3>
                  <span className="text-sm font-medium text-blue-600">
                    Power: {power.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 grid grid-cols-3 gap-2">
                  <div>⚔️ {card.attack}</div>
                  <div>🛡️ {card.defense}</div>
                  <div>💨 {card.speed}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-center text-lg font-semibold text-blue-900">
            Total Deck Power: {totalPower.toFixed(1)}
          </p>
        </div>

        <button
          onClick={handleStartBattle}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-2"
        >
          Start Battle
        </button>

        <button
          onClick={handleJoinTournament}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-2"
        >
          Join Tournament
        </button>

        <button
          onClick={handleBackToBuilder}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
        >
          Back to Builder
        </button>
      </div>
    );
  };

  const renderBattleScreen = () => {
    const userDeck = selectedCards.map(id => mockCards.find(c => c.id === id)).filter(Boolean) as Card[];
    const userPower = calculateDeckPower(userDeck);
    const botPower = calculateDeckPower(botDeck);
    const result = userPower > botPower ? "You Win!" : botPower > userPower ? "Bot Wins!" : "Draw!";

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Battle Result
        </h2>
        
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 text-center">Your Deck</h3>
          <div className="space-y-2 mb-3">
            {userDeck.map(card => (
              <div key={card.id} className="bg-blue-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-blue-900">{card.name}</h4>
                  <span className="text-xs font-medium text-blue-700">
                    {calculateCardPower(card).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-blue-900">
              Total Power: {userPower.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className={`text-lg font-bold ${
              result === "You Win!" ? "text-green-400" : 
              result === "Bot Wins!" ? "text-red-400" : "text-yellow-400"
            }`}>
              {result}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-red-900 mb-2 text-center">Bot Deck</h3>
          <div className="space-y-2 mb-3">
            {botDeck.map(card => (
              <div key={card.id} className="bg-red-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-red-900">{card.name}</h4>
                  <span className="text-xs font-medium text-red-700">
                    {calculateCardPower(card).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-red-100 rounded-lg p-3 text-center">
            <p className="text-sm font-semibold text-red-900">
              Total Power: {botPower.toFixed(1)}
            </p>
          </div>
        </div>

        <button
          onClick={handleBackToSummary}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
        >
          Back to Summary
        </button>
      </div>
    );
  };

  const renderTournamentScreen = () => (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        Tournament Lobby
      </h2>
      
      {!tournamentResults ? (
        <>
          {tournamentMatches.length === 0 ? (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                  16 Players Ready
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {tournamentPlayers.map(player => (
                    <div
                      key={player.id}
                      className={`p-2 rounded-lg text-center text-xs ${
                        player.id === 1
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{player.name}</p>
                      <p className="text-gray-600">Power: {calculateDeckPower(player.deck).toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateBracket}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-2"
              >
                Generate Bracket
              </button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                  First Round Matches
                </h3>
                <div className="space-y-3">
                  {tournamentMatches.map(match => (
                    <div key={match.id} className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 text-center">
                          <p className="text-sm font-medium text-gray-900">{match.player1.name}</p>
                          <p className="text-xs text-gray-600">
                            {calculateDeckPower(match.player1.deck).toFixed(1)}
                          </p>
                        </div>
                        <div className="px-3">
                          <span className="text-xs font-semibold text-gray-500">VS</span>
                        </div>
                        <div className="flex-1 text-center">
                          <p className="text-sm font-medium text-gray-900">{match.player2.name}</p>
                          <p className="text-xs text-gray-600">
                            {calculateDeckPower(match.player2.deck).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSimulateTournament}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-2"
              >
                Simulate Tournament
              </button>
            </>
          )}
        </>
      ) : (
        <>
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
              Tournament Results
            </h3>
            
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
              <h4 className="text-center font-bold text-gray-900 mb-3">🏆 Top 3</h4>
              <div className="space-y-2">
                {tournamentResults.top3.map((player, index) => {
                  const isUser = player.id === 1;
                  return (
                    <div
                      key={player.id}
                      className={`flex justify-between items-center p-2 rounded ${
                        isUser ? 'bg-blue-100 border border-blue-300' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="font-bold mr-2">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                        <span className={`font-medium ${isUser ? 'text-blue-900' : 'text-gray-900'}`}>
                          {player.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {calculateDeckPower(player.deck).toFixed(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Quarterfinals</h4>
                <div className="space-y-2">
                  {tournamentResults.quarterfinals.map(match => (
                    <div key={match.id} className="bg-white rounded-lg p-2 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex-1 text-center">
                          <p className={match.winner?.id === match.player1.id ? 'font-bold text-green-600' : 'text-gray-600'}>
                            {match.player1.name}
                          </p>
                          <p className="text-gray-500">
                            {calculateDeckPower(match.player1.deck).toFixed(1)}
                          </p>
                        </div>
                        <div className="px-2">
                          <span className="font-semibold text-gray-500">VS</span>
                        </div>
                        <div className="flex-1 text-center">
                          <p className={match.winner?.id === match.player2.id ? 'font-bold text-green-600' : 'text-gray-600'}>
                            {match.player2.name}
                          </p>
                          <p className="text-gray-500">
                            {calculateDeckPower(match.player2.deck).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Semifinals</h4>
                <div className="space-y-2">
                  {tournamentResults.semifinals.map(match => (
                    <div key={match.id} className="bg-white rounded-lg p-2 shadow-sm">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex-1 text-center">
                          <p className={match.winner?.id === match.player1.id ? 'font-bold text-green-600' : 'text-gray-600'}>
                            {match.player1.name}
                          </p>
                          <p className="text-gray-500">
                            {calculateDeckPower(match.player1.deck).toFixed(1)}
                          </p>
                        </div>
                        <div className="px-2">
                          <span className="font-semibold text-gray-500">VS</span>
                        </div>
                        <div className="flex-1 text-center">
                          <p className={match.winner?.id === match.player2.id ? 'font-bold text-green-600' : 'text-gray-600'}>
                            {match.player2.name}
                          </p>
                          <p className="text-gray-500">
                            {calculateDeckPower(match.player2.deck).toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Final</h4>
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex-1 text-center">
                      <p className={tournamentResults.final.winner?.id === tournamentResults.final.player1.id ? 'font-bold text-green-600' : 'text-gray-600'}>
                        {tournamentResults.final.player1.name}
                      </p>
                      <p className="text-gray-500">
                        {calculateDeckPower(tournamentResults.final.player1.deck).toFixed(1)}
                      </p>
                    </div>
                    <div className="px-2">
                      <span className="font-semibold text-gray-500">VS</span>
                    </div>
                    <div className="flex-1 text-center">
                      <p className={tournamentResults.final.winner?.id === tournamentResults.final.player2.id ? 'font-bold text-green-600' : 'text-gray-600'}>
                        {tournamentResults.final.player2.name}
                      </p>
                      <p className="text-gray-500">
                        {calculateDeckPower(tournamentResults.final.player2.deck).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Third Place Match</h4>
                <div className="bg-white rounded-lg p-2 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex-1 text-center">
                      <p className={tournamentResults.thirdPlace.winner?.id === tournamentResults.thirdPlace.player1.id ? 'font-bold text-green-600' : 'text-gray-600'}>
                        {tournamentResults.thirdPlace.player1.name}
                      </p>
                      <p className="text-gray-500">
                        {calculateDeckPower(tournamentResults.thirdPlace.player1.deck).toFixed(1)}
                      </p>
                    </div>
                    <div className="px-2">
                      <span className="font-semibold text-gray-500">VS</span>
                    </div>
                    <div className="flex-1 text-center">
                      <p className={tournamentResults.thirdPlace.winner?.id === tournamentResults.thirdPlace.player2.id ? 'font-bold text-green-600' : 'text-gray-600'}>
                        {tournamentResults.thirdPlace.player2.name}
                      </p>
                      <p className="text-gray-500">
                        {calculateDeckPower(tournamentResults.thirdPlace.player2.deck).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleBackToSummary}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-4"
            >
              Back to Summary
            </button>
          </div>
        </>
      )}
    </div>
  );

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

        {currentScreen === "builder" && renderBuilderScreen()}
        {currentScreen === "summary" && renderSummaryScreen()}
        {currentScreen === "battle" && renderBattleScreen()}
        {currentScreen === "tournament" && renderTournamentScreen()}

        <p className="text-center text-sm text-gray-500">
          {inTelegram ? "Running in Telegram" : "Running in browser"}
        </p>
      </div>
    </main>
  );
}
