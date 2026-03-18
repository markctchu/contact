import { useState, useEffect } from 'react';
import { socket } from '../socket';
import { EVENTS } from '../constants';

function Lobby({ username, onCreateRoom, onJoinRoom }) {
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
    <div className="max-w-4xl mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-blue-400 mb-2 tracking-tight">Contact</h1>
        <p className="text-gray-400">Welcome, <span className="text-white font-semibold">{username}</span></p>
      </header>

      <div className="grid md:grid-cols-2 gap-12">
        <section className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            Create a New Room
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (newRoomName.trim()) {
              onCreateRoom(newRoomName.trim());
              setNewRoomName('');
            }
          }}>
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Room Name"
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:transform active:scale-95"
            >
              Launch Room
            </button>
          </form>
        </section>

        <section className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
            Active Rooms
            <span className="text-sm font-normal text-gray-400 bg-gray-900 px-3 py-1 rounded-full">{rooms.length}</span>
          </h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {rooms.length === 0 ? (
              <p className="text-gray-500 text-center py-8 italic">No active rooms found. Start one!</p>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-gray-900 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500 border border-transparent transition-all"
                >
                  <div>
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{room.name}</h3>
                    <p className="text-xs text-gray-500">{room.playerCount} Players • {room.status}</p>
                  </div>
                  <button
                    onClick={() => onJoinRoom(room.id)}
                    className="bg-gray-800 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm group-hover:shadow-blue-900"
                  >
                    Join
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
