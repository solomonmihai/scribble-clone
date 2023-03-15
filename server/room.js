import { io, playersMap } from "./controller.js";

import words from "./words.js";

const DRAW_TIME = 60;

export default class Room {
  constructor(name) {
    this.name = name;
    this.players = [];
    this.oldDrawersIds = [];
    this.drawer = null;
    this.words = [...words];
    this.word = null;
  }

  all(...args) {
    io.to(this.name).emit(...args);
  }

  sendPlayersList() {
    const players = this.players.map(p => ({ username: p.username }));
    this.all("players-list", { players });
  }

  addPlayer(player) {
    this.players.push(player)
    this.sendPlayersList();

    // todo: maybe keep a log of the chat for new players that join
    player.socket.on("sent-chat-msg", (msg) => {
      if (msg.trim() == '') {
        return;
      }
      // todo: sometimes playerMap[socket.id] is undefined
      io.to(this.name).emit("chat-msg", { username: player.username, msg });
    });

    this.all("chat-msg", {
      isLog: true,
      msg: `${player.username} joined`
    });

    this.checkStart();
  }

  checkStart() {
    if (this.players.length < 2) {
      return;
    }

    this.startGame();
  }

  chooseWord() {
    const index = Math.floor(Math.random() * this.words.length);
    const word = this.words[index];
    this.words.splice(index, 1);
    return word;
  }

  chooseDrawer() {
    const player = this.players[Math.floor(Math.random() * this.players.length)];
    if (this.oldDrawersIds.indexOf(player.socket.id) != -1) {
      return this.chooseDrawer();
    }

    this.oldDrawersIds.push(player.socket.id);

    return player;
  }

  startGame() {
    this.drawer = this.chooseDrawer();

    const wordsToChooseFrom = new Array(3).fill(null).map(() => this.chooseWord());

    io.to(this.drawer.socket.id).emit("choose-word", wordsToChooseFrom);

    this.drawer.socket.on("chose-word", (word) => {
      this.word = word;

      this.drawer.socket.to(this.name).emit("word-length", this.word.length);
    });
  }

  removePlayer(sockid) {
    this.players = this.players.filter(p => p.socket.id != sockid);
    this.sendPlayersList();
    this.all("chat-msg", {
      isLog: true,
      msg: `${playersMap.get(sockid).username} left`
    });
  }
}
