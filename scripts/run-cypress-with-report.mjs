import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, resolve } from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();

function requestedSpecs(argumentsList) {
  const requested = [];

  for (let index = 0; index < argumentsList.length; index += 1) {
    if (argumentsList[index] !== "--spec") continue;

    const value = argumentsList[index + 1];
    if (typeof value !== "string") continue;

    requested.push(...value.split(",").filter(Boolean));
  }

  return requested;
}

function readReport(reportPath) {
  if (!existsSync(reportPath)) {
    return {
      error: `Cypress did not write a completion report at ${reportPath}.`,
    };
  }

  try {
    return { report: JSON.parse(readFileSync(reportPath, "utf8")) };
  } catch (error) {
    return {
      error: `Cypress wrote an unreadable completion report: ${String(error)}.`,
    };
  }
}

export function validateBrowserRun({
  childExitCode,
  report,
  requested,
  startedAt,
}) {
  const failures = [];

  if (childExitCode !== 0) {
    failures.push(`Cypress exited with code ${childExitCode}.`);
  }

  if (!report || report.status !== "completed") {
    failures.push("Cypress did not complete its run lifecycle.");
    return failures;
  }

  const reportedStartAt = Date.parse(report.startedAt);
  if (!Number.isFinite(reportedStartAt) || reportedStartAt < startedAt) {
    failures.push("Cypress completion report predates this command.");
  }

  if (!Number.isInteger(report.totals?.tests) || report.totals.tests <= 0) {
    failures.push("Cypress completed with zero executed tests.");
  }

  if (!Array.isArray(report.specs) || report.specs.length === 0) {
    failures.push("Cypress completed without any spec results.");
  }

  if ((report.totals?.failed ?? 0) > 0) {
    failures.push(`Cypress reported ${report.totals.failed} failed tests.`);
  }

  if ((report.totals?.pending ?? 0) > 0 || (report.totals?.skipped ?? 0) > 0) {
    failures.push("Cypress completed with pending or skipped tests.");
  }

  const completed = new Set(report.specs?.map((spec) => spec.name));
  for (const requestedSpec of requested) {
    if (!completed.has(requestedSpec)) {
      failures.push(`Requested spec did not complete: ${requestedSpec}.`);
    }
  }

  return failures;
}

function runCypress(argumentsList, reportPath) {
  const binary = resolve(projectRoot, "node_modules/.bin/cypress");
  const taskEnvironment = {
    ...process.env,
    CYPRESS_REQUESTED_SPECS: JSON.stringify(requestedSpecs(argumentsList)),
    CYPRESS_RUN_REPORT_PATH: reportPath,
  };

  return new Promise((resolveRun) => {
    const child = spawn(binary, ["run", ...argumentsList], {
      cwd: projectRoot,
      env: taskEnvironment,
      stdio: "inherit",
    });

    child.once("error", (error) =>
      resolveRun({ error: error.message, exitCode: 1 }),
    );
    child.once("close", (code, signal) =>
      resolveRun({
        error: signal ? `Cypress terminated with ${signal}.` : null,
        exitCode: code ?? 1,
      }),
    );
  });
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const argumentsList = process.argv.slice(2);
  const runId = `${new Date().toISOString().replaceAll(/[:.]/g, "-")}-${process.pid}`;
  const reportDirectory = resolve(projectRoot, "cypress/results");
  const reportPath = resolve(reportDirectory, `${runId}.json`);
  const commandStartedAt = Date.now();

  mkdirSync(reportDirectory, { recursive: true });
  rmSync(reportPath, { force: true });

  const childResult = await runCypress(argumentsList, reportPath);
  const result = readReport(reportPath);
  const failures = validateBrowserRun({
    childExitCode: childResult.exitCode,
    report: result.report,
    requested: requestedSpecs(argumentsList),
    startedAt: commandStartedAt,
  });

  if (result.error) failures.unshift(result.error);
  if (childResult.error) failures.unshift(childResult.error);

  if (failures.length > 0) {
    console.error(
      `Cypress run verification failed for ${basename(reportPath)}:`,
    );
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = childResult.exitCode === 0 ? 1 : childResult.exitCode;
  } else {
    console.log(`Cypress completion report: ${reportPath}`);
  }
}
