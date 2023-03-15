import { Server } from "socket.io";

import Room from "./room.js";

const MAX_PLAYERS_PER_ROOM = 6;

const rooms = {};
const playersMap = new Map();

let io;

function getAvailableRoom() {
  for (const room of Object.keys(rooms)) {
    const roomSize = rooms[room].players.length;
    if (roomSize < MAX_PLAYERS_PER_ROOM) {
      return room;
    }
  }

  const newRoom = `room${Object.keys(rooms).length + 1}`;
  rooms[newRoom] = new Room(newRoom);
  return newRoom;
}

// todo: feature to join a requested room
async function handlePlayerJoin(socket, username) {
  const roomName = getAvailableRoom();
  console.log(`client ${socket.id}:${username} joined ${roomName}`);
  socket.join(roomName);

  const room = rooms[roomName];

  playersMap.set(socket.id, { username, roomName });

  room.addPlayer({ socket, username });
}

// todo: handle reconnect
async function handlePlayerLeft(socket) {
  const player = playersMap.get(socket.id);

  if (!player) {
    return;
  }

  const { username, roomName } = player;

  socket.leave(roomName);

  console.log(`client ${socket.id}:${username} left ${roomName}`);

  rooms[roomName].removePlayer(socket.id);

  playersMap.delete(socket.id);

  if (rooms[roomName].players.length <= 0) {
    delete rooms[roomName];
  }
}

export default function controller(server) {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.on("join", ({ username }) => {
      handlePlayerJoin(socket, username);
    });

    socket.on("leave", () => {
      handlePlayerLeft(socket);
    });

    socket.on("disconnect", () => {
      handlePlayerLeft(socket);
    });
  });

  return io;
}

export { io, playersMap };
