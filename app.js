import express from "express";
import cluster from "node:cluster";
import { createRequire } from "module";
import mongoose from "mongoose";
import user from "./routes/user.js";
const require = createRequire(import.meta.url);

const totalCPUs = require("node:os").cpus().length;
const process = require("node:process");
require("dotenv").config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const PORT = 3050;

mongoose
  .connect(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {})
  .catch((err) => console.log(err));

if (cluster.isPrimary) {
  // Fork workers.
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  startExpress();
}
function startExpress() {
  app.use("/api/v1/users", user);

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.listen(PORT, () => {
    console.log(`The server has started on port ${PORT}!`);
  });

  //Throwing 404 page on non-matching routes
  app.use((req, res, next) => {
    res.status(404).send("<h1>404 Not Found</h1>");

    next();
  });
}
