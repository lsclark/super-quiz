#! /usr/bin/env python3.9

"""Build a dictionary of valid UK/US English words.

The dictionary has non-proper nouns of length at least four.
"""

import argparse
import re
from pathlib import Path
from typing import cast

# Installable via `sudo apt install wbritish wamerican`
dictionaries = ["/usr/share/dict/american-english", "/usr/share/dict/british-english"]


def main(output: Path):
    words = set()
    for dictionary in dictionaries:
        with open(dictionary) as fp:
            for line in fp:
                word = line.strip()
                if (
                    "'" in word
                    or word[0].isupper()
                    or len(word) < 4
                    # or len(word) > 9
                    or not re.match(r"^[a-z]*$", word)
                ):
                    continue
                words.add(word)

    with output.open("w") as fp:
        for word in sorted(words):
            fp.write(word + "\n")
    print(f"Wrote {len(words)} words to {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a dictionary")
    parser.add_argument("output", type=Path, help="The output txt path")
    args = parser.parse_args()
    assert (
        "txt" in cast(Path, args.output).suffix.lower()
    ), "Output path must be to a txt file"
    main(args.output)
