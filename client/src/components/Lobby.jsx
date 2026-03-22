import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';

function Lobby({ username, onCreateRoom, onJoinRoom }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    console.log('[Lobby] Requesting rooms list...');
    socket.emit(EVENTS.GET_ROOMS);
    socket.on(EVENTS.ROOMS_LIST, (roomsList) => {
      console.log('[Lobby] Received rooms:', roomsList.length);
      setRooms(roomsList);
    });
    return () => socket.off(EVENTS.ROOMS_LIST);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full p-4 overflow-hidden">
      <header className="mb-8 text-center shrink-0">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-400 mb-2 tracking-tight">Contact</h1>
        <p className="text-gray-400 text-sm">Welcome, <span className="text-white font-semibold">{username}</span></p>
      </header>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-12 w-full min-h-0 overflow-hidden">
        <section className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700 flex flex-col shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
            Create a New Room
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (newRoomName.trim()) {
              onCreateRoom(newRoomName.trim());
              setNewRoomName('');
            }
          }} className="mt-auto" autoComplete="off">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room Name"
              name={`room_name_${Math.random().toString(36).substring(7)}`}
              autoComplete="off"
              data-form-type="other"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl transition-all shadow-lg active:scale-95"
            >
              LAUNCH ROOM
            </button>
          </form>
        </section>

        <section className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-700 flex flex-col min-h-0 overflow-hidden">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center justify-between shrink-0">
            Active Rooms
            <span className="text-sm font-normal text-gray-400 bg-gray-900 px-3 py-1 rounded-full">{rooms.length}</span>
          </h2>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
            {rooms.length === 0 ? (
              <p className="text-gray-500 text-center py-8 italic">No active rooms found. Start one!</p>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-gray-900 p-3 sm:p-4 rounded-xl flex items-center justify-between group hover:border-blue-500 border border-transparent transition-all shrink-0"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors truncate">{room.name}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">{room.playerCount} Players • {room.status}</p>
                  </div>
                  <button
                    onClick={() => onJoinRoom(room.id)}
                    className="bg-gray-800 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-bold transition-all shadow-sm group-hover:shadow-blue-900 shrink-0"
                  >
                    JOIN
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Lobby;
