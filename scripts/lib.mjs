import fs from "fs";
import path from "path";
import childProcess from "child_process";

const ANSWER_START = "/* ----- Your Answer (START) ----- */";
const ANSWER_END = "/* ----- Your Answer (END) ----- */";

export function spawnTsc(tsfile) {
  return childProcess.spawn("yarn", ["tsc", "--noEmit", "--strict", tsfile]);
}

export function stripExt(filename) {
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

function formatAnswerFile({ asked, answer, testCases }) {
  return `${asked}

${ANSWER_START}

${answer}

${ANSWER_END}

${testCases}
`;
}

export function getEmptyTemplate(tsfile) {
  const { questionAsked, questionTemplate, questionTestCases } =
    getQuestionDefaultContent(tsfile);

  return formatAnswerFile({
    asked: questionAsked,
    answer: questionTemplate,
    testCases: questionTestCases,
  });
}

function extractExistingAnswer(tsfile) {
  const content = fs.readFileSync(tsfile, { encoding: "utf-8" });

  let startIndex = content.indexOf(ANSWER_START);
  if (startIndex === -1) {
    throw new Error(`Cannot find "${ANSWER_START}" for ${tsfile}`);
  }
  startIndex += ANSWER_START.length;

  const endIndex = content.indexOf(ANSWER_END);
  if (endIndex === -1) {
    throw new Error(`Cannot find "${ANSWER_END}" for ${tsfile}`);
  }

  return content.substring(startIndex, endIndex).trim();
}

export function updateExistingAnswerFile(tsfile) {
  const { questionAsked, questionTestCases } =
    getQuestionDefaultContent(tsfile);
  const existingAnswer = extractExistingAnswer(tsfile);

  fs.writeFileSync(
    tsfile,
    formatAnswerFile({
      asked: questionAsked,
      answer: existingAnswer,
      testCases: questionTestCases,
    })
  );
}
