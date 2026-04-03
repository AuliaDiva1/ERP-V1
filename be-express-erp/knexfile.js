import { config } from "dotenv";

config();

const knexConfig = {
  development: {
    client: process.env.DB_CLIENT || "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 4000, // Tambahkan port
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "erp",
      // TAMBAHKAN INI UNTUK TIDB CLOUD
      ssl: {
        rejectUnauthorized: true,
      },
    },
    migrations: {
      directory: "./src/migrations",
      extension: "js",
      loadExtensions: [".js"],
    },
  },
  production: {
    client: process.env.DB_CLIENT || "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 4000,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: true,
      },
    },
    migrations: {
      directory: "./src/migrations",
      extension: "js",
    },
  },
};

export default knexConfig;