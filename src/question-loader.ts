import { readFileSync } from "fs";
import glob from "glob";
import * as path from "path";
import { Question, QuestionSource } from "./question";

const basePath = "./questions/test";

function drawAndRemove<T>(data: { [key: string]: T }): [string, T] {
  let keys = Object.keys(data);
  let selected = keys[Math.floor(Math.random() * keys.length)];
  let output = data[selected];
  delete data[selected];
  return [selected, output];
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
      let raw = readFileSync(filepath, "utf-8");
      let data: QuestionSource = JSON.parse(raw);
      this.loadQuestions(filepath, data);
    }
  }

  deal(): [string[], Question[]] {
    let questions: Question[] = [];
    let selectors: string[] = [];
    ([1, 2, 3] as const).forEach((points) => {
      for (let draw = 0; draw < 5; draw++) {
        let [key, question] = drawAndRemove(this.questionPool[points]);
        questions.push(question);
        selectors.push(key);
      }
    });
    return [selectors, questions];
  }

  private loadQuestions(filepath: string, data: QuestionSource) {
    let base = path.basename(filepath, ".json");
    data.questions.forEach((question, index) => {
      if (
        question.type == "freetext" &&
        !(
          question.answer.toLowerCase() in
          question.alternatives.map((alt) => alt.toLowerCase())
        )
      ) {
        question.alternatives.push(question.answer);
      }
      this.questionPool[question.points][`${base}-${index}`] = question;
    });
  }
}
