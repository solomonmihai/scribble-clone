import styled from "@emotion/styled"
import colors from "../../colors";

const Container = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  border: 1px solid red;
  padding: 30px 80px;
  text-align: center;
  border-radius: 10px;
  border: 3px solid ${colors.purple};
  background-color: ${colors.darkPurple};
  box-shadow: 0px 0px 10px black;
`;

const Words = styled.div`
  display: flex;
`;

const Word = styled.div`
  padding: 10px 15px;
  background-color: ${colors.purple};
  border: 3px solid white;
  border-radius: 10px;
  margin: 0px 15px;
  transition: all 0.2s ease;

&:hover {
  background-color: white;
  color: black;
  cursor: pointer;
}
`;

const Title = styled.div`
  font-size: 1.4em;
  font-weight: bold;
  margin-bottom: 25px;
`;

export default function ChooseWord({ words, chooseWord }) {
  return (
    <Container>
      <Title>choose a word</Title>
      <Words>
        {
          words.map((word, index) => <Word key={index} onClick={() => {
            chooseWord(word);
          }}>{word}</Word>)
        }
      </Words>
    </Container>
  );
}
