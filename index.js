import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { MongoClient } from "mongodb";
import userRouter from "./routes/user.routes.js";
import emailRouter from "./routes/email.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Database connection
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("MongoDB is connected!");

// For cors
app.use(cors());
app.use(morgan("dev"));

// Body parser
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to your page! 😃");
});

app.use("/users", userRouter);
app.use("/emails", emailRouter);

app.listen(PORT, () =>
  console.log(`The server is connected to port: ${PORT} ✨✨`)
);

export { client };
