import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI not configured");

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectDB() {
  if (!db) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(process.env.DB_NAME || "manolos_gestion");
    console.log("Connected to MongoDB", db.databaseName);
  }
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database not connected. Call connectDB first.");
  return db;
}

export async function closeDB() {
  await client.close();
  db = null;
}
