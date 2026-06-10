import { describe, it, expect } from "vitest";
import { isValidUUID } from "@/lib/utils";

describe("isValidUUID", () => {
  it("accepts valid UUID v4", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("accepts uppercase UUID", () => {
    expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidUUID("")).toBe(false);
  });

  it("rejects string too short", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716")).toBe(false);
  });

  it("rejects SQL injection attempt", () => {
    expect(isValidUUID("'; DROP TABLE users; --")).toBe(false);
  });

  it("rejects plain number", () => {
    expect(isValidUUID("123456")).toBe(false);
  });

  it("rejects UUID with invalid chars", () => {
    expect(isValidUUID("550e8400-e29b-41d4-a716-44665544gggg")).toBe(false);
  });
});
