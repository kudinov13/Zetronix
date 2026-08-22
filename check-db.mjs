import Database from "better-sqlite3";
const db = new Database("data/studio.db");
console.log("Templates:", JSON.stringify(db.prepare("SELECT * FROM templates").all(), null, 2));
console.log("Categories:", JSON.stringify(db.prepare("SELECT * FROM categories").all(), null, 2));
