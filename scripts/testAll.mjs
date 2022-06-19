import fs from "fs";
import process from "process";
import { getEmptyTemplate, spawnTsc } from "./lib.mjs";

const STATUS_OK = "OK";
const STATUS_FAILED = "FAILED";
const STATUS_NO_ATTEMPT = "NA";

function checkAnswer(tsfile) {
  const emptyTemplate = getEmptyTemplate(tsfile);
  const actualContent = fs.readFileSync(tsfile, { encoding: "utf-8" });

  if (emptyTemplate === actualContent) {
    return {
      name: tsfile,
      status: STATUS_NO_ATTEMPT,
      output: [],
    };
  }

  const tsc = spawnTsc(tsfile);
  const output = [];

  tsc.stdout.on("data", (data) => {
    output.push(data.toString());
  });

  tsc.stderr.on("data", (data) => {
    output.push(data.toString());
  });

  return new Promise((resolve) => {
    tsc.on("close", (code) => {
      resolve({
        name: tsfile,
        status: code === 0 ? STATUS_OK : STATUS_FAILED,
        output,
      });
    });
  });
}

async function main() {
  const result = await Promise.all(
    fs
      .readdirSync(".")
      .filter((file) => file.endsWith(".ts"))
      .map(async (tsfile) => {
        return await checkAnswer(tsfile);
      })
  );

  console.log("== RESULTS ==");
  result.forEach((r) => {
    console.log(`${r.name}: ${r.status}`);
  });
  console.log();

  const failedCount = result.filter((r) => r.status === STATUS_FAILED).length;
  const ignoredCount = result.filter(
    (r) => r.status === STATUS_NO_ATTEMPT
  ).length;

  if (failedCount > 0) {
    console.log("== MESSAGES ==");
    result
      .filter((r) => r.status === STATUS_FAILED)
      .forEach((r) => {
        console.log(`## ${r.name} output: `);
        console.log(r.output.join(""));
      });
  }

  if (failedCount === 0 && ignoredCount === 0) {
    console.log(`    All ok (${result.length} total)`);
    return;
  }

  console.log(`   FAILURE!!!`);
  console.log(
    `   ${failedCount} failed, ${ignoredCount} no attempt (${result.length} total)`
  );
  process.exit(1);
}

main();
