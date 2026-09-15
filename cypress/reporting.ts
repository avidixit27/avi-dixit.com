import { mkdirSync, writeFileSync } from "node:fs";
import { arch, platform, release } from "node:os";
import { dirname } from "node:path";

interface SpecReport {
  readonly failedTests: readonly {
    readonly error: string;
    readonly title: readonly string[];
  }[];
  readonly failures: number;
  readonly name: string;
  readonly pending: number;
  readonly skipped: number;
  readonly tests: number;
}

interface BrowserRunReport {
  readonly browser: string | null;
  readonly completedAt: string;
  readonly cypressVersion: string | null;
  readonly nodeVersion: string;
  readonly os: {
    readonly architecture: string;
    readonly name: string;
    readonly version: string;
  };
  readonly requestedSpecs: readonly string[];
  readonly specs: readonly SpecReport[];
  readonly startedAt: string;
  readonly status: "completed";
  readonly totals: {
    readonly failed: number;
    readonly passed: number;
    readonly pending: number;
    readonly skipped: number;
    readonly tests: number;
  };
}

function getRequestedSpecs() {
  const requestedSpecs = process.env.CYPRESS_REQUESTED_SPECS;
  if (!requestedSpecs) return [];

  try {
    const parsed = JSON.parse(requestedSpecs);
    return Array.isArray(parsed)
      ? parsed.filter((spec): spec is string => typeof spec === "string")
      : [];
  } catch {
    return [];
  }
}

function writeReport(report: BrowserRunReport) {
  const reportPath = process.env.CYPRESS_RUN_REPORT_PATH;
  if (!reportPath) return;

  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

export function registerBrowserRunReporting(on: Cypress.PluginEvents): void {
  const startedAt = new Date().toISOString();

  on("after:run", (results) => {
    if (!("runs" in results)) return;

    const report: BrowserRunReport = {
      browser:
        typeof results.browserName === "string"
          ? `${results.browserName} ${results.browserVersion}`
          : null,
      completedAt: new Date().toISOString(),
      cypressVersion:
        typeof results.cypressVersion === "string"
          ? results.cypressVersion
          : null,
      nodeVersion: process.version,
      os: {
        architecture: arch(),
        name: platform(),
        version: release(),
      },
      requestedSpecs: getRequestedSpecs(),
      specs: results.runs.map((run) => ({
        failedTests: run.tests
          .filter(
            (test) =>
              test.state === "failed" && typeof test.displayError === "string",
          )
          .map((test) => ({
            error: test.displayError ?? "Unknown Cypress test failure.",
            title: test.title,
          })),
        failures: run.stats.failures,
        name: run.spec.relative,
        pending: run.stats.pending,
        skipped: run.stats.skipped,
        tests: run.stats.tests,
      })),
      startedAt,
      status: "completed",
      totals: {
        failed: getNumber(results.totalFailed),
        passed: getNumber(results.totalPassed),
        pending: getNumber(results.totalPending),
        skipped: getNumber(results.totalSkipped),
        tests: getNumber(results.totalTests),
      },
    };

    writeReport(report);
  });
}
