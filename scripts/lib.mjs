import fs from "fs";
import path from "path";

const ANSWER_START = "/* ----- Your Answer (START) ----- */";
const ANSWER_END = "/* ----- Your Answer (END) ----- */";

function stripExt(filename) {
  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex === -1) {
    return filename;
  }

  return filename.substring(0, dotIndex);
}

function generateQuestionAsked(questionMdFilePath) {
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

  return `/*
${content.substring(startIndex, endIndex).trim()}
*/`;
}

function generateQuestionTemplate(questionTemplateFilePath) {
  return fs
    .readFileSync(questionTemplateFilePath, { encoding: "utf-8" })
    .trim();
}

function generateQuestionTestCases(questionTestCasesFilePath) {
  return fs
    .readFileSync(questionTestCasesFilePath, { encoding: "utf-8" })
    .trim();
}

function getQuestionDefaultContent(tsfile) {
  const questionDir = path.resolve(
    "./type-challenges/questions",
    stripExt(tsfile)
  );

  if (!fs.existsSync(questionDir)) {
    throw new Error(`Cannot find question ${stripExt(tsfile)}`);
  }

  const questionAsked = generateQuestionAsked(
    path.resolve(questionDir, "README.md")
  );

  const questionTemplate = generateQuestionTemplate(
    path.resolve(questionDir, "template.ts")
  );

  const questionTestCases = generateQuestionTestCases(
    path.resolve(questionDir, "test-cases.ts")
  );

  return { questionAsked, questionTemplate, questionTestCases };
}

export function getEmptyTemplate(tsfile) {
  const { questionAsked, questionTemplate, questionTestCases } =
    getQuestionDefaultContent(tsfile);

  return `${questionAsked}

${ANSWER_START}

${questionTemplate}

${ANSWER_END}

${questionTestCases}
`;
}
