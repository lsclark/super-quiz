import { readFileSync } from "fs";
import glob from "glob";
import * as path from "path";
import { Question, QuestionSource } from "./question";

const basePath = "./questions/test";

function drawAndRemove<T>(data: { [key: string]: T }): T {
  let keys = Object.keys(data);
  let selected = keys[Math.floor(Math.random() * keys.length)];
  let output = data[selected];
  delete data[selected];
  return output;
}

export default class QuestionLoader {
  private questionPool: {
    [points in 1 | 2 | 3]: { [key: string]: Question };
  };

  constructor() {
    this.questionPool = { 1: {}, 2: {}, 3: {} };
    let searchPath = path.join(basePath, "*.json");
    let matches = glob.sync(searchPath);
    for (let filepath of matches) {
      console.log("Question Loader: Loading", filepath);
      let raw = readFileSync(filepath, "utf-8");
      let data: QuestionSource = JSON.parse(raw);
      this.loadQuestions(filepath, data);
    }
  }

  deal(): Question[] {
    let questions: Question[] = [];
    ([1, 2, 3] as const).forEach((points) => {
      for (let draw = 0; draw < 5; draw++) {
        let question = drawAndRemove(this.questionPool[points]);
        questions.push(question);
      }
    });
    return questions;
  }

  private loadQuestions(filepath: string, data: QuestionSource) {
    let base = path.basename(filepath, ".json");
    data.questions.forEach((question, index) => {
      this.prepareQuestion(question);
      this.checkQuestion(question);
      this.questionPool[question.points][`${base}-${index}`] = question;
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
    } else {
      if ("choices" in question) throw "Freetext can't have choices";
      if (typeof question.answer != "string")
        throw "Multichoice answer is not a string";
    }
  }
}
