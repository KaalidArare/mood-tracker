const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
  try {
    // Load SQL file
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();

    // Connect to MySQL (connect to server, not a specific DB yet)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true    // IMPORTANT ⚠️ allows running >1 SQL command
    });

    console.log("Running schema.sql...");
    await connection.query(sql);
    console.log("Database + table created successfully!");

    await connection.end();
  } catch (err) {
    console.error("Error initializing database:", err);
  }
}

init();
