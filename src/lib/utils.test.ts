import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("une classes e ignora valores falsos", () => {
    expect(cn("a", false, "b")).toBe("a b");
  });
});
