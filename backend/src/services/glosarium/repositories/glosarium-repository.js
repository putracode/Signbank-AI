import { nanoid } from "nanoid";
import pool from "../../../config/database.js";

class GlosariumRepository {
  constructor() {
    this._pool = pool;
  }

  async create({ termName, description, categoryId, thumbnailUrl, videoUrl }) {
    const id = `glosarium-${nanoid(16)}`;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO glosarium (id, "termName", description, "categoryId", "thumbnailUrl", "videoUrl", "createdAt", "updatedAt") VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, termName, description, categoryId, thumbnailUrl, videoUrl, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async findAll() {
    const query = {
      text: `SELECT g.id, g."termName", g.description, g."categoryId", c.name as "categoryName", g."thumbnailUrl", g."videoUrl", g."createdAt", g."updatedAt" 
             FROM glosarium g
             LEFT JOIN categories c ON g."categoryId" = c.id`,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async findById(id) {
    const query = {
      text: `SELECT g.id, g."termName", g.description, g."categoryId", c.name as "categoryName", g."thumbnailUrl", g."videoUrl", g."createdAt", g."updatedAt" 
             FROM glosarium g
             LEFT JOIN categories c ON g."categoryId" = c.id
             WHERE g.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async update({ id, termName, description, categoryId, thumbnailUrl, videoUrl }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE glosarium SET "termName" = $1, description = $2, "categoryId" = $3, "thumbnailUrl" = $4, "videoUrl" = $5, "updatedAt" = $6 WHERE id = $7 RETURNING id',
      values: [termName, description, categoryId, thumbnailUrl, videoUrl, updatedAt, id],
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
