import React from 'react';
import { Target, Users, ShieldAlert, Zap, Trophy, HelpCircle } from 'lucide-react';

export const RulesContent = () => (
  <div className="space-y-8 text-on-surface pb-8">
    {/* Header */}
    <header className="border-b border-outline-variant pb-6 mb-6">
      <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
        <HelpCircle className="text-tertiary" size={32} />
        How to Play Contact
      </h2>
      <p className="mt-2 text-on-surface-variant font-medium opacity-70 italic">
        A high-stakes game of definitions, teamwork, and mental agility.
      </p>
    </header>

    {/* Section: The Objective */}
    <section className="space-y-3">
      <h3 className="text-lg font-black uppercase tracking-widest text-tertiary flex items-center gap-2">
        <Target size={20} />
        The Objective
      </h3>
      <p className="text-sm sm:text-base leading-relaxed">
        The <strong>Wordmaster</strong> chooses a secret word. The <strong>Players</strong> work together to reveal that word, letter by letter, by submitting clues that the Wordmaster cannot solve, but other Players can.
      </p>
    </section>

    {/* Section: Wordmaster's Role */}
    <section className="space-y-4 bg-surface-low/50 p-4 sm:p-6 rounded-2xl border border-outline-variant">
      <h3 className="text-lg font-black uppercase tracking-widest text-primary flex items-center gap-2">
        <Users size={20} />
        The Wordmaster
      </h3>
      <ul className="space-y-3 text-sm sm:text-base">
        <li className="flex gap-3">
          <span className="text-primary font-black mt-1">1.</span>
          <span><strong>Start the Game:</strong> Tap "Wordmaster" at the bottom to begin. Choose a secret word (e.g., "MOONLIGHT"). The first letter ("M") is revealed immediately.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-primary font-black mt-1">2.</span>
          <span><strong>Intercepting:</strong> If a player submits a clue (e.g., "A satellite of Earth"), you must quickly identify their word ("MOON") and tap <strong>Deny</strong> before they make contact.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-primary font-black mt-1">3.</span>
          <span><strong>Winning:</strong> If you successfully defend your word until you can "Declare Victory" (when no one can think of a clue), you win the round!</span>
        </li>
      </ul>
    </section>

    {/* Section: The Players' Role */}
    <section className="space-y-4 bg-tertiary/5 p-4 sm:p-6 rounded-2xl border border-tertiary/10">
      <h3 className="text-lg font-black uppercase tracking-widest text-tertiary flex items-center gap-2">
        <Zap size={20} />
        The Players
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-black text-sm uppercase opacity-60 italic">Step 1: Submit a Guess</h4>
          <p className="text-sm sm:text-base leading-relaxed">
            Submit a word that starts with the revealed letters. Once submitted, you must provide a <strong>Clue</strong> for that word without saying the word itself.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-black text-sm uppercase opacity-60 italic">Step 2: Make Contact!</h4>
          <p className="text-sm sm:text-base leading-relaxed">
            Other players see your clue. If they know your word, they tap <strong>Contact!</strong> and submit their guess. If their word matches yours after a 4-second countdown, <strong>Contact is successful!</strong>
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-black text-sm uppercase opacity-60 italic">Step 3: Reveal Letters</h4>
          <p className="text-sm sm:text-base leading-relaxed">
            A successful contact forces the Wordmaster to reveal the <strong>next letter</strong> of the secret word. Reveal all letters to win!
          </p>
        </div>
      </div>
    </section>

    {/* Section: Core Rules */}
    <section className="space-y-4">
      <h3 className="text-lg font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
        <ShieldAlert size={20} />
        The Golden Rules
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border border-outline-variant rounded-xl">
          <strong className="block mb-1 text-xs uppercase opacity-50">Timing</strong>
          <p className="text-sm leading-snug">The Wordmaster has 4 seconds to intercept once a player attempts contact. Speed is everything!</p>
        </div>
        <div className="p-4 border border-outline-variant rounded-xl">
          <strong className="block mb-1 text-xs uppercase opacity-50">Validity</strong>
          <p className="text-sm leading-snug">All words must be in the dictionary and must start with the currently revealed letters.</p>
        </div>
        <div className="p-4 border border-outline-variant rounded-xl">
          <strong className="block mb-1 text-xs uppercase opacity-50">Victory Defense</strong>
          <p className="text-sm leading-snug">If the Wordmaster declares victory, any player can "Contest" by submitting a valid guess before the 10-second timer ends.</p>
        </div>
        <div className="p-4 border border-outline-variant rounded-xl">
          <strong className="block mb-1 text-xs uppercase opacity-50">No Repeats</strong>
          <p className="text-sm leading-snug">You cannot reuse words that have already been correctly identified or intercepted.</p>
        </div>
      </div>
    </section>

    {/* Section: Winning */}
    <footer className="pt-6 border-t border-outline-variant mt-12 flex flex-col items-center text-center">
      <div className="bg-primary/10 p-4 rounded-full mb-4">
        <Trophy className="text-primary" size={40} />
      </div>
      <h3 className="text-xl font-black uppercase tracking-widest mb-2">Victory</h3>
      <p className="text-sm text-on-surface-variant max-w-sm">
        Players win by revealing the full secret word. The Wordmaster wins by successfully declaring victory or exhausting the players' ideas.
      </p>
    </footer>
  </div>
);
