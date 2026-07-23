import request from "supertest";
import app from "../app";
import { prisma } from "../prisma";

// runs once before all tests in this file: clean slate
beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: "test@example.com" } });
});

// runs once after all tests finish: clean up what we created
afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: "test@example.com" } });
  await prisma.$disconnect();
});

describe("Auth routes", () => {
  it("should sign up a new user", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(res.status).toBe(200);
    expect(res.body.userId).toBeDefined();
  });

  it("should reject signup with a duplicate email", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(res.status).toBe(400);
  });

  it("should log in with correct credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should reject login with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });
});