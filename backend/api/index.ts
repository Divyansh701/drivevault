import { createApp } from "../src/app";
import { mongoDBClient } from "../src/infrastructure/database/mongodb.client";

let app: ReturnType<typeof createApp> | null = null;

export default async function handler(req: any, res: any) {
  if (!app) {
    await mongoDBClient.connect();
    app = createApp();
  }

  return app(req, res);
}