import express from "express";
import WebSocket from "ws";
import QuizHost from "./quiz-host";
import { Subject } from "rxjs";
import { QuizMessage } from "./message-types";
import { AdminMessage, AdminUS } from "./admin-message-types";
import { Administrator } from "./admin";

const port = process.env.TRIVIA_PORT || 8080;

class TriviaServer {
  app: express.Express;
  clients = new Set<WebSocket>();
  players: { [key: string]: WebSocket } = {};
  admins = new Set<WebSocket>();
  wsServer: WebSocket.Server;

  administrator: Administrator;
  quizHost: QuizHost;

  fromQuizHost$: Subject<QuizMessage>;
  toQuizHost$: Subject<QuizMessage>;

  fromAdmin$: Subject<AdminMessage>;
  toAdmin$: Subject<AdminMessage>;

  constructor() {
    this.app = express();
    this.wsServer = new WebSocket.Server({ noServer: true });

    this.fromQuizHost$ = new Subject<QuizMessage>();
    this.toQuizHost$ = new Subject<QuizMessage>();

    this.fromAdmin$ = new Subject<AdminMessage>();
    this.toAdmin$ = new Subject<AdminMessage>();

    this.quizHost = new QuizHost(this.toQuizHost$, this.fromQuizHost$);
    this.administrator = new Administrator(
      this.quizHost,
      this.toAdmin$,
      this.fromAdmin$
    );

    this.setupRoutes();
  }

  setupRoutes() {
    this.app.get("/", (req, res) => {
      res.send("Hello world");
    });

    this.wsServer.on("connection", (socket: WebSocket) => {
      this.clients.add(socket);
      let name: string | undefined = undefined;

      socket.on("message", (data: string) => {
        let message: QuizMessage | AdminMessage = JSON.parse(data);

        if ("admin" in message) {
          if (!this.administrator.authorise((message as AdminUS).auth)) return;
          if (!this.admins.has(socket)) {
            this.admins.add(socket);
            this.administrator.stateUpdate();
          }
          console.log("ADMIN RCV:", message);

          this.toAdmin$.next(message);
        } else {
          name = message.name;
          if (this.players[message.name] != socket)
            this.players[message.name] = socket;
          this.toQuizHost$.next(message);
        }
      });

      socket.on("close", () => {
        console.log(`Client disconnected (${name})`);
        this.clients.delete(socket);
        this.admins.delete(socket);
        if (!!name) delete this.players[name];
      });
    });

    this.fromQuizHost$.subscribe((message) => {
      console.log("Sending", message.type, "to", message.name);
      this.messageSender(message);
    });

    this.fromAdmin$.subscribe((message) => this.adminSender(message));
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

  adminSender(message: AdminMessage) {
    console.log("ADMIN SEND:", message);
    let serialised = JSON.stringify(message);
    for (const socket of this.admins) {
      if (!!socket && socket.readyState == WebSocket.OPEN) {
        socket.send(serialised);
      }
    }
  }
}

let server = new TriviaServer();
server.start();
