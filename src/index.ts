import express from "express";
import WebSocket from "ws";
import QuizHost from "./quiz-host";
import { Subject } from "rxjs";
import { QuizMessage } from "./messaging";

const port = process.env.TRIVIA_PORT || 8080;

class TriviaServer {
  app: express.Express;
  clients: Set<WebSocket>;
  players: { [key: string]: WebSocket };
  wsServer: WebSocket.Server;
  quizHost: QuizHost;

  fromQuizHost$: Subject<QuizMessage>;
  toQuizHost$: Subject<QuizMessage>;

  constructor() {
    this.app = express();
    this.wsServer = new WebSocket.Server({ noServer: true });
    this.fromQuizHost$ = new Subject<QuizMessage>();
    this.toQuizHost$ = new Subject<QuizMessage>();

    this.clients = new Set<WebSocket>();
    this.players = {};

    this.quizHost = new QuizHost(this.toQuizHost$, this.fromQuizHost$);

    this.setupRoutes();
  }

  setupRoutes() {
    this.wsServer.on("connection", (socket: WebSocket) => {
      this.clients.add(socket);

      socket.on("message", (data: string) => {
        let message: QuizMessage = JSON.parse(data);
        if (this.players[message.name] != socket)
          this.players[message.name] = socket;
        this.toQuizHost$.next(message);
      });

      socket.on("close", (code: number, reason: string) => {
        console.log("Client disconnected");
        this.clients.delete(socket);
      });
    });

    this.fromQuizHost$.subscribe((message) => {
      this.messageSender(message);
    });
  }

  start() {
    const server = this.app.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
    });
    server.on("upgrade", (request, socket, head) => {
      this.wsServer.handleUpgrade(request, socket, head, (socket) => {
        this.wsServer.emit("connection", socket, request);
      });
    });
  }

  messageSender(message: QuizMessage) {
    let serialised = JSON.stringify(message);
    if (message.name == "_broadcast") {
      for (let socket of Object.values(this.players)) {
        if (socket.readyState == WebSocket.OPEN) socket.send(serialised);
      }
    } else {
      let socket = this.players[message.name];
      if (!!socket && socket.readyState == WebSocket.OPEN) {
        socket.send(serialised);
      }
    }
  }
}

let server = new TriviaServer();
server.start();
