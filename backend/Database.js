import pkg from "pg";
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();
//  creating a pg pool to handle async requests
export const pool = new Pool({
  connectionString: process.env.PG_URI,
  ssl: { rejectUnauthorized: false ,require: true},
  max: 20, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 7000, 
});
// Test the connection
pool
  .connect()
  .then((client) => {
    console.log("Connected to PostgreSQL");
    client.release(); // Release the client back to the pool
  })
  .catch((err) => console.error("Connection error", err));

// Example query execution
pool
  .query("SELECT NOW()")
  .then((res) => console.log("Current Time:", res.rows[0]))
  .catch((err) => console.error("Query error", err));
