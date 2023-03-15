import express from "express";
import http from "http";
import cors from "cors";
import controller from "./controller.js";

const app = express();
app.use(cors());

const server = http.createServer(app);

const port = 3000;

const io = controller(server);

server.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

