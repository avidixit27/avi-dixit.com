import { describe, expect, it } from "vitest";
import { SITE_DETAILS } from "./site";

describe("site details", () => {
  it("keeps the approved footer contact destinations and copyright", () => {
    expect(SITE_DETAILS).toEqual({
      email: "avidixit27@gmail.com",
      instagramUrl: "https://www.instagram.com/_avid.photography_/",
      copyright: "Copyright @Avi Dixit 2026",
    });
  });
});
