import pool from "../../../config/database.js";

class AuthenticationRepository {
  constructor() {
    this._pool = pool;
  }

  async createToken(token) {
    const query = {
      text: "INSERT INTO authentications (token) VALUES($1)",
      values: [token],
    };

    await this._pool.query(query);
  }

  async verifyToken(token) {
    const query = {
      text: "SELECT token FROM authentications WHERE token = $1",
      values: [token],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return false;
    }

    return result.rows[0];
  }

  async deleteToken(token) {
    const query = {
      text: "DELETE FROM authentications WHERE token = $1",
      values: [token],
    };

    await this._pool.query(query);
  }
}

export default new AuthenticationRepository();
