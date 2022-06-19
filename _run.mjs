import process from "process";
import path from "path";
import childProcess from "child_process";
import { setupRunnerFoundation, collate, RUNNER_REL_DIR } from "./_lib.mjs";

async function runRunnerTscCompile() {
  const runnerDir = path.resolve(RUNNER_REL_DIR);
  childProcess.spawn("yarn", ["tsc", "index.ts"], {
    cwd: runnerDir,
    // inherit the tsc process so that it will show
    // more detailed error message (otherwise it will only
    // show basic error message without the test case lines)
    stdio: "inherit",
  });
}

async function main() {
  if (process.argv.length !== 3) {
    console.log("Usage: node run.mjs <tsfile>");
    process.exit(1);
  }

  const tsfile = process.argv[2];

  await setupRunnerFoundation();
  await collate(tsfile);
  runRunnerTscCompile();
}

main();
