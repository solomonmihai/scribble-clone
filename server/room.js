import { customAlphabet } from "nanoid";

import { io, playersMap } from "./controller.js";

import words from "./words.js";

const nanoid = customAlphabet("abcdefghihjklmnopqrstuvxywz", 5);

const DRAW_TIME = 60;

export default class Room {
  constructor(name) {
    this.id = nanoid();
    this.name = name;
    this.players = [];
    this.oldDrawersIds = [];
    this.drawer = null;
    this.words = [...words];
    this.word = null;
    this.leader = null;
  }

  all(...args) {
    io.to(this.name).emit(...args);
  }

  sendPlayersList() {
    // remove the socket property from the list
    const players = this.players.map(p => {
      const { socket, ...rest } = p;
      return { sockid: socket.id, ...rest };
    });
    this.all("players-list", { players });
  }

  onChatMsg(player, msg) {
    msg = msg.trim();
    if (msg == '') {
      return;
    }

    io.to(this.name).emit("chat-msg", { username: player.username, msg });

    if (!this.drawer) {
      return;
    }

    if (this.drawer.socket.id != player.socket.id) {
      if (msg == this.word) {
        player.socket.emit("guessed-word", this.word);
        player.socket.emit("chat-msg", { isLog: true, msg: `you guessed right: ${this.word}` });
        player.socket.to(this.name).emit("chat-msg", {
          isLog: true,
          msg: `${player.username} guessed the word`
        });

        this.setPlayerProperty(player, "guessed", true);

        this.sendPlayersList();
      }
    }
  }

  addPlayer(player) {
    this.players.push(player)

    // todo: maybe keep a log of the chat for new players that join
    player.socket.on("sent-chat-msg", (msg) => {
      this.onChatMsg(player, msg)
    });

    player.socket.to(this.name).emit("chat-msg", {
      isLog: true,
      msg: `${player.username} joined`
    });

    // this first player to join the room becomes the leader
    // todo: if the leader leaves, the room, make the next player a leader
    if (this.players.length == 1) {
      this.setLeader(player);
    }

    this.sendPlayersList();
  }

  setPlayerProperty(player, property, value) {
    this.players = this.players.map(p => {
      if (p.socket.id == player.socket.id) {
        p[property] = value;
      }
      return p;
    });
  }

  setLeader(player) {
    // todo: check if the player is valid
    this.leader = player;


    player.socket.emit("chat-msg", {
      isLog: true,
      msg: "you are now the room's leader"
    });

    player.socket.on("start-game", () => {
      this.startGame();
    });

    this.setPlayerProperty(player, "isLeader", true);
    this.sendPlayersList();
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
    if (this.players.length < 2) {
      // todo: send event saying that there are not enogh players
      return;
    }

    this.drawer = this.chooseDrawer();

    this.setPlayerProperty(this.drawer, "isDrawer", true);
    this.sendPlayersList();

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

    // drawing logic
    this.drawer.socket.on("draw-points", (points) => {
      this.drawer.socket.to(this.name).emit("draw-points", points);
    });
  }

  removePlayer(sockid) {
    this.players = this.players.filter(p => p.socket.id != sockid);
    this.sendPlayersList();
    this.all("chat-msg", {
      isLog: true,
      msg: `${playersMap.get(sockid).username} left`
    });

    if (this.leader.socket.id == sockid) {
      this.setLeader(this.players[0]);
    }
  }
}
