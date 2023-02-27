import db from "../config/database";

class UserRepository {
  async create(name: string, email: string, password: string) {
    try {
      await db.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
        [name, email, password]
      );
    } catch ({ message }) {
      console.error(message);
    }
  }
  async getOne(id: number) {
    try {
      const { rows } = await db.query(
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
      return (
        await db.query(
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
        )
      ).rows;
    } catch ({ message }) {
      console.error(message);
    }
  }
}

export default new UserRepository();
