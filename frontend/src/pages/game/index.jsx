import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";

import AuthStore from "@/stores/Auth";
import Canvas from "./Canvas";
import Chat from "./Chat";
import ChooseWord from "./ChooseWord";

import socket from "@/socket";
import colors from "../../colors";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 97%;
  min-height: 500px;
  height: 80vh;
`;

const PlayersPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 220px;
  height: 100%;
`;

const PlayerCard = styled.div`
  color: ${({ isSelf }) => isSelf ? 'green' : 'white'};
  padding: 10px;
  text-align: center;
  background-color: ${({ guessed }) => guessed ? "rgba(63, 29, 64, 0.3)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 10px;
  margin: 3px 0px;
  display: flex;
  justify-content: space-between;
`;

const TopBar = styled.div`
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  width: 96%;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
`;

const Word = styled.div`
  font-size: 1.4em;
  font-weight: bold;
  letter-spacing: 3px;
  text-transform: uppercase;
  width: fit-content;
`;

const WaitingToStart = styled.div`
  width: 100%;
  height: 100%;
  font-size: 2em;
  text-align: center;
`;

const LeaderPanel = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
`;

const StartButton = styled.button`
  color: white;
  border: none;
  border-bottom: 2px solid ${colors.white};
  background-color: transparent;
  font-size: 1rem;
  cursor: pointer;
`;

export default function Game() {
  const navigate = useNavigate();

  const username = AuthStore.useState(s => s.username);

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [playersList, setPlayersList] = useState([]);
  const [wordsToChooseFrom, setWordsToChooseFrom] = useState(null);
  const [word, setWord] = useState("drawer is choosing word");
  const [started, setStarted] = useState(false);

  const [playerProperties, setPlayerProperties] = useState({ username });

  useEffect(() => {
    if (!username) {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    if (!username) {
      return;
    }

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.emit("join", { username });

    socket.on("players-list", ({ players }) => {
      setPlayersList(players);

      for (const p of players) {
        if (p.sockid == socket.id) {
          setPlayerProperties(p);
          break;
        }
      }
    });

    socket.on("started", () => {
      setStarted(true);
    });

    socket.on("choose-word", (payload) => {
      setWordsToChooseFrom(payload);
    });

    socket.on("word-length", (wordLength) => {
      setWord(new Array(wordLength).fill("_").join(""));
    });

    socket.on("guessed-word", (payload) => {
      setWord(payload);
    });

    return () => {
      // todo: fix this
      socket.emit("leave");
      // socket.removeAllListeners();
    }
  }, [username, socket]);

  if (!isConnected) {
    return <div>not connected</div>
  }

  function chooseWord(word) {
    setWordsToChooseFrom(null);
    setWord(word);
    socket.emit("chose-word", word);
  }

  function startGame() {
    socket.emit("start-game");
  }

  return (
    <PageWrapper>
      {
        started && <TopBar>
          <Word>{word}</Word>
        </TopBar>
      }
      <LayoutWrapper>
        <PlayersPanel>
          {
            playerProperties.isLeader && (
              <LeaderPanel>
                {
                  !started && <StartButton onClick={startGame}>start game</StartButton>
                }
              </LeaderPanel>
            )
          }
          {
            playersList.map((player, index) =>
              <PlayerCard key={index} isSelf={player.sockid == socket.id} guessed={player.guessed}>
                <div style={{ width: "15px" }}>
                  {player.isLeader && "👑"}
                </div>
                {player.username}
                <div style={{ width: "15px" }}>
                  {player.guessed && "✅"}
                  {player.isDrawer && "🖌️"}
                </div>
              </PlayerCard>
            )
          }
        </PlayersPanel>
        {
          started ? <Canvas isDrawer={playerProperties.isDrawer} /> : (
            <WaitingToStart>waiting to start ...</WaitingToStart>
          )
        }
        <Chat />
        {
          wordsToChooseFrom && <ChooseWord words={wordsToChooseFrom} chooseWord={chooseWord} />
        }
      </LayoutWrapper>
    </PageWrapper>
  )
}
