import childProcess from "child_process";
import path from "path";
import fs from "fs";
import { updateExistingAnswerFile } from "./lib.mjs";

function executeNoInherit(name, args, options = {}) {
  console.log(
    `> Running "${args.join(" ")}"${options.cwd ? ` in ${options.cwd}` : ""}`
  );
  const p = childProcess.spawn(name, args, options);

  p.stdout.on("data", (data) => {
    console.log(data.toString().trim());
  });

  p.stderr.on("data", (data) => {
    console.log(data.toString().trim());
  });

  return new Promise((resolve) => {
    p.on("close", (code) => {
      if (code !== 0) {
        console.log(`${name} exited with code ${code}`);
        process.exit(code);
      }
      resolve();
    });
  });
}

async function main() {
  await executeNoInherit("git", ["pull"], {
    cwd: path.resolve("./type-challenges/"),
  });

  await executeNoInherit("yarn", [
    "upgrade",
    "typescript",
    "@type-challenges/utils",
  ]);

  console.log("> Update codes...");

  const tsfiles = fs.readdirSync(".").filter((file) => file.endsWith(".ts"));
  tsfiles.forEach((tsfile) => updateExistingAnswerFile(tsfile));
}

main();
