import { Pool } from "pg";
export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({ host: process.env.PGHOST || "localhost", port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || "voyagetrack", user: process.env.PGUSER || "voyage",
      password: process.env.PGPASSWORD || "voyage_dev_password" });
