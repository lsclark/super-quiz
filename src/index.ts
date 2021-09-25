import express from "express";
import { Server } from "http";
import { Subject } from "rxjs";
import WebSocket from "ws";

import { Administrator } from "./admin";
import { AdminMessage, AdminUS } from "./models/admin-message-types";
import { QuizMessage } from "./models/game-message-types";
import QuizHost from "./quiz-host";

const port = process.env.PORT || 8080;

class TriviaServer {
  private app: express.Express;
  private httpServer?: Server;

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
      this.fromAdmin$,
      this.fromQuizHost$
    );

    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.static(__dirname + "/frontend"));
    this.app.use("*", (req, res) => {
      res.sendFile(__dirname + "/frontend/index.html");
    });

    this.wsServer.on("connection", (socket: WebSocket) => {
      this.clients.add(socket);
      let name: string | undefined = undefined;

      socket.on("message", (data: string) => {
        const message: QuizMessage | AdminMessage = JSON.parse(data);

        if ("admin" in message) {
          if (!this.administrator.authorise((message as AdminUS).auth)) return;
          if (!this.admins.has(socket)) {
            this.admins.add(socket);
            this.administrator.stateUpdate();
          }
          console.log("ADMIN RCV:", message);

          if (message.type == "adminTerminate")
            process.kill(process.pid, "SIGINT");

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
        if (name) delete this.players[name];
      });
    });

    this.fromQuizHost$.subscribe((message) => {
      console.log("Sending", message.type, "to", message.name);
      this.messageSender(message);
    });

    this.fromAdmin$.subscribe((message) => this.adminSender(message));
  }

  start() {
    this.httpServer = this.app.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
    });
    this.httpServer.on("upgrade", (request, socket, head) => {
      this.wsServer.handleUpgrade(request, socket, head, (socket) => {
        this.wsServer.emit("connection", socket, request);
      });
    });
    return new Promise<void>((resolve) => {
      this.httpServer?.on("close", () => {
        console.log("Quiz server terminated");
        resolve();
      });
    });
  }

  stop() {
    console.log("Server Stopping");
    this.httpServer?.close();
    this.wsServer.close();
  }

  private messageSender(message: QuizMessage) {
    const serialised = JSON.stringify(message);
    if (message.name == "_broadcast") {
      for (const socket of Object.values(this.players)) {
        if (socket.readyState == WebSocket.OPEN) socket.send(serialised);
      }
    } else {
      const socket = this.players[message.name];
      if (!!socket && socket.readyState == WebSocket.OPEN) {
        socket.send(serialised);
      }
    }
  }

  private adminSender(message: AdminMessage) {
    if (!this.admins.size) return;
    const serialised = JSON.stringify(message);
    for (const socket of this.admins) {
      if (!!socket && socket.readyState == WebSocket.OPEN) {
        socket.send(serialised);
      }
    }
  }
}

const server = new TriviaServer();
server.start();

process.on("SIGTERM", () => {
  console.log("SIGTERM Received: Terminating");
  server.stop();
});
