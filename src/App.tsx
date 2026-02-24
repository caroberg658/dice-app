/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, RotateCcw, Settings2, Check, X, Minus, Plus } from 'lucide-react';

// --- Types ---

interface DieState {
  id: string;
  value: number;
  isExcluded: boolean;
  color: string;
}

const COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Slate', value: '#475569' },
];

// --- Components ---

interface DieProps {
  die: DieState;
  onToggleExclude: (id: string) => void;
  key?: string | number;
}

/**
 * Individual Die component
 */
function Die({ die, onToggleExclude }: DieProps) {
  const dotPositions = [
    [], // 0 (not used)
    [4], // 1
    [0, 8], // 2
    [0, 4, 8], // 3
    [0, 2, 6, 8], // 4
    [0, 2, 4, 6, 8], // 5
    [0, 2, 3, 5, 6, 8], // 6
  ];

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: die.isExcluded ? 0.5 : 1,
        filter: die.isExcluded ? 'grayscale(0.5)' : 'grayscale(0)'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onToggleExclude(die.id)}
      className="relative cursor-pointer group"
    >
      {/* Die Face */}
      <motion.div
        key={die.value}
        initial={{ rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{ backgroundColor: die.color }}
        className="aspect-square rounded-2xl shadow-lg flex items-center justify-center p-4 relative overflow-hidden"
      >
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
        
        {/* Dots Grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              {dotPositions[die.value].includes(i) && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-full h-full max-w-[12px] max-h-[12px] bg-white rounded-full shadow-xs" 
                />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Status Indicator */}
      <div className="absolute -top-2 -right-2">
        {die.isExcluded ? (
          <div className="bg-zinc-800 text-white p-1 rounded-full shadow-md">
            <X size={12} />
          </div>
        ) : (
          <div className="bg-emerald-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <Check size={12} />
          </div>
        )}
      </div>
    </motion.div>
  );
}


export default function App() {
  const [diceCount, setDiceCount] = useState(5);
  const [selectedColors, setSelectedColors] = useState<string[]>([COLORS[1].value]); // Default Blue
  const [dice, setDice] = useState<DieState[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  // Roll All Dice
  const rollAll = () => {
    if (isRolling) return;
    setIsRolling(true);
    
    // Simulate rolling animation
    let rolls = 0;
    const interval = setInterval(() => {
      setDice(prev => prev.map(die => {
        if (die.isExcluded) return die;
        return { ...die, value: Math.floor(Math.random() * 6) + 1 };
      }));
      rolls++;
      if (rolls > 10) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 50);
  };

  // Toggle Exclude
  const toggleExclude = (id: string) => {
    setDice(prev => prev.map(die => 
      die.id === id ? { ...die, isExcluded: !die.isExcluded } : die
    ));
  };

  // Handle Color Toggle
  const toggleColor = (colorValue: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorValue)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== colorValue);
      }
      // Limit selected colors to dice count
      if (prev.length >= diceCount) {
        return prev;
      }
      return [...prev, colorValue];
    });
  };

  // Distribution logic: assigns colors as evenly as possible
  const distributeColors = useCallback((count: number, colors: string[]) => {
    if (colors.length === 0) return Array(count).fill('#475569');
    const result: string[] = [];
    const baseCount = Math.floor(count / colors.length);
    const remainder = count % colors.length;

    for (let i = 0; i < colors.length; i++) {
      const colorCount = baseCount + (i < remainder ? 1 : 0);
      for (let j = 0; j < colorCount; j++) {
        result.push(colors[i]);
      }
    }
    return result;
  }, []);

  // Synchronize dice with count and colors
  useEffect(() => {
    const colorDistribution = distributeColors(diceCount, selectedColors);
    
    setDice(prev => {
      const nextDice = [...prev];
      
      // Adjust count
      if (nextDice.length < diceCount) {
        for (let i = nextDice.length; i < diceCount; i++) {
          nextDice.push({
            id: Math.random().toString(36).substr(2, 9),
            value: Math.floor(Math.random() * 6) + 1,
            isExcluded: false,
            color: colorDistribution[i],
          });
        }
      } else if (nextDice.length > diceCount) {
        nextDice.splice(diceCount);
      }
      
      // Apply even distribution of colors
      return nextDice.map((die, index) => ({
        ...die,
        color: colorDistribution[index]
      }));
    });
  }, [diceCount, selectedColors, distributeColors]);

  // Handle Dice Count Change with color limit check
  const updateDiceCount = (newCount: number) => {
    const clampedCount = Math.min(10, Math.max(1, newCount));
    setDiceCount(clampedCount);
    
    // If we have more colors than dice, trim the colors
    if (selectedColors.length > clampedCount) {
      setSelectedColors(prev => prev.slice(0, clampedCount));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:py-12">
      {/* Header */}
      <header className="text-center mb-12">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <Dices className="text-indigo-600" size={32} />
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Dice Roller</h1>
        </motion.div>
        <p className="text-zinc-500 max-w-md mx-auto">
          Tap a die to exclude it from the next roll. Customize colors and count below.
        </p>
      </header>

      {/* Main Dice Area */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center">
        <div className="dice-grid mb-12">
          <AnimatePresence mode="popLayout">
            {dice.map((die) => (
              <Die key={die.id} die={die} onToggleExclude={toggleExclude} />
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={rollAll}
            disabled={isRolling}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCcw size={20} className={isRolling ? 'animate-spin' : ''} />
            Roll All Dice
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setDice(prev => prev.map(die => ({
                ...die,
                value: Math.floor(Math.random() * 6) + 1,
                isExcluded: false,
              })));
            }}
            className="px-8 py-4 bg-white text-zinc-700 border border-zinc-200 rounded-2xl font-bold shadow-sm hover:bg-zinc-50 transition-colors flex items-center gap-2"
          >
            Reset All
          </motion.button>
        </div>

        {/* Settings Panel */}
        <section className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-100">
          <div className="flex items-center gap-2 mb-6 text-zinc-400">
            <Settings2 size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Dice Count Stepper */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-3">Number of Dice</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => updateDiceCount(diceCount - 1)}
                  aria-label="Decrease dice count"
                  className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="text-2xl font-bold w-8 text-center">{diceCount}</span>
                <button 
                  onClick={() => updateDiceCount(diceCount + 1)}
                  aria-label="Increase dice count"
                  className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-2">Min: 1, Max: 10</p>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-3">Dice Colors</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => toggleColor(color.value)}
                    title={color.name}
                    className="relative w-8 h-8 rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: color.value }}
                  >
                    {selectedColors.includes(color.value) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={16} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-2">Pick up to {diceCount} colors (distributed evenly)</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-zinc-400 text-xs">
        Built with React & Tailwind CSS
      </footer>
    </div>
  );
}
