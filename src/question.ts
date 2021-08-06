import { QuestionColumn, QuestionDisplay } from "./message-types";
import fuzz from "fuzzball";

export interface QuestionBase {
  points: 1 | 2 | 3;
  question: string;
}

export interface QuestionFreeText extends QuestionBase {
  type: "freetext";
  alternatives: string[];
  answer: string;
}

export interface QuestionMultiChoice extends QuestionBase {
  type: "multichoice";
  choices: string[];
  answer: number;
}

export type Question = QuestionFreeText | QuestionMultiChoice;

export interface QuestionSource {
  source: string;
  questions: Question[];
}

/**
 * Format the questions for frontend display
 * @param questions The assigned questions
 * @returns A mapping from question index to question, and the
 *   questions formatted for display at the frontend
 */
export function formatQuestionsDisplay(
  questions: Question[]
): [{ [index: number]: Question }, QuestionColumn[]] {
  let split: { [points in 1 | 2 | 3]: Question[] } = { 1: [], 2: [], 3: [] };
  for (let question of questions) {
    split[question.points].push(question);
  }
  let index = 0;
  let output: QuestionColumn[] = [];
  let indexMap: { [index: number]: Question } = {};
  ([1, 2, 3] as const).forEach((points) => {
    let colQuestions: QuestionDisplay[] = [];
    for (let question of split[points]) {
      colQuestions.push({
        index: index,
        text: question.question,
        points: question.points,
        ...(question.type == "multichoice" && { choices: question.choices }),
      });
      indexMap[index] = question;
      index++;
    }
    output.push({ points: points, questions: colQuestions });
  });
  return [indexMap, output];
}

export function formatQuestion(
  index: number,
  question: Question
): QuestionDisplay {
  return {
    index: index,
    text: question.question,
    points: question.points,
    ...(question.type == "multichoice" && { choices: question.choices }),
  };
}

export async function checkAnswerCorrect(
  question: Question,
  answer: string | number
): Promise<boolean> {
  if (question.type == "multichoice") {
    return Promise.resolve(question.answer == answer);
  } else {
    let matches: [string, number, number][] = await fuzz.extractAsPromised(
      answer,
      question.alternatives,
      {
        limit: 1,
        cutoff: 50,
      }
    );
    if (!matches.length) return false;
    let [actual, score] = matches[0];
    if (score > 95) return true;
    let charError = (1 - score / 100.0) * actual.length;
    if (actual.length < 3) return false;
    else if (actual.length < 10) {
      return charError < 1.5;
    } else {
      return charError < 2;
    }
  }
}
