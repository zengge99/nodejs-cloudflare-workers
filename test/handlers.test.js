import { describe, it, expect, beforeEach } from "vitest";
import worker from "../src/index.js";

describe("API Handlers", () => {
  const env = { ENVIRONMENT: "test" };
  let ctx;

  beforeEach(() => {
    ctx = {
      waitUntil: () => {},
    };
  });

  describe("Health Check Handler", () => {
    it("should return healthy status", async () => {
      const req = new Request("http://localhost/api/v1/status");
      const res = await worker.fetch(req, env, ctx);

      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data).toEqual({
        success: true,
        data: {
          status: "healthy",
          environment: "test",
          timestamp: expect.any(String),
          version: "1.0.0",
        },
      });
    });
  });

  describe("Message Handler", () => {
    it("should create a new message successfully", async () => {
      const req = new Request("http://localhost/api/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Test message" }),
      });

      const res = await worker.fetch(req, env, ctx);

      expect(res.status).toBe(201);
      const data = await res.json();

      expect(data).toEqual({
        success: true,
        data: {
          message: "Test message",
          timestamp: expect.any(String),
          id: expect.any(String),
        },
      });
    });

    it("should return 400 for missing message", async () => {
      const req = new Request("http://localhost/api/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const res = await worker.fetch(req, env, ctx);

      expect(res.status).toBe(400);
      const data = await res.json();

      expect(data).toEqual({
        success: false,
        error: {
          message:
            "Invalid message format. Message field is required and must be a string",
          code: 400,
        },
      });
    });

    it("should return 415 for invalid content type", async () => {
      const req = new Request("http://localhost/api/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: "Invalid body",
      });

      const res = await worker.fetch(req, env, ctx);

      expect(res.status).toBe(415);
      const data = await res.json();

      expect(data).toEqual({
        success: false,
        error: {
          message: "Content-Type must be application/json",
          code: 415,
        },
      });
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for unknown endpoints", async () => {
      const req = new Request("http://localhost/api/v1/unknown");
      const res = await worker.fetch(req, env, ctx);

      expect(res.status).toBe(404);
      const data = await res.json();

      expect(data).toEqual({
        success: false,
        error: {
          message: "Not Found",
          code: 404,
        },
      });
    });

    it("should return 400 for invalid API version", async () => {
      const req = new Request("http://localhost/api/v2/status");
      const res = await worker.fetch(req, env, ctx);

      expect(res.status).toBe(400);
      const data = await res.json();

      expect(data).toEqual({
        success: false,
        error: {
          message: "Invalid API version",
          code: 400,
        },
      });
    });
  });

  describe("CORS Handling", () => {
    it("should handle CORS preflight requests", async () => {
      const req = new Request("http://localhost/api/v1/messages", {
        method: "OPTIONS",
      });

      const res = await worker.fetch(req, env, ctx);

      expect(res.status).toBe(200);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
        "GET, POST, OPTIONS",
      );
      expect(res.headers.get("Access-Control-Allow-Headers")).toBe(
        "Content-Type, Authorization",
      );
    });
  });
});
