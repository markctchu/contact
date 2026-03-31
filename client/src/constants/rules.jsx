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
        A game about having the last word.
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
          <span><strong>Start the Game:</strong> Tap "Wordmaster" at the bottom to begin. Choose a secret word (e.g., "DUCK"). The first letter ("D") is revealed immediately.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-primary font-black mt-1">2.</span>
          <span><strong>Intercepting:</strong> If a player submits a clue (e.g., "A type of flower"), you must quickly identify their word ("DAISY") and tap <strong>Deny</strong> before they make contact with another player. If you identified incorrectly (it was "DAFFODIL"), the clue is still 'live'.</span>
        </li>
        <li className="flex gap-3">
          <span className="text-primary font-black mt-1">3.</span>
          <span><strong>Endure & Exhaust:</strong> If you successfully deny guesses until no one can think of any new ones, you can <strong>Declare Victory</strong> to win the round!</span>
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
            Submit a Guess word that starts with the revealed letters. Once submitted, you must provide a <strong>Clue</strong> for that word without saying the word itself.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-black text-sm uppercase opacity-60 italic">Step 2: Make Contact!</h4>
          <p className="text-sm sm:text-base leading-relaxed">
            <strong>Everyone</strong> can see your clue. If they think they know your word, they tap <strong>Contact!</strong> and submit their guess. If the guesses match after a 4-second countdown, you've made <strong>Contact!</strong> If they don't match, the clue is still 'live'.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-black text-sm uppercase opacity-60 italic">Step 3: Reveal Letters</h4>
          <p className="text-sm sm:text-base leading-relaxed">
            Making <strong>Contact!</strong> reveals the <strong>next letter</strong> of the secret word. If you <strong>Contact!</strong> using the secret word as a guess, you win the round!
          </p>
        </div>
      </div>
    </section>

    {/* Section: Additional Rules and Guidelines */}
    <section className="space-y-4">
      <h3 className="text-lg font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
        <ShieldAlert size={20} />
        A FEW THINGS TO NOTE
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 border border-outline-variant rounded-xl">
          <strong className="block mb-1 text-xs uppercase opacity-50">Nice Try</strong>
          <p className="text-sm leading-snug">For reasons that should be obvious, the Wordmaster cannot <strong>Deny</strong> their secret word. </p>
        </div>
        <div className="p-4 border border-outline-variant rounded-xl">
          <strong className="block mb-1 text-xs uppercase opacity-50">Double Jeopardy</strong>
          <p className="text-sm leading-snug">You cannot reuse words that have already been correctly identified or intercepted.</p>
        </div>
        <div className="p-4 border border-outline-variant rounded-xl">
          <strong className="block mb-1 text-xs uppercase opacity-50">Play Fair</strong>
          <p className="text-sm leading-snug">Secret Words and Guesses should be pulled from general knowledge. Winning with a word everyone knows is cool. Winning with a word no one knows is not.</p>
        </div>
        <div className="p-4 border border-outline-variant rounded-xl">
          <strong className="block mb-1 text-xs uppercase opacity-50">"Um akshually..."</strong>
          <p className="text-sm leading-snug">Avoid derivative words and plural forms. Playing whack-a-mole with "CONSTRUCTS", "CONSTRUCTIONS", "CONSTRUCTABLE", and "CONSTRUCTABILITY" is just tedious.</p>
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
        Players win by making <strong>Contact!</strong> with the secret word. Wordmaster wins by <strong>Deny</strong>ing guesses until Players run out of them.
      </p>
    </footer>
  </div>
);
