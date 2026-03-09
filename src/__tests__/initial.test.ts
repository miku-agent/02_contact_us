import { describe, it, expect } from "vitest";

import { contactSchema } from "@/server/contactSchema";

describe("02_contact_us", () => {
  it("sanity", () => {
    expect(true).toBe(true);
  });

  it("validates contact payload", () => {
    const ok = contactSchema.safeParse({
      name: "Bini",
      email: "bini59@example.com",
      message: "hello",
    });

    expect(ok.success).toBe(true);

    const bad = contactSchema.safeParse({
      name: "",
      email: "not-an-email",
      message: "",
    });

    expect(bad.success).toBe(false);
  });
});
