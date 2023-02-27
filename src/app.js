// src/app.ts
import express from "express";
import dotenv2 from "dotenv";
import cors from "cors";

// src/config/database.ts
import dotenv from "dotenv";
import pg from "pg";
dotenv.config();
var configDatabase = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.MODE === "prod"
};
var database_default = new pg.Pool(configDatabase);

// src/repositories/UserRepository.ts
var UserRepository = class {
  async create(name, email, password) {
    try {
      await database_default.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        [name, email, password]
      );
    } catch ({ message }) {
      console.error(message);
    }
  }
  async getOne(id) {
    try {
      const { rows } = await database_default.query(
        `SELECT
            users.id,
            users.name,
            COALESCE(sum("visitCount"), 0) AS "visitCount",
            CASE
              WHEN bool_or(urls.id IS NOT NULL)
                THEN  json_agg(
                        json_build_object(
                          'id', urls.id,
                          'shortUrl', urls."shortUrl",
                          'url', urls.url,
                          'visitCount', urls."visitCount"
                        )
                      )
                ELSE array_to_json(array[]::json[])
            END AS "shortenedUrls"
        FROM users
        LEFT JOIN urls
        ON urls."userId" = users.id
        WHERE users.id = $1
        GROUP BY users.id, users.name`,
        [id]
      );
      return rows[0];
    } catch ({ message }) {
      console.error(message);
    }
  }
  async getMany() {
    try {
      return (await database_default.query(
        `SELECT
            users.id,
            users.name,
            count(urls.id) AS "linksCount",
            COALESCE(sum(urls."visitCount"), 0) AS "visitCount"
          FROM users
          LEFT JOIN urls
            ON urls."userId" = users.id
          GROUP BY users.id
          ORDER BY "visitCount" DESC
          LIMIT 10`
      )).rows;
    } catch ({ message }) {
      console.error(message);
    }
  }
  async findOne(email) {
    try {
      return await database_default.query("SELECT * FROM users WHERE email = $1", [email]);
    } catch ({ message }) {
      console.error(message);
    }
  }
};
var UserRepository_default = new UserRepository();

// src/controllers/UsersController.ts
import bcrypt from "bcrypt";
var SALT_ROUNDS = 10;
var UserController = class {
  async create(req, res) {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await UserRepository_default.create(name, email, hashedPassword);
      res.sendStatus(201);
    } catch ({ message }) {
      console.error(message);
      res.status(500).json(message);
    }
  }
  async getById(req, res) {
    const { userId } = res.locals.session;
    try {
      const result = await UserRepository_default.getOne(userId);
      res.send(result);
    } catch ({ message }) {
      console.error(message);
      res.status(500).json(message);
    }
  }
  async getRanking(req, res) {
    try {
      const result = await UserRepository_default.getMany();
      res.send(result);
    } catch ({ message }) {
      console.error(message);
      res.status(500).json(message);
    }
  }
};
var UsersController_default = new UserController();

// src/routes/Ranking.ts
import { Router } from "express";
var router = Router();
router.get("/ranking", UsersController_default.getRanking);
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
  signin() {
    return z.object({
      email: z.string().email(),
      password: z.string().min(1)
    });
  }
  urls() {
    return z.object({
      url: z.string().url()
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

// src/middlewares/findUser.ts
var findUser = async (req, res, next) => {
  const route = req.path.split("/")[1];
  const { email } = req.body;
  try {
    const { rows, rowCount } = await UserRepository_default.findOne(email) ?? {};
    if (route === "signup") {
      if (rowCount)
        return res.sendStatus(409);
      next();
    } else {
      if (!rowCount)
        return res.sendStatus(401);
      res.locals = { user: rows?.[0] };
      next();
    }
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};
var findUser_default = findUser;

// src/routes/SignUp.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.post("/signup", validateBody_default, findUser_default, UsersController_default.create);
var SignUp_default = router2;

// src/repositories/SessionRepository.ts
var SessionRepository = class {
  async create(id, token) {
    try {
      await database_default.query('INSERT INTO sessions ("userId", token) VALUES ($1, $2)', [
        id,
        token
      ]);
    } catch ({ message }) {
      console.error(message);
    }
  }
  async getOne(token) {
    try {
      return await database_default.query("SELECT * FROM sessions WHERE token = $1", [token]);
    } catch ({ message }) {
      console.error(message);
    }
  }
};
var SessionRepository_default = new SessionRepository();

// src/controllers/SessionsController.ts
import { nanoid } from "nanoid";
import bcrypt2 from "bcrypt";
var SessionsController = class {
  async create(req, res) {
    const { password } = req.body;
    const { id: userId, password: userPassword } = res.locals.user;
    try {
      if (!bcrypt2.compareSync(password, userPassword))
        return res.sendStatus(401);
      const token = nanoid();
      await SessionRepository_default.create(userId, token);
      res.send({ token });
    } catch ({ message }) {
      console.log(message);
      res.status(500).json(message);
    }
  }
};
var SessionsController_default = new SessionsController();

// src/routes/SignIn.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.post("/signin", validateBody_default, findUser_default, SessionsController_default.create);
var SignIn_default = router3;

// src/middlewares/authentication.ts
var authentication = async (req, res, next) => {
  const token = req.header("authorization")?.replace(/(Bearer )/g, "");
  try {
    const result = await SessionRepository_default.getOne(token);
    if (!result?.rowCount)
      return res.sendStatus(401);
    res.locals.session = result.rows[0];
    next();
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};
var authentication_default = authentication;

// src/routes/Users.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.get("/users/me", authentication_default, UsersController_default.getById);
var Users_default = router4;

// src/controllers/UrlsController.ts
import { customAlphabet, urlAlphabet } from "nanoid";

// src/repositories/UrlRepository.ts
var UrlRepository = class {
  async create(url, shortUrl, id) {
    try {
      await database_default.query(
        'INSERT INTO urls (url, "shortUrl", "userId") VALUES ($1, $2, $3)',
        [url, shortUrl, id]
      );
    } catch ({ message }) {
      console.error(message);
    }
  }
  async getOne(shortUrl) {
    try {
      return (await database_default.query('SELECT * FROM urls WHERE "shortUrl" = $1', [shortUrl])).rows[0];
    } catch ({ message }) {
      console.error(message);
    }
  }
  async updateVisitCount(id) {
    try {
      await database_default.query(
        'UPDATE urls SET "visitCount" = "visitCount" + 1 WHERE id = $1',
        [id]
      );
    } catch ({ message }) {
      console.error(message);
    }
  }
  async delete(id, userId) {
    try {
      const { rowCount } = await database_default.query(
        'DELETE FROM urls WHERE id = $1 AND "userId" = $2',
        [id, userId]
      );
      return rowCount;
    } catch ({ message }) {
      console.error(message);
    }
  }
  async findOne(id, shortUrl) {
    try {
      return await database_default.query(
        'SELECT * FROM urls WHERE id = $1 OR "shortUrl" = $2',
        [id, shortUrl]
      );
    } catch ({ message }) {
      console.error(message);
    }
  }
};
var UrlRepository_default = new UrlRepository();

// src/controllers/UrlsController.ts
var nanoid2 = customAlphabet(urlAlphabet, 8);
var UrlsController = class {
  async create(req, res) {
    const { userId } = res.locals.session;
    const { url } = req.body;
    const shortUrl = nanoid2();
    try {
      await UrlRepository_default.create(url, shortUrl, userId);
      const { id } = await UrlRepository_default.getOne(shortUrl);
      res.status(201).send({ id, shortUrl });
    } catch ({ message }) {
      console.error(message);
      res.status(500).json(message);
    }
  }
  async getById(req, res) {
    const { id, url, shortUrl } = res.locals.url;
    res.send({ id, url, shortUrl });
  }
  async openUrl(req, res) {
    const { id, url } = res.locals.url;
    await UrlRepository_default.updateVisitCount(id);
    res.redirect(url);
  }
  async delete(req, res) {
    const {
      url: { id },
      session: { userId }
    } = res.locals;
    const rowCount = await UrlRepository_default.delete(id, userId);
    if (!rowCount)
      return res.sendStatus(401);
    res.sendStatus(204);
  }
};
var UrlsController_default = new UrlsController();

// src/middlewares/findUrl.ts
var findUrl = async (req, res, next) => {
  const { id, shortUrl } = req.params;
  try {
    const { rows, rowCount } = await UrlRepository_default.findOne(Number(id), shortUrl) ?? {};
    if (!rowCount)
      return res.sendStatus(404);
    res.locals.url = rows?.[0];
    next();
  } catch ({ message }) {
    console.log(message);
    res.status(500).json(message);
  }
};
var findUrl_default = findUrl;

// src/routes/Urls.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/urls/open/:shortUrl", findUrl_default, UrlsController_default.openUrl);
router5.post("/urls/shorten", authentication_default, validateBody_default, UrlsController_default.create);
router5.delete("/urls/:id", authentication_default, findUrl_default, UrlsController_default.delete);
router5.get("/urls/:id", findUrl_default, UrlsController_default.getById);
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
