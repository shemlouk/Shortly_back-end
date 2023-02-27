import db from "../config/database";

class SessionRepository {
  async create(id: number, token: string) {
    try {
      await db.query('INSERT INTO sessions ("userId", token) VALUES ($1, $2)', [
        id,
        token,
      ]);
    } catch ({ message }) {
      console.error(message);
    }
  }
}

export default new SessionRepository();
