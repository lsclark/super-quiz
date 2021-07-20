from collections import defaultdict
import json

# Installable via `sudo apt install wbritish wamerican`
dictionaries = [
    "/usr/share/dict/american-english",
    "/usr/share/dict/british-english"
]
MIN_CHAR_DIFFERENCE = 4

def ensure_different_enough(words: list[str]) -> bool:
    differing_places = 0
    for chars in zip(*words):
        if len(set(chars))==1:
            continue
        else:
            differing_places += 1
    return differing_places >= MIN_CHAR_DIFFERENCE

candidates = defaultdict(set)
for dictionary in dictionaries:
    with open(dictionary) as fp:
        for line in fp:
            word = line.strip()
            if "'" in word or len(word) != 9 or word[0].isupper():
                continue
            candidates[''.join(sorted(word))].add(word)

candidates = [sorted(values) for values in candidates.values()
              if len(values) > 1 and ensure_different_enough(list(values))]
candidates.sort(key=lambda vals: (-len(vals), min(vals)))

with open('targets.json','w') as fp:
    json.dump(candidates, fp, indent=2)
print(f"Found {sum(len(c)==3 for c in candidates)} triples"
      f" and {sum(len(c)==2 for c in candidates)} doubles")
