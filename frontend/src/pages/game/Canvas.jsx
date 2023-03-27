import styled from "@emotion/styled"
import { useEffect, useRef } from "react";
import socket from "@/socket";

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

    function startDrag() {
      dragging = true;
    }

    function endDrag() {
      dragging = false;
      prevMouse = null;
    }

    function moveBrush(evt) {

      evt.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const touches = evt.changedTouches;
      if (touches && touches.length) {
        mouse.x = touches[0].clientX - rect.left;
        mouse.y = touches[0].clientY - rect.top;
      } else {
        mouse.x = evt.clientX - rect.left;
        mouse.y = evt.clientY - rect.top;
      }
    }

    window.addEventListener("mousedown", startDrag);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("mousemove", moveBrush);

    window.addEventListener("touchstart", startDrag);
    window.addEventListener("touchend", endDrag);
    window.addEventListener("touchmove", moveBrush);

    window.addEventListener("resize", resize);

    let prevMouse = null;

    let animationId;

    const points = [];

    function drawLine(p1, p2) {
    }

    function sendDrawPoints() {
      socket.emit("draw-points", {
        p1: prevMouse,
        p2: mouse
      });
    }

    function draw() {
      if (dragging && prevMouse) {
        // spread objects to clone
        points.push({ ...prevMouse }, { ...mouse });
        sendDrawPoints();
      }

      prevMouse = { ...mouse };
    }

    socket.on("draw-points", ({ p1, p2 }) => {
      points.push(p1, p2);
    });

    function animate() {
      animationId = requestAnimationFrame(animate);

      ctx.strokeStyle = "white";

      if (isDrawer) {
        draw();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < points.length; i += 2) {
        const [p1, p2] = points.slice(i, i + 2);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.stroke();
      }
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    }

  }, [canvasRef])

  return <CanvasC ref={canvasRef} />
}
