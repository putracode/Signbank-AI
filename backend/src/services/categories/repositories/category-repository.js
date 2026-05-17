import { nanoid } from "nanoid";
import pool from "../../../config/database.js";

class CategoryRepository {
  constructor() {
    this._pool = pool;
  }

  async create({ name }) {
    const id = `cat-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO categories (id, name, "createdAt", "updatedAt") VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, name, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async findAll() {
    const query = {
      text: 'SELECT id, name, "createdAt", "updatedAt" FROM categories ORDER BY name ASC',
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = {
      text: 'SELECT id, name, "createdAt", "updatedAt" FROM categories WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async update({ id, name }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE categories SET name = $1, "updatedAt" = $2 WHERE id = $3 RETURNING id',
      values: [name, updatedAt, id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async delete(id) {
    const query = {
      text: "DELETE FROM categories WHERE id = $1 RETURNING id",
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0]?.id;
  }
}

export default new CategoryRepository();
