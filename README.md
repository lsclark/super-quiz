# Super Quiz

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
   npm install -D
   cd frontend
   npm install -D
   ```

## Run in development environment

```
npm run start:dev
```

Navigate to `http://localhost:4200` for standard players, and `http://localhost:4200/admin` for the game manager. The administrator's login token is defined in `src/admin.ts`.
