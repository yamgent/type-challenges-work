import path from "path";
import childProcess from "child_process";
import {
  getTsAnswerFilesList,
  setupRunnerFoundation,
  collate,
  RUNNER_REL_DIR,
} from "./_lib.mjs";

async function runRunnerTest() {
  const runnerDir = path.resolve(RUNNER_REL_DIR);
  const output = [];
  const tsc = childProcess.spawn("yarn", ["tsc", "index.ts"], {
    cwd: runnerDir,
  });

  tsc.stdout.on("data", (data) => {
    output.push(data.toString());
  });

  tsc.stderr.on("data", (data) => {
    output.push(data.toString());
  });

  return new Promise((resolve) => {
    tsc.on("close", (code) => {
      resolve([code, output]);
    });
  });
}

async function main() {
  const tsfiles = getTsAnswerFilesList();
  await setupRunnerFoundation();

  const failureOutputs = {};

  for (const tsfile of tsfiles) {
    await collate(tsfile);
    const result = await runRunnerTest();

    if (result[0] !== 0) {
      failureOutputs[tsfile] = result[1];
    }
  }

  console.log("== RESULTS ==");
  tsfiles.forEach((tsfile) => {
    console.log(`${tsfile}: ${failureOutputs[tsfile] ? "FAILURE" : "OK"}`);
  });
  console.log();

  if (Object.values(failureOutputs).length === 0) {
    console.log("ALL OK");
  } else {
    console.log("== MESSAGES ==");
    Object.entries(failureOutputs).forEach(([file, output]) => {
      console.log(`### ${file}:`);
      console.log(output.join(""));
    });
  }
}

main();
