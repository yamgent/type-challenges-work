import fs from "fs";
import path from "path";
import process from "process";
import childProcess from "child_process";

const TS_EXT = ".ts";

const STATUS_OK = "OK";
const STATUS_FAILED = "FAILED";
const STATUS_NO_ATTEMPT = "NA";

function stripExt(filename) {
  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex === -1) {
    return filename;
  }

  return filename.substring(0, dotIndex);
}

function extractQuestion(questionMdFilePath) {
  const content = fs.readFileSync(questionMdFilePath, { encoding: "utf-8" });
  const startComment = "<!--info-header-end-->";
  const endComment = "<!--info-footer-start-->";

  let startIndex = content.indexOf(startComment);
  if (startIndex === -1) {
    throw new Error(`Cannot find ${startComment} in ${questionMdFilePath}`);
  }
  startIndex += startComment.length;

  const endIndex = content.indexOf(endComment);
  if (endIndex === -1) {
    throw new Error(`Cannot find ${endComment} in ${questionMdFilePath}`);
  }

  return content.substring(startIndex, endIndex).trim();
}

function getEmptyTemplate(tsfile) {
  const questionDir = path.resolve(
    "./type-challenges/questions",
    stripExt(tsfile)
  );

  if (!fs.existsSync(questionDir)) {
    throw new Error(`Cannot find question ${stripExt(tsfile)}`);
  }

  const questionContent = `/*
${extractQuestion(path.resolve(questionDir, "README.md"))}
*/`;
  const answerStart = "/* ----- Your Answer (START) ----- */";

  const questionTemplate = fs
    .readFileSync(path.resolve(questionDir, "template.ts"), {
      encoding: "utf-8",
    })
    .trim();

  const answerEnd = "/* ----- Your Answer (END) ----- */";

  const questionTestCases = fs
    .readFileSync(path.resolve(questionDir, "test-cases.ts"), {
      encoding: "utf-8",
    })
    .trim();

  return `${questionContent}

${answerStart}

${questionTemplate}

${answerEnd}

${questionTestCases}
`;
}

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

  const tsc = childProcess.spawn("yarn", ["tsc", "--noEmit", tsfile]);
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
      .filter((file) => file.endsWith(TS_EXT))
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

  console.log(
    `    ${
      failedCount > 0 ? `${failedCount} FAILED!!!` : "All ok"
    } (${ignoredCount} no attempt, ${result.length} total)`
  );

  if (ignoredCount === result.length) {
    console.log("    Note: Everything not attempted.");
    process.exit(2);
  }

  if (failedCount > 0) {
    process.exit(1);
  }
}

main();
