import db from "../config/database";

class UrlRepository {
  async create(url: number, shortUrl: string, id: number) {
    try {
      await db.query(
        'INSERT INTO urls (url, "shortUrl", "userId") VALUES ($1, $2, $3)',
        [url, shortUrl, id]
      );
    } catch ({ message }) {
      console.error(message);
    }
  }
  async getOne(shortUrl: string) {
    try {
      return (
        await db.query('SELECT * FROM urls WHERE "shortUrl" = $1', [shortUrl])
      ).rows[0];
    } catch ({ message }) {
      console.error(message);
    }
  }
  async updateVisitCount(id: number) {
    try {
      await db.query(
        'UPDATE urls SET "visitCount" = "visitCount" + 1 WHERE id = $1',
        [id]
      );
    } catch ({ message }) {
      console.error(message);
    }
  }
  async delete(id: number, userId: number) {
    try {
      const { rowCount } = await db.query(
        'DELETE FROM urls WHERE id = $1 AND "userId" = $2',
        [id, userId]
      );
      return rowCount;
    } catch ({ message }) {
      console.error(message);
    }
  }
}

export default new UrlRepository();
