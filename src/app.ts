import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Ranking from "./routes/Ranking";
import SignUp from "./routes/SignUp";
import SignIn from "./routes/SignIn";
import Users from "./routes/Users";
import Urls from "./routes/Urls";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(Ranking);
app.use(SignUp);
app.use(SignIn);
app.use(Users);
app.use(Urls);

app.listen(process.env.PORT, () => {
  console.log("Server is running");
});
