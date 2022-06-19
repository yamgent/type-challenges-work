import fs from "fs";
import path from "path";
import childProcess from "child_process";

const STATUS_PASSED = "PASSED";
const STATUS_FAILED = "FAILED";
const STATUS_DOES_NOT_EXIST = "DOES_NOT_EXIST";

const dashboard = {};
let longestNameLength = 1;

function runTest(name) {
  const tsfile = `${name}.ts`;
  if (!fs.existsSync(tsfile)) {
    return Promise.resolve([STATUS_DOES_NOT_EXIST, []]);
  }

  // TODO: Code below
  const p = childProcess.spawn("yarn", ["tsc", "--noEmit", tsfile]);

  return new Promise((resolve) => {
    p.on("close", (code) => {
      resolve([code === 0 ? STATUS_PASSED : STATUS_FAILED, []]);
    });
  });
}

async function initDashboard() {
  const questionDir = path.resolve("./type-challenges/questions");
  await Promise.all(
    fs.readdirSync(questionDir).map(async (file) => {
      dashboard[file] = (await runTest(file))[0];
    })
  );
  longestNameLength = Math.max(...Object.keys(dashboard).map((k) => k.length));
}

function printDashboard() {
  const sorted = {
    warm: [],
    easy: [],
    medium: [],
    hard: [],
    extreme: [],
    unclassified: [],
  };

  Object.keys(dashboard).forEach((testname) => {
    const level = testname.split("-")[1];
    let dest = sorted.unclassified;

    if (level in sorted) {
      dest = sorted[level];
    }

    dest.push([testname, dashboard[testname]]);
  });

  Object.keys(sorted).forEach((key) => {
    sorted[key].sort((a, b) => a[0].localeCompare(b[0]));

    console.log(`=== ${key} ===`);
    sorted[key].forEach((entry, index) => {
      if (index % 3 === 0) {
        console.log();
      }

      const content = `${entry[0]} ${
        entry[1] === STATUS_PASSED
          ? "O"
          : entry[1] === STATUS_FAILED
          ? "X"
          : "."
      }`.padEnd(longestNameLength + 5);

      process.stdout.write(content);
    });
    console.log();
    console.log();
  });
}

async function main() {
  await initDashboard();
  printDashboard();
}

main();
