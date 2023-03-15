import styled from "@emotion/styled"

import socket from "@/socket";
import { useEffect, useRef, useState } from "react";
import AuthStore from "@/stores/Auth";

const ChatContainer = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 220px;
  max-width: 220px;
  height: 100%;
  border-radius: 10px;
`;

const ChatTitle = styled.div`
  text-align: center;
  border-radius: 6px;
  margin-top: 10px;
`;

const ChatInput = styled.input`
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 10px;
  margin: 5px;
  outline: none;
  border-radius: 6px;
`;

const ChatLog = styled.div`
  font-size: 0.9em;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 5px;
  border-radius: 6px;
  overflow-y: scroll;
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const ChatMsg = styled.div`
  margin: 1px 3px;
  padding: 3px;
  height: fit-content;
  overflow-wrap: break-word;

  ${({ isLog }) => isLog && "color: yellow;"}

  span {
    color: ${({ isSelf }) => isSelf ? "green" : "white" };
  }

`;

export default function Chat() {
  const myUsername = AuthStore.useState(s => s.username);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const chatLogRef = useRef(null);

  useEffect(() => {
    // todo: set max messages
    socket.on("chat-msg", (msg) => {
      setMessages(old => [...old, msg]);
    });
  }, []);

  useEffect(() => {
    chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
  }, [messages]);

  function sendChat() {
    socket.emit("sent-chat-msg", message);
    setMessage("");
  }

  // todo: limit message length
  function onChange(evt) {
    setMessage(evt.target.value);
  }

  function onKeyDown(key) {
    if (key.code == "Enter") {
      sendChat();
    }
  }

  return (
    <ChatContainer>
      <ChatTitle>chat</ChatTitle>
      <ChatLog ref={chatLogRef}>
      {
        messages.map(({ isLog, username, msg }, index) => (
          <ChatMsg key={index} isSelf={myUsername == username} isLog={isLog}>
            {
              isLog ? msg : (
                <>
                  <span>{ username }</span>: { msg }
                </>
              )
            }
          </ChatMsg>
        ))
      }
    </ChatLog>
      <ChatInput placeholder="type here" value={message} onChange={onChange} onKeyDown={onKeyDown}/>
    </ChatContainer>
  )
}
