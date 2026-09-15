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

  const result = await new Promise((resolveRun) => {
    const child = spawn(process.execPath, argumentsList, {
      cwd: projectRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });

    child.once("error", (error) =>
      resolveRun({ exitCode: 1, output: `${output}${error.message}\n` }),
    );
    child.once("close", (code) => resolveRun({ exitCode: code ?? 1, output }));
  });

  if (result.exitCode !== 0) {
    failures += 1;
    console.error(`Browser reliability run ${attempt}/${runCount} failed.`);
    if (result.output) process.stderr.write(result.output);
  }
}

if (failures > 0) {
  console.error(`${failures}/${runCount} browser reliability runs failed.`);
  process.exitCode = 1;
} else {
  console.log(`${runCount}/${runCount} browser reliability runs passed.`);
}
