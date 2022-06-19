import process from "process";
import path from "path";
import fs from "fs";
import childProcess from "child_process";
import { setupRunnerFoundation, collate, RUNNER_REL_DIR } from "./_lib.mjs";

async function runRunnerTscWatch() {
  const runnerDir = path.resolve(RUNNER_REL_DIR);
  childProcess.spawn("yarn", ["tsc", "--watch", "index.ts"], {
    cwd: runnerDir,
    // inherit the tsc process so that it will show
    // more detailed error message (otherwise it will only
    // show basic error message without the test case lines)
    stdio: "inherit",
  });
}

async function main() {
  if (process.argv.length !== 3) {
    console.log("Usage: node watch.mjs <tsfile>");
    process.exit(1);
  }

  const tsfile = process.argv[2];

  await setupRunnerFoundation();

  await collate(tsfile);
  fs.watch(tsfile, () => {
    collate(tsfile);
  });

  runRunnerTscWatch();
}

main();
