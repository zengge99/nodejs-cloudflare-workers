import { describe, it, expect } from "vitest";
import worker from "../src/index.js";

describe("Response Utilities", () => {
  it("should include CORS headers in responses", async () => {
    const req = new Request("http://localhost/api/v1/status");
    const res = await worker.fetch(req, { ENVIRONMENT: "test" });

    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  it("should format error responses correctly", async () => {
    const req = new Request("http://localhost/invalid-path");
    const res = await worker.fetch(req, { ENVIRONMENT: "test" });

    expect(res.status).toBe(400);
    const data = await res.json();

    expect(data).toHaveProperty("success", false);
    expect(data).toHaveProperty("error");
    expect(data.error).toHaveProperty("message");
    expect(data.error).toHaveProperty("code");
  });
});
