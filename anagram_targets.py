#! /usr/bin/env python3.9

"""Generates a list of nine-letter words that have one or more anagrams.

The output is a JSON array of the form string[][]. Each sub-array is a group of
nine-letter words that are mutual anagrams of each other. Due to the way English
seems to work, these arrays will be of length two or three.
"""

import argparse
import json
from collections import defaultdict
from pathlib import Path
from typing import cast

# Installable via `sudo apt install wbritish wamerican`
dictionaries = ["/usr/share/dict/american-english", "/usr/share/dict/british-english"]
MIN_CHAR_DIFFERENCE = 4


def ensure_different_enough(words: list[str]) -> bool:
    """Check that two anagrams differ in at least MIN_CHAR_DIFFERENCE places.

    Attempts to ensure diversity between the anagrams.

    Args:"""
    differing_places = 0
    for chars in zip(*words):
        if len(set(chars)) == 1:
            continue
        else:
            differing_places += 1
    return differing_places >= MIN_CHAR_DIFFERENCE


def main(output: Path):
    """Generate the target list and save to file.

    Args:
        output (Path): The output JSON path.
    """
    candidates = defaultdict(set)
    for dictionary in dictionaries:
        with open(dictionary) as fp:
            for line in fp:
                word = line.strip()
                if "'" in word or len(word) != 9 or word[0].isupper():
                    continue
                candidates["".join(sorted(word))].add(word)

    candidates = [
        sorted(values)
        for values in candidates.values()
        if len(values) > 1 and ensure_different_enough(list(values))
    ]
    candidates.sort(key=lambda vals: (-len(vals), min(vals)))

    with output.open("w") as fp:
        json.dump(candidates, fp, indent=2)
    print(
        f"Found {sum(len(c)==3 for c in candidates)} triples"
        f" and {sum(len(c)==2 for c in candidates)} doubles"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate nine-letter target words which have at least one anagram"
    )
    parser.add_argument("output", type=Path, help="The output JSON path")
    args = parser.parse_args()
    assert (
        "json" in cast(Path, args.output).suffix.lower()
    ), "Output path must be to a JSON file"
    main(args.output)
