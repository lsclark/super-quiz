import re

# Installable via `sudo apt install wbritish wamerican`
dictionaries = ["/usr/share/dict/american-english", "/usr/share/dict/british-english"]

words = set()
for dictionary in dictionaries:
    with open(dictionary) as fp:
        for line in fp:
            word = line.strip()
            if (
                "'" in word
                or word[0].isupper()
                or len(word) < 4
                or len(word) > 9
                or not re.match(r"^[a-z]*$", word)
            ):
                continue
            words.add(word)

with open("dictionary.txt", "w") as fp:
    for word in sorted(words):
        fp.write(word + "\n")
print(f"Wrote {len(words)} words to file")
