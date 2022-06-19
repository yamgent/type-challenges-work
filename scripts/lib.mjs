import fs from "fs";
import path from "path";

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

export function getEmptyTemplate(tsfile) {
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
