import { describe, it, expect } from "vitest";

import { contactStatusSchema, updateMessageStatusSchema } from "@/server/messageStatusSchema";

describe("messageStatusSchema", () => {
  it("accepts valid status", () => {
    expect(contactStatusSchema.parse("NEW")).toBe("NEW");
    expect(contactStatusSchema.parse("DONE")).toBe("DONE");
    expect(contactStatusSchema.parse("ARCHIVED")).toBe("ARCHIVED");
    expect(contactStatusSchema.parse("SPAM")).toBe("SPAM");
  });

  it("rejects invalid status", () => {
    const bad = contactStatusSchema.safeParse("NOPE");
    expect(bad.success).toBe(false);
  });

  it("validates PATCH body", () => {
    expect(updateMessageStatusSchema.safeParse({ status: "DONE" }).success).toBe(true);
    expect(updateMessageStatusSchema.safeParse({}).success).toBe(false);
    expect(updateMessageStatusSchema.safeParse({ status: "NOPE" }).success).toBe(false);
  });
});
