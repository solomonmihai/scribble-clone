import io from "socket.io-client";

console.log('connecting')
const socket = io("localhost:3000");

export default socket;
