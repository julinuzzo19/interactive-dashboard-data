import express, { Application } from "express";
import fs from "fs";
import https from "https";
import morgan from "morgan";
import cors from "cors";
import UsersRoutes from "../apis/users/users.routes";

const corsOptions = {
  methods: ["OPTIONS", "GET", "POST", "PUT", "DELETE"],
};

export class App {
  private app: Application;

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
  }

  settings() {
    this.app.use(cors(corsOptions));
    this.app.set("port", this.port || 3500);
  }

  middlewares() {
    this.app.use(morgan("dev"));
    this.app.use(express.urlencoded({ limit: "10mb", extended: false }));
    this.app.use(express.text(), express.json({ limit: "10mb" }));
  }

  routes() {
    this.app.use("/users", UsersRoutes);
  }

  async listen() {
    try {
      if (process.env.MODE == "production") {
        const server = https.createServer(
          {
            key: fs.readFileSync(`${process.env.SSL_NAME_PROJECT}.key`),
            cert: fs.readFileSync(`${process.env.SSL_NAME_PROJECT}.crt`),
            ca: fs.readFileSync("SectigoRSADomainValidationSecureServerCA.crt"),
          },
          this.app,
        );
        server.listen(this.app.get("port"));
      } else {
        this.app.listen(this.app.get("port"));
      }
      console.log(`server en puerto ${this.app.get("port")}`);
    } catch (error) {
      console.log(error);
    }
  }
}
