import { nanoid } from "nanoid";
import { Pool } from "pg";

class GlosariumRepository {
  constructor() {
    this._pool = new Pool();
  }

  async create({ termName, description, category }) {
    const id = `glosarium-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO glosarium (id, "termName", description, category, "createdAt", "updatedAt") VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, termName, description, category, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async findAll() {
    const query = {
      text: 'SELECT id, "termName", description, category, "createdAt", "updatedAt" FROM glosarium',
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = {
      text: 'SELECT id, "termName", description, category, "createdAt", "updatedAt" FROM glosarium WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async update({ id, termName, description, category }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE glosarium SET "termName" = $1, description = $2, category = $3, "updatedAt" = $4 WHERE id = $5 RETURNING id',
      values: [termName, description, category, updatedAt, id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async delete(id) {
    const query = {
      text: "DELETE FROM glosarium WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0]?.id;
  }
}

export default new GlosariumRepository();
