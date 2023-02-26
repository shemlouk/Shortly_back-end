// src/app.ts
import express from "express";
import dotenv2 from "dotenv";
import cors from "cors";

// src/routes/Ranking.ts
import { Router } from "express";
var router = Router();
router.get("/ranking");
var Ranking_default = router;

// src/schemas/index.ts
import { z } from "zod";
var Schemas = class {
  signup() {
    return z.object({
      name: z.string().min(2).max(50),
      email: z.string().email(),
      password: z.string().min(6).max(16),
      confirmPassword: z.string()
    }).refine(({ password, confirmPassword }) => password === confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    });
  }
};
var schemas_default = new Schemas();

// src/middlewares/validateBody.ts
var validateBody = (req, res, next) => {
  const route = req.path.split("/")[1];
  const schema = schemas_default[route];
  try {
    const parse = schema().safeParse(req.body);
    if (!parse.success)
      return res.status(422).send(parse.error.issues);
    next();
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};
var validateBody_default = validateBody;

// src/config/database.ts
import dotenv from "dotenv";
import pg from "pg";
dotenv.config();
var configDatabase = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.MODE === "prod"
};
var database_default = new pg.Pool(configDatabase);

// src/controllers/UsersController.ts
import bcrypt from "bcrypt";
var SALT_ROUNDS = 10;
var UserController = class {
  async create(req, res) {
    try {
      const { name, email, password } = req.body;
      const { rowCount } = await database_default.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (rowCount)
        return res.sendStatus(409);
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await database_default.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        [name, email, hashedPassword]
      );
      res.sendStatus(201);
    } catch ({ message }) {
      console.log(message);
      res.status(500).json(message);
    }
  }
};
var UsersController_default = new UserController();

// src/routes/SignUp.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.post("/signup", validateBody_default, UsersController_default.create);
var SignUp_default = router2;

// src/routes/SignIn.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.post("/signin");
var SignIn_default = router3;

// src/routes/Users.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.get("/users/me");
var Users_default = router4;

// src/routes/Urls.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/urls/open/:shortUrl");
router5.post("/urls/shorten");
router5.delete("/urls/:id");
router5.get("/urls/:id");
var Urls_default = router5;

// src/app.ts
dotenv2.config();
var app = express();
app.use(express.json());
app.use(cors());
app.use(Ranking_default);
app.use(SignUp_default);
app.use(SignIn_default);
app.use(Users_default);
app.use(Urls_default);
app.listen(process.env.PORT, () => {
  console.log("Server is running");
});
