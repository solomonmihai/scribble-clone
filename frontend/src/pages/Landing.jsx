import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";

import AuthStore from "@/stores/Auth";
import { useState } from "react";

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const Intro = keyframes`
  0% {
    transform: translateY(100%) scale(0.8);
    opacity: 0;
  }
  60% {
    transform: translateY(-30%) scale(1.2);
  }
  80% {
    transform: translateY(10%) scale(0.9);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`;

const InnerContainer = styled(Container)`
  animation: ${Intro} 0.5s ease-in forwards;
`;

// TODO: each letter a dif color
const Title = styled.div`
  color: white;
  font-size: 3em;
  font-weight: bold;
  width: fit-content;
  height: fit-content;
`;

const JoinButton = styled.button`
  padding: 10px 20px;
  margin-left: 10px;
  background: none;
  border-radius: 10px;
  border: 3px solid white;
  cursor: pointer;
  font-size: 1.4em;
  font-style: italic;
  color: white;
  transition: 0.1s ease-in;
  z-index: 1;
  position: relative;

  outline: 0;
  overflow:hidden;
  transition: 0.08s ease-in;

&:hover {
  color: black;
}

&:before {
  content: "";
  position: absolute;
  background: white;
  bottom: 0;
  left: 0;
  right: 0;
  top: 100%;
  z-index: -1;
  -webkit-transition: top 0.06s ease-in;
}

&:hover:before {
  top: 0;
}
`;

const UsernameInput = styled.input`
  margin-top: 30px;
  width: 210px;
  padding: 10px;
  border: 3px solid white;
  border-radius: 10px;
  outline: none;
  font-size: 1.3em;
  background: none;
  color: white;
  font-style: italic;

&::placeholder {
  color: #666;
}
`;

export default function Landing() {
  const navigate = useNavigate();

  const username = AuthStore.useState(s => s.username) || "";

  const [error, setError] = useState(null);

  // TODO: validate username
  function join() {
    if (username.trim().length < 4) {
      setError("min 4 characters")
      return;
    }
    AuthStore.update(s => {
      s.username = username;
    });

    navigate("/game");
  }

  function onChange(evt) {
    AuthStore.update(s => {
      s.username = evt.target.value;
    });
  }

  return (
    <Container>
      <InnerContainer>
        <Title>skribble clone</Title>
        <div>
          <UsernameInput placeholder="username ..." value={username} onChange={onChange} />
          <JoinButton onClick={join}>join</JoinButton>
        </div>
        <div style={{ color: "red", marginTop: "7px", opacity: error ? "1" : "0" }}>{error || "x"}</div>
      </InnerContainer>
    </Container>
  )
}
