import { useState, useEffect } from 'react';
import CentralArea from './CentralArea';
import BottomInput from './BottomInput';
import { socket } from '../socket';
import { Users } from 'lucide-react';
import { EVENTS } from '../constants';

function GameRoom({ room, typingStatus, username, socketId }) {
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on(EVENTS.CHAT_UPDATE, (updatedChat) => {
      setChat(updatedChat);
    });
    return () => socket.off(EVENTS.CHAT_UPDATE);
  }, []);

  const isWordmaster = room.wordmaster === socketId;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-950 text-white overflow-hidden">
      {/* Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-3 sm:px-6 py-2 sm:py-4 flex justify-between items-center shadow-lg z-10 shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
            <h1 className="text-lg sm:text-xl font-black leading-none">C</h1>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">{room.name}</h2>
            <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-bold">Active Room</p>
          </div>
        </div>
        
        <div className="flex items-center bg-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-gray-700">
          <Users size={16} className="text-blue-400 mr-2" />
          <span className="text-xs sm:text-sm font-black">{room.players.length}</span>
          <span className="hidden sm:inline text-xs text-gray-400 ml-2 font-bold uppercase tracking-tighter">Players</span>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-0.5 sm:p-8 bg-gradient-to-b from-gray-900/20 to-transparent overflow-hidden">
          <CentralArea room={room} typingStatus={typingStatus} socketId={socketId} />
        </div>

        {/* Bottom Section (Includes Chat) */}
        <section className="bg-gray-900 border-t border-gray-800 shadow-2xl shrink-0">
          <BottomInput 
            room={room} 
            socketId={socketId}
            chat={chat}
            isWordmaster={isWordmaster}
          />
        </section>
      </main>
    </div>
  );
}

export default GameRoom;
