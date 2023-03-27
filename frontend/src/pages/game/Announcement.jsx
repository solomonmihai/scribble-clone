import { useState } from "react";

import styled from "@emotion/styled";
import colors from "../../colors";

const Container = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border: 2px solid ${colors.darkPurple};
  background-color: rgba(255, 255, 255, 0.15);
`;

export default function useAnnouncement() {
  const [open, setOpen] = useState(false);
  const [element, setElement] = useState(<></>);

  function openAnnouncement(time, element) {
    setElement(element)
    setOpen(true);
    setTimeout(() => {
      setOpen(false);
    }, time);
  }

  const Component =  open && (
    <Container>
      {element}
    </Container>
  );

  return [Component, openAnnouncement];
}
