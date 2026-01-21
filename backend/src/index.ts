import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { logger } from "hono/logger";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });
const app = new Hono();

// Middleware
if (process.env.NODE_ENV === "development") {
  app.use("*", logger());
}

app.use(
  "/*",
  cors({
    origin:
      process.env.NODE_ENV === "production" ? ["https://yourdomain.com"] : "*",
    credentials: true,
  }),
);

// Health check
app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (c) => c.text("Hello from Hono!"));

app.get("/api/users", async (c) => {
  try {
    const users = await prisma.user.findMany();
    return c.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ success: false, error: "Failed to fetch users" }, 500);
  }
});

app.post("/api/users", async (c) => {
  try {
    const body = await c.req.json();
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
      },
    });
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ success: false, error: "Failed to create user" }, 500);
  }
});

app.put("/api/users/:id", async (c) => {
  try {
    const body = await c.req.json();
    const param = c.req.param();
    const user = await prisma.user.update({
      where: { id: Number(param.id) },
      data: {
        name: body?.name,
        email: body.email,
      },
    });

    console.log(user);
    console.log("asd123123asdqw1d");
    return c.json({ success: true, data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    return c.json({ success: false, error: "Failed to create user" }, 500);
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const server = Bun.serve({
  port: 3000,
  hostname: "0.0.0.0",
  fetch: app.fetch,
});

console.log(`🚀 Server running at http://${server.hostname}:${server.port}`);
