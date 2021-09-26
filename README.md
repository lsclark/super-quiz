# Super Quiz

A real-time multiplayer quiz game built to mimic newspaper quizzes. Built using (and as a platform to learn) websockets, Angular, TypeScript, and NodeJS/Express.

![Animation showing an overview of the system features](feature_overview.gif "Feature Overview")

## Features

System features include the content below, some of which are shown in the video above.

### Quiz

The main screen is a fifteen question quiz consisting of three equally-sized subsets of questions worth 1, 2, and 3 points. Questions are specified via a predefined library in JSON format. Three question types are supported:

- Freetext: Players submit answers as freetext. Answers are matched against a set of alternatives, and are optionally fuzzy-matched.
- Numeric: Players submit numeric answers. Answers are matched exactly, or optionally within a given tolerance.
- Multichoice: Players choose their submission from a list of predefined options.

Questions are assigned randomly as players register with the system. Each question can be given an optional `category`, which ensures that a player only receives a single question within that category.

Players can respond to a question in three ways:

- Direct submission
- Delegation: Players can 'send' a question to another player of their choice. If the delegate answers correctly then the players share the original points 50-50.
- Wager: Players can wager that no other player knows the answer to their question. They set a wager greater than 3 points and less than their total points, which they receive if no other players respond correctly. The first other player to respond correctly receives the wager otherwise.

### Target

Players are assigned three target words, to which they can submit words to be spell-checked. The target words are derived from the Debian `wamerican` and `wbritish` dictionaries: words are drawn from those nine-letter words that have at least one valid anagram (that are sufficiently different to their anagrams). Spell-checking is performed against a hash-map loaded directly from a text file dictionary (rather than using an external import).

### Administrator

The webpage provides an administration interface that allows the start/stop state of the game to be controlled, as well as regrading of questions. Access to this interface is via a simple plaintext token sent alongside all messages sent from the browser client. The two administrator-initiated bonus challenges are launched via this interface.

### Other

Some other features:

- The administrator can also launch two bonus challenges:
  - Vocabulary: All players are challenged to submit the longest word they can think of. The player/s with the longest submission are awarded points.
  - Collision: All players are challenged to submit a request for points (between 1 and the number of players). The player with the largest unique request is awarded the points.
- The scorer automatically assigns bonus points to players for things such as:
  - Most target word submission attempts
  - Most correct target word submissions
  - Most points won from delegations or wagers

## Contents

- **`frontend/`**: An Angular frontend that hosts both the player and admin interfaces (via Angular routing)
- **`questions/`**: Stores the JSON question library
- **`src/`**: The backend server source
  - **`challenges/`**:
    - `bonus-challenges.ts`: Admin-initiated vocab and collision challenges
    - `group-challenge.ts`: Player-initiated 'nobody knows' challenge
    - `personal-challenge.ts`: Player-intitiated question delegation challenge
  - **`models/`**:
    - `admin-message-types.ts`: Administration message types
    - `game-message-types.ts`: Game message types
  - **`questions/`**:
    - `question-loader.ts`: Question loader and shuffle/dealer for new players
    - `question.ts`: Question specification and answer checking
  - `admin.ts`: Backend administrative interface
  - `index.ts`: The main script
  - `player.ts`: Player specification and state manager
  - `quiz-host.ts`: Game state manager
  - `scoring.ts`: Scoreboard manager
  - `target.ts`: Target word loader, assigner, and spellchecker
- `anagram_targets.py`: Identifies target words from nine-letter words having at least one anagram
- `build_dictionary.py`: Extracts a dictionary text file from the `wamerican` and `wbritish` word lists

## Setup

1. Install the following (assuming a Debian/Ubuntu host):
   1. Python3.9
   2. NodeJS 14 (LTS)
   3. Debian wordlists:
      ```
      sudo apt install wbritish wamerican
      ```
2. Initialise the node environment:
   ```
   npm install --save-dev
   cd frontend
   npm install --save-dev
   ```

## Run in development environment

```
npm run start:dev
```

Navigate to `http://localhost:4200` for standard players, and `http://localhost:4200/admin` for the game manager. The administrator's login token is defined in `src/admin.ts`: `.

## Deploy

```
npm run build
npm start
```

## Typical Run Sequence

1. The administrator spins up the server, and registers (with the token defined in `src/admin.ts`) within the `/admin` page.
2. Players navigate to the main webpage (the `/` route), and register their name.
3. The administrator starts the game within the admin interface (nb. players are still able to join after this point).
4. The normal game flow (as shown in the video above) commences.
