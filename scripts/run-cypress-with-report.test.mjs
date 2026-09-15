import { describe, expect, it } from "vitest";
import { validateBrowserRun } from "./run-cypress-with-report.mjs";

const startedAt = Date.parse("2026-09-14T20:00:00.000Z");

function completedReport(overrides = {}) {
  return {
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
});
