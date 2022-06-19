import process from "process";
import fs from "fs";
import path from "path";
import { stripExt, getEmptyTemplate } from "./lib.mjs";

async function main() {
  if (process.argv.length !== 3) {
    console.log("Usage: yarn reset <tsfile>");
    process.exit(1);
  }

  const tsfile = process.argv[2];

  if (!tsfile.endsWith(".ts")) {
    console.log(`${tsfile} is not a ts extension`);
    process.exit(1);
  }

  if (
    !fs.existsSync(
      path.resolve("./type-challenges/questions", stripExt(tsfile))
    )
  ) {
    console.log(`${stripExt(tsfile)} is not a proper question.`);
    process.exit(1);
  }

  const content = getEmptyTemplate(tsfile);
  fs.writeFileSync(tsfile, content);
}

main();
