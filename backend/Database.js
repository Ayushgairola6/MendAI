import pkg from "pg";
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();
// Replace with your PostgreSQL URI
export const pool = new Pool({
  connectionString: process.env.PG_URI,
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
