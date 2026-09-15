import { spawn } from "node:child_process";
import { resolve } from "node:path";

const runCount = 20;
const projectRoot = process.cwd();
const runner = resolve(projectRoot, "scripts/run-cypress-with-report.mjs");
const argumentsList = [
  runner,
  "--component",
  "--browser",
  "chrome",
  "--spec",
  [
    "src/app/Footer.cy.tsx",
    "src/app/Navigation.cy.tsx",
    "src/features/portfolio/HeroSlideshow.cy.tsx",
    "src/features/portfolio/Lightbox.cy.tsx",
  ].join(","),
];

let failures = 0;

for (let attempt = 1; attempt <= runCount; attempt += 1) {
  console.log(`Browser reliability run ${attempt}/${runCount}`);

  const exitCode = await new Promise((resolveRun) => {
    const child = spawn(process.execPath, argumentsList, {
      cwd: projectRoot,
      env: process.env,
      stdio: "ignore",
    });

    child.once("error", () => resolveRun(1));
    child.once("close", (code) => resolveRun(code ?? 1));
  });

  if (exitCode !== 0) {
    failures += 1;
    console.error(`Browser reliability run ${attempt}/${runCount} failed.`);
  }
}

if (failures > 0) {
  console.error(`${failures}/${runCount} browser reliability runs failed.`);
  process.exitCode = 1;
} else {
  console.log(`${runCount}/${runCount} browser reliability runs passed.`);
}
