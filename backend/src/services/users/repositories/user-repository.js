import pool from "../../../config/database.js";
import bcrypt from "bcrypt";
import AuthenticationError from "../../../exceptions/authentication-error.js";

class UserRepository {
  constructor() {
    this._pool = pool;
  }

  async verifyCredentials(email, password) {
    const query = {
      text: "SELECT id, password FROM users WHERE email = $1",
      values: [email],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError("Kredensial yang anda berikan salah");
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError("Kredensial yang anda berikan salah");
    }

    return id;
  }

  async findById(id) {
    const query = {
      text: "SELECT id, email, fullname FROM users WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return null;
    }

    return result.rows[0];
  }
}

export default new UserRepository();
