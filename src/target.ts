import { readFileSync } from "fs";

const targetsPath = "./targets.json";
const dictionaryPath = "./dictionary.txt";

function shuffle<T>(array: Array<T>): Array<T> {
  return array
    .map((val) => {
      return { val: val, sort: Math.random() };
    })
    .sort((a, b) => a.sort - b.sort)
    .map((val) => val.val);
}

export class Target {
  /** Track past correct submissions */
  submissions: Set<string>;
  centre: string;
  others: string[];
  bins: { [key: string]: number };

  constructor(private word: string, private manager: TargetManager) {
    this.submissions = new Set<string>();
    let letters: string[] = shuffle(word.split(""));
    this.centre = letters[0];
    this.others = letters.slice(1);
    this.bins = {};
    word.split("").forEach((letter) => {
      if (letter in this.bins) this.bins[letter]++;
      else this.bins[letter] = 1;
    });
  }

  getScore(): number {
    return Array.from(this.submissions).reduce((accum, word) => {
      switch (word.length) {
        case 4:
          return accum + 0.5;
        case 5:
          return accum + 0.75;
        case 6:
          return accum + 1.0;
        case 7:
          return accum + 1.25;
        case 8:
          return accum + 1.5;
        case 9:
          return accum + 3;
        default:
          return accum;
      }
    }, 0);
  }

  equivalent(word: string): boolean {
    return this.word.split("").sort().join() === word.split("").sort().join();
  }

  checkSubmission(word: string): boolean {
    if (word.length <= 3) return false;
    if (this.submissions.has(word)) return false;
    if (!word.includes(this.centre)) return false;
    let bins: { [key: string]: number } = {};
    word.split("").forEach((letter) => {
      if (letter in bins) bins[letter]++;
      else bins[letter] = 1;
    });
    for (let [letter, count] of Object.entries(bins)) {
      if (!(letter in this.bins) || count > this.bins[letter]) return false;
    }
    if (!this.manager.spellcheck(word)) return false;
    this.submissions.add(word);
    return true;
  }
}

export class TargetManager {
  pool_three: string[][];
  pool_two: string[][];
  private dictionary: Set<string>;

  constructor() {
    let data: string[][] = JSON.parse(readFileSync(targetsPath, "utf-8"));
    this.pool_three = shuffle(data.filter((vals) => vals.length == 3));
    this.pool_two = shuffle(data.filter((vals) => vals.length == 2));

    this.dictionary = new Set(
      readFileSync(dictionaryPath, "utf-8")
        .split("\n")
        .map((word) => word.trim())
    );
  }

  spellcheck(word: string): boolean {
    return this.dictionary.has(word);
  }

  getTargets(): Target[] | null {
    let word3 = this.pool_three.pop();
    let words: (string[] | undefined)[] = !!word3 ? [word3] : [];
    while (words.length < 3) {
      words.push(this.pool_two.pop());
    }
    return words
      .filter((vals): vals is string[] => !!vals)
      .map((vals) => new Target(vals[0], this));
  }
}
