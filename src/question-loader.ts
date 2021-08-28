import { readFileSync } from "fs";
import glob from "glob";
import * as path from "path";
import { Question, QuestionSource } from "./question";

const basePath = "./questions";
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
    let searchPath = path.join(basePath, "*.json");
    let matches = glob.sync(searchPath);
    for (let filepath of matches) {
      console.log("Question Loader: Loading", filepath);
      let raw = readFileSync(filepath, "utf-8");
      let data: QuestionSource = JSON.parse(raw);
      this.loadQuestions(data);
      Object.values(this.questionPool).forEach((qs) => shuffle(qs));
    }
  }

  deal(): Question[] {
    let questions: Question[] = [];
    for (let [category, catQuestions] of Object.entries(this.questionPool)) {
      if (!category.length || !catQuestions.length) continue;
      questions.push(catQuestions.pop()!);
    }
    shuffle(questions);
    ([1, 2, 3] as const).forEach((points) => {
      let qnPoints = questions.filter((qn) => qn.points == points);
      let oversample = qnPoints.length - qnsPerPoint;
      while (oversample-- > 0) {
        let qnRemove = qnPoints.pop()!;
        questions = questions.filter((qn) => qn.question != qnRemove.question);
        this.questionPool[qnRemove.category ?? ""].push(qnRemove);
      }
      for (let draw = qnPoints.length; draw < qnsPerPoint; draw++) {
        let [question, idx] = this.questionPool[""]
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
        alt.toLowerCase().replace(/[^\w\s]/gi, "")
      );
      let answer = question.answer.toLowerCase().replace(/[^\w\s]/gi, "");
      if (!(answer in question.alternatives))
        question.alternatives.push(answer);
      question.alternatives = question.alternatives.map((alt) =>
        alt.trim().replace(/\s+/g, " ")
      );
    }
  }

  private checkQuestion(question: Question) {
    if (typeof question.points !== "number")
      throw "Question needs to have points";
    if (![1, 2, 3].includes(question.points))
      throw "Question points must be 1/2/3";
    if (question.type == "multichoice") {
      if ("alternatives" in question)
        throw "Multichoice can't have alternatives";
      if ("fuzzy" in question) throw "Multichoice can't have fuzzy";
      if (typeof question.answer != "number")
        throw "Multichoice answer is not a number";
    } else if (question.type == "numeric") {
      if (typeof question.answer !== "number")
        throw "Numeric answer must be numberic";
    } else {
      if ("choices" in question) throw "Freetext can't have choices";
      if (typeof question.answer != "string")
        throw "Multichoice answer is not a string";
    }
  }
}
