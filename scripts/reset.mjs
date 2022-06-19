import process from "process";
import fs from "fs";
import { getEmptyTemplate } from "./lib.mjs";

async function main() {
  if (process.argv.length !== 3) {
    console.log("Usage: yarn reset <tsfile>");
    process.exit(1);
  }

  const tsfile = process.argv[2];

  if (!fs.existsSync(tsfile)) {
    console.log(`${tsfile} does not exist.`);
    process.exit(1);
  }

  const content = getEmptyTemplate(tsfile);
  fs.writeFileSync(tsfile, content);
}

main();
