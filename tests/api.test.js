import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/prisma.js";

describe("api", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("login responds with token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@hrm.dev", password: "admin123" });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  test("chat history without token is rejected", async () => {
    const res = await request(app).get("/api/chat/conversations/my");
    expect(res.status).toBe(401);
  });
});
