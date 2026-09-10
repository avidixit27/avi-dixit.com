import { describe, expect, it } from "vitest";
import {
  FOOTER_PARALLAX_RATE,
  FOOTER_PARALLAX_REVEAL_START,
} from "./footerPresentationPolicy";

describe("footer presentation policy", () => {
  it("keeps the approved parallax rate explicit", () => {
    expect(FOOTER_PARALLAX_RATE).toBe(0.3);
    expect(FOOTER_PARALLAX_REVEAL_START).toBe(0.8);
  });
});
