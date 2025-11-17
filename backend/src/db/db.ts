import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (database) return database;
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in environment");
  }
  const dbName = process.env.MONGO_DB_NAME || "rdf";

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);

  // eslint-disable-next-line no-console
  console.log(`[db] Connected to MongoDB database="${dbName}"`);

  return database;
}

export function getDb(): Db {
  if (!database) {
    throw new Error("Database not connected. Call connectToDatabase() first.");
  }
  return database;
}

export async function disconnectDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
    // eslint-disable-next-line no-console
    console.log("[db] Disconnected from MongoDB");
  }
}

export default { connectToDatabase, getDb, disconnectDatabase };