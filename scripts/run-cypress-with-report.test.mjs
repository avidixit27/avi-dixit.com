import { describe, expect, it } from "vitest";
import {
  expectedSpecs,
  requestedSpecs,
  validateBrowserRun,
} from "./run-cypress-with-report.mjs";

const startedAt = Date.parse("2026-09-14T20:00:00.000Z");

function completedReport(overrides = {}) {
  return {
    commit: "test-commit",
    specs: [
      {
        name: "src/app/Footer.cy.tsx",
      },
    ],
    startedAt: "2026-09-14T20:00:01.000Z",
    status: "completed",
    totals: {
      failed: 0,
      pending: 0,
      skipped: 0,
      tests: 1,
    },
    ...overrides,
  };
}

describe("validateBrowserRun", () => {
  it("parses separate and equals-form spec arguments", () => {
    expect(
      requestedSpecs([
        "--spec",
        "src/app/Footer.cy.tsx,src/app/Navigation.cy.tsx",
        "--spec=src/features/portfolio/*.cy.tsx",
      ]),
    ).toEqual([
      "src/app/Footer.cy.tsx",
      "src/app/Navigation.cy.tsx",
      "src/features/portfolio/*.cy.tsx",
    ]);
  });

  it("expands every requested glob before validation", () => {
    expect(
      expectedSpecs(["src/features/portfolio/*.cy.tsx"], () => [
        "src/features/portfolio/HeroSlideshow.cy.tsx",
        "src/features/portfolio/Lightbox.cy.tsx",
      ]),
    ).toEqual([
      "src/features/portfolio/HeroSlideshow.cy.tsx",
      "src/features/portfolio/Lightbox.cy.tsx",
    ]);
  });

  it("accepts a completed run with the requested spec and tests", () => {
    expect(
      validateBrowserRun({
        childExitCode: 0,
        report: completedReport(),
        requested: ["src/app/Footer.cy.tsx"],
        startedAt,
      }),
    ).toEqual([]);
  });

  it("rejects silent exits without a completion report", () => {
    expect(
      validateBrowserRun({
        childExitCode: 0,
        report: undefined,
        requested: ["src/app/Footer.cy.tsx"],
        startedAt,
      }),
    ).toContain("Cypress did not complete its run lifecycle.");
  });

  it("rejects stale, incomplete, and zero-test reports", () => {
    expect(
      validateBrowserRun({
        childExitCode: 0,
        report: completedReport({
          specs: [],
          startedAt: "2026-09-14T19:59:59.000Z",
          totals: { failed: 0, pending: 0, skipped: 0, tests: 0 },
        }),
        requested: ["src/app/Footer.cy.tsx"],
        startedAt,
      }),
    ).toEqual(
      expect.arrayContaining([
        "Cypress completion report predates this command.",
        "Cypress completed with zero executed tests.",
        "Cypress completed without any spec results.",
        "Requested spec did not complete: src/app/Footer.cy.tsx.",
      ]),
    );
  });

  it("preserves Cypress failures instead of masking them", () => {
    expect(
      validateBrowserRun({
        childExitCode: 3,
        report: completedReport({
          totals: { failed: 1, pending: 0, skipped: 0, tests: 1 },
        }),
        requested: ["src/app/Footer.cy.tsx"],
        startedAt,
      }),
    ).toEqual(
      expect.arrayContaining([
        "Cypress exited with code 3.",
        "Cypress reported 1 failed tests.",
      ]),
    );
  });

  it("rejects a report without its tested commit", () => {
    expect(
      validateBrowserRun({
        childExitCode: 0,
        report: completedReport({
          commit: null,
        }),
        requested: ["src/app/Footer.cy.tsx"],
        startedAt,
      }),
    ).toContain(
      "Cypress completion report does not identify the tested commit.",
    );
  });

  it("rejects a partial result from an expanded glob", () => {
    expect(
      validateBrowserRun({
        childExitCode: 0,
        report: completedReport({
          specs: [{ name: "src/features/portfolio/Lightbox.cy.tsx" }],
        }),
        requested: [
          "src/features/portfolio/HeroSlideshow.cy.tsx",
          "src/features/portfolio/Lightbox.cy.tsx",
        ],
        startedAt,
      }),
    ).toContain(
      "Requested spec did not complete: src/features/portfolio/HeroSlideshow.cy.tsx.",
    );
  });
});
