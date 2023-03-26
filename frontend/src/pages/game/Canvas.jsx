import styled from "@emotion/styled"
import { useEffect, useRef } from "react";
import socket from "@/socket";

// todo: fix shadow
const CanvasC = styled.canvas`
  width: 100%;
  height: 100%;
  margin: 0px 10px;
  border-radius: 10px;
  border: 3px solid rgba(63,29,64,1);
  box-shadow: inset 0 0 10px black;
`;

export default function Canvas({ isDrawer }) {

  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef) {
      return;
    }

    const canvas = canvasRef.current;

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    resize();

    const ctx = canvas.getContext("2d");

    let dragging = false;

    const mouse = { x: -1, y: -1 };

    window.addEventListener("mousedown", () => dragging = true);
    window.addEventListener("mouseup", () => {
      dragging = false;
      prevMouse = null
    });
    window.addEventListener("mousemove", (evt) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = evt.clientX - rect.left;
      mouse.y = evt.clientY - rect.top;
    });
    window.addEventListener("resize", resize);

    let prevMouse = null;

    let animationId;

    function drawLine(p1, p2) {
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.closePath();
      ctx.stroke();
    }

    function sendDrawPoints() {
      socket.emit("draw-points", {
        p1: prevMouse,
        p2: mouse
      });
    }

    function draw() {
      if (dragging && prevMouse) {
        drawLine(mouse, prevMouse);
        sendDrawPoints();
      }

      prevMouse = { ...mouse };
    }

    socket.on("draw-points", ({ p1, p2 }) => {
      drawLine(p1, p2);
    });

    function animate() {
      animationId = requestAnimationFrame(animate);

      if (isDrawer) {
        draw();
      }
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    }

  }, [canvasRef])

  return <CanvasC ref={canvasRef} />
}
