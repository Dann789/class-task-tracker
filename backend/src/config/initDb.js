const fs = require("fs");
const path = require("path");
const pool = require("./database");

async function initDatabase() {
  const schemaPath = path.join(__dirname, "../../schema.sql");
  console.log("Reading schema from:", schemaPath);

  try {
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    console.log("Executing schema SQL...");
    await pool.query(schemaSql);
    console.log("Database initialized successfully with schema and seed data!");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();

