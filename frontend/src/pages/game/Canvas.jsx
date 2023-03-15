import styled from "@emotion/styled"
import { useEffect, useRef } from "react";

// todo: fix shadow
const CanvasC = styled.canvas`
  width: 100%;
  height: 100%;
  margin: 0px 10px;
  border-radius: 10px;
  border: 3px solid rgba(63,29,64,1);
  box-shadow: inset 0 0 10px black;
`;

export default function Canvas() {

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationId;
    function animate() {
      animationId = requestAnimationFrame(animate);

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    }

  }, [canvasRef])

  return <CanvasC ref={canvasRef}/>
}
