import { readFileSync } from "fs";
import glob from "glob";
import * as path from "path";

import { Question, QuestionSource } from "./question";

const basePath = path.join(__dirname, "..", "questions");
const qnsPerPoint = 5;

function shuffle<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export default class QuestionLoader {
  /** Available questions to assign. The key
   * is a category name or "" for uncategorised. */
  private questionPool: { [key: string]: Question[] } = { "": [] };

  constructor() {
    const searchPath = path.join(basePath, "*.json");
    const matches = glob.sync(searchPath);
    for (const filepath of matches) {
      console.log("Question Loader: Loading", filepath);
      const raw = readFileSync(filepath, "utf-8");
      const data: QuestionSource = JSON.parse(raw);
      this.loadQuestions(data);
      Object.values(this.questionPool).forEach((qs) => shuffle(qs));
    }
  }

  deal(): Question[] {
    let questions: Question[] = [];
    for (const [category, catQuestions] of Object.entries(this.questionPool)) {
      if (!category.length || !catQuestions.length) continue;
      const catQuest = catQuestions.pop();
      if (catQuest) questions.push(catQuest);
    }
    shuffle(questions);
    ([1, 2, 3] as const).forEach((points) => {
      const qnPoints = questions.filter((qn) => qn.points == points);
      let oversample = qnPoints.length - qnsPerPoint;
      while (oversample-- > 0) {
        const qnRemove = qnPoints.pop() as Question;
        questions = questions.filter((qn) => qn.question != qnRemove.question);
        this.questionPool[qnRemove.category ?? ""].push(qnRemove);
      }
      for (let draw = qnPoints.length; draw < qnsPerPoint; draw++) {
        const [question, idx] = this.questionPool[""]
          .map((qn, idx): [Question, number] => [qn, idx])
          .find(([qn]) => qn.points == points) ?? [null, null];
        if (question === null || idx === null) {
          console.log("RAN OUT OF QUESTIONS");
          break;
        }
        questions.push(question);
        this.questionPool[""].splice(idx, 1);
      }
    });
    shuffle(questions);
    return questions;
  }

  private loadQuestions(data: QuestionSource) {
    data.questions.forEach((question) => {
      this.prepareQuestion(question);
      this.checkQuestion(question);
      if (!!question.category && !(question.category in this.questionPool))
        this.questionPool[question.category ?? ""] = [];
      this.questionPool[question.category ?? ""].push(question);
    });
  }

  private prepareQuestion(question: Question) {
    if (question.type == "freetext") {
      question.alternatives = question.alternatives.map((alt) =>
        alt.toLowerCase().replace(/\W/gi, "")
      );
      const answer = question.answer.toLowerCase().replace(/\W/gi, "");
      if (!(answer in question.alternatives))
        question.alternatives.push(answer);
      question.alternatives = question.alternatives.map((alt) =>
        alt.trim().replace(/\s+/g, " ")
      );
    }
  }

  private checkQuestion(question: Question) {
    if (typeof question.points !== "number")
      throw `Question needs to have points [${question.question}]`;
    if (![1, 2, 3].includes(question.points))
      throw `Question points must be 1/2/3 [${question.question}]`;
    if (question.type == "multichoice") {
      if ("alternatives" in question)
        // @ts-expect-error error case
        throw `Multichoice can't have alternatives [${question.question}]`;
      if ("fuzzy" in question)
        // @ts-expect-error error case
        throw `Multichoice can't have fuzzy [${question.question}]`;
      if (typeof question.answer != "number")
        throw `Multichoice answer is not a number [${question.question}]`;
    } else if (question.type == "numeric") {
      if (typeof question.answer !== "number")
        throw `Numeric answer must be numberic [${question.question}]`;
    } else {
      if (!("alternatives" in question))
        // @ts-expect-error error case
        throw `Freetext doesn't have alternatives [${question.question}]`;
      if ("choices" in question)
        // @ts-expect-error error case
        throw `Freetext can't have choices [${question.question}]`;
      if (typeof question.answer != "string")
        throw `Multichoice answer is not a string [${question.question}]`;
    }
  }
}
