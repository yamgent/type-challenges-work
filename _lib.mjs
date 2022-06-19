import process from "process";
import path from "path";
import fs from "fs";
import childProcess from "child_process";

export const RUNNER_REL_DIR = "./runner";

export async function setupRunnerFoundation() {
  console.log("Setting up runner...");
  const runnerDir = path.resolve(RUNNER_REL_DIR);

  if (!fs.existsSync(runnerDir)) {
    fs.mkdirSync(runnerDir);
  }

  const runnerPackageJson = path.resolve(runnerDir, "package.json");
  const runnerYarnLock = path.resolve(runnerDir, "yarn.lock");

  [runnerPackageJson, runnerYarnLock].forEach((file) => {
    if (fs.existsSync(file)) {
      fs.rmSync(file);
    }
  });

  fs.writeFileSync(
    runnerPackageJson,
    `{
  "dependencies": {
    "typescript": "*",
    "@type-challenges/utils": "./../type-challenges/utils"
  }
}`,
    {
      encoding: "utf8",
    }
  );

  const yarn = childProcess.spawn("yarn", ["install"], {
    cwd: runnerDir,
  });

  yarn.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  yarn.stderr.on("data", (data) => {
    console.log(data.toString());
  });

  return new Promise((resolve) => {
    yarn.on("close", (code) => {
      if (code !== 0) {
        console.log(`yarn install return code ${code}`);
        process.exit(code);
      }
      resolve();
    });
  });
}

const TS_EXT = ".ts";

export async function collate(tsfile) {
  // remove the .ts suffix
  if (!tsfile.endsWith(TS_EXT)) {
    console.log(
      "Provided tsfile does not end with .ts, which is not supported."
    );
    process.exit(1);
  }
  const tsfileName = tsfile.substring(0, tsfile.length - TS_EXT.length);

  // check that the question exists
  const questionDir = path.resolve("./type-challenges/questions", tsfileName);
  if (!fs.existsSync(questionDir)) {
    console.log(`${tsfileName} does not exist as a question.`);
    process.exit(1);
  }

  // if we do not have a initial template, create it
  const tsfilePath = path.resolve(tsfile);
  if (!fs.existsSync(path.resolve(tsfile))) {
    fs.copyFileSync(path.resolve(questionDir, "template.ts"), tsfilePath);
  }

  // now collate it
  const collatedContent = `${fs.readFileSync(tsfilePath, { encoding: "utf-8" })}
${fs.readFileSync(path.resolve(questionDir, "test-cases.ts"), {
  encoding: "utf-8",
})}
`;
  const collateDestPath = path.resolve(RUNNER_REL_DIR, "index.ts");
  fs.writeFileSync(collateDestPath, collatedContent);
}
