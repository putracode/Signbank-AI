import { createClient } from "redis";

class CacheService {
  constructor() {
    if (!process.env.REDIS_HOST) {
      console.log("REDIS_HOST tidak terdefinisi. Caching dinonaktifkan.");
      this._client = null;
      return;
    }

    try {
      this._client = createClient({
        socket: {
          host: process.env.REDIS_HOST,
        },
      });

      this._client.on("error", (error) => {
        console.error("Redis client error:", error.message);
      });

      this._client.connect().catch((err) => {
        console.error("Koneksi Redis gagal, caching dinonaktifkan:", err.message);
        this._client = null;
      });
    } catch (err) {
      console.error("Inisialisasi Redis gagal:", err.message);
      this._client = null;
    }
  }

  async set(key, value, expirationInSecond = 3600) {
    if (!this._client) return;
    try {
      await this._client.set(key, value, {
        EX: expirationInSecond,
      });
    } catch (err) {
      console.error("Redis set error:", err.message);
    }
  }

  async get(key) {
    if (!this._client) throw new Error("Cache tidak ditemukan");
    try {
      const result = await this._client.get(key);
      if (result === null) throw new Error("Cache tidak ditemukan");
      return result;
    } catch (err) {
      throw new Error("Cache tidak ditemukan");
    }
  }

  async delete(key) {
    if (!this._client) return;
    try {
      await this._client.del(key);
    } catch (err) {
      console.error("Redis delete error:", err.message);
    }
  }
}

export default CacheService;
