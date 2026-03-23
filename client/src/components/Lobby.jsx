import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';
import { STRINGS } from '../constants/strings';
import { Sun, Moon } from 'lucide-react';

function Lobby({ username, onCreateRoom, onJoinRoom, toggleTheme, theme }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    socket.emit(EVENTS.GET_ROOMS);
    socket.on(EVENTS.ROOMS_LIST, (roomsList) => {
      setRooms(roomsList);
    });
    return () => socket.off(EVENTS.ROOMS_LIST);
  }, []);

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-6 sm:p-12 overflow-hidden">
      <header className="mb-12 flex justify-between items-start shrink-0">
        <div className="text-left">
          <h1 className="text-6xl sm:text-7xl font-extrabold text-on-surface tracking-tighter mb-2">{STRINGS.LOBBY_TITLE}</h1>
          <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold opacity-40 ml-1">
            {STRINGS.LOBBY_SUBTITLE(username)}
          </p>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-surface-low hover:bg-surface-container transition-all ambient-shadow"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>
      </header>

      <div className="grid md:grid-cols-12 gap-8 sm:gap-16 w-full min-h-0 overflow-hidden flex-1">
        {/* Active Rooms List - The Hero */}
        <section className="md:col-span-7 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <h2 className="text-2xl font-bold tracking-tight">{STRINGS.ROOM_LIST_HEADER}</h2>
            <span className="text-xs font-black text-on-surface-variant bg-surface-low px-4 py-1.5 rounded-full uppercase tracking-tighter">
              {rooms.length} {STRINGS.ROOM_COUNT_SUFFIX}
            </span>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-4 custom-scrollbar min-h-0">
            {rooms.length === 0 ? (
              <div className="bg-surface-low/50 rounded-xl p-12 text-center border-2 border-dashed border-on-surface/5">
                <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold opacity-30 italic">{STRINGS.NO_ROOMS_MSG}</p>
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="group bg-surface-lowest p-6 rounded-xl ambient-shadow flex items-center justify-between transition-all hover:translate-x-1"
                >
                  <div className="min-w-0 flex-1 mr-6">
                    <h3 className="text-xl font-bold text-on-surface group-hover:text-tertiary transition-colors truncate tracking-tight">{room.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant opacity-40">{room.playerCount} Players</p>
                      <span className="w-1 h-1 rounded-full bg-on-surface/10"></span>
                      <p className="text-[10px] uppercase font-black tracking-widest text-tertiary opacity-60">{room.status}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onJoinRoom(room.id)}
                    className="bg-surface-container hover:bg-surface-high text-on-surface px-6 py-2.5 rounded-full text-xs font-black transition-all uppercase tracking-widest shrink-0"
                  >
                    {STRINGS.JOIN_BUTTON}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Create Room - The Aside */}
        <section className="md:col-span-5 flex flex-col shrink-0 self-start">
          <div className="bg-surface-low p-8 sm:p-10 rounded-xl border border-outline-variant">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">{STRINGS.CREATE_HEADER}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newRoomName.trim()) {
                onCreateRoom(newRoomName.trim());
                setNewRoomName('');
              }
            }} className="space-y-6" autoComplete="off">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder={STRINGS.ROOM_NAME_PLACEHOLDER}
                name="room_designation_field"
                autoComplete="off"
                role="presentation"
                data-form-type="other"
                readOnly
                onFocus={(e) => e.target.readOnly = false}
                onBlur={(e) => e.target.readOnly = true}
                className="w-full bg-surface-lowest rounded-xl px-6 py-4 focus:outline-none border-2 border-transparent focus:border-tertiary/20 text-on-surface font-bold transition-all placeholder:text-on-surface/20"
              />
              <button
                type="submit"
                className="w-full cta-gradient text-on-primary-container font-black py-4 rounded-full transition-all active:scale-[0.98] shadow-lg uppercase tracking-widest text-xs"
              >
                {STRINGS.CREATE_BUTTON}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Lobby;
