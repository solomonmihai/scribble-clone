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

  onChatMsg(player, msg) {
    msg = msg.trim();
    if (msg == '') {
      return;
    }

    io.to(this.name).emit("chat-msg", { username: player.username, msg });

    if (this.drawer.socket.id != player.socket.id) {
      if (msg == this.word) {
        player.socket.emit("guessed-word", this.word);
        player.socket.emit("chat-msg", { isLog: true, msg: `you guessed right: ${this.word}` });
        player.socket.to(this.name).emit("chat-msg", {
          isLog: true,
          msg: `${player.username} guessed the word`
        });

        this.players = this.players.map(p => p.socket.id == player.socket.id ? { ...p, guessed: true } : p);

        this.sendPlayersList();
      }
    }
  }

  addPlayer(player) {
    this.players.push(player)
    this.sendPlayersList();

    // todo: maybe keep a log of the chat for new players that join
    player.socket.on("sent-chat-msg", (msg) => {
      this.onChatMsg(player, msg)
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

    // send start event to all except the drawer
    this.drawer.socket.to(this.name).emit("started");

    const wordsToChooseFrom = new Array(3).fill(null).map(() => this.chooseWord());

    this.drawer.socket.emit("choose-word", wordsToChooseFrom);

    this.drawer.socket.on("chose-word", (word) => {
      this.word = word;
      // send start event to drawer
      io.to(this.drawer.socket.id).emit("started");
      // sent the word length to the other players
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
