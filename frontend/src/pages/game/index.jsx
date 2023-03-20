import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";

import AuthStore from "@/stores/Auth";
import Canvas from "./Canvas";
import Chat from "./Chat";
import ChooseWord from "./ChooseWord";

import socket from "@/socket";

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

export default function Game() {
  const navigate = useNavigate();

  const username = AuthStore.useState(s => s.username);

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [playersList, setPlayersList] = useState([]);
  const [wordsToChooseFrom, setWordsToChooseFrom] = useState(null);
  const [word, setWord] = useState("drawer is choosing word");
  const [started, setStarted] = useState(false);

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
      socket.emit("leave");
    }
  }, [username]);

  if (!isConnected) {
    return <div>not connected</div>
  }

  function chooseWord(word) {
    setWordsToChooseFrom(null);
    setWord(word);
    socket.emit("chose-word", word);
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
            playersList.map((player, index) =>
              <PlayerCard key={index} isSelf={username == player.username} guessed={player.guessed}>
                {player.username}
              </PlayerCard>
            )
          }
        </PlayersPanel>
        {
          started ? <Canvas /> : (
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
