# Paco's Blaster

A browser-based bomber game with single player, local two-player, and online competitive multiplayer. Guide your signal-man through 10 themed field labyrinths, blow up obstacles with timed bombs, collect power-ups, and reach the exit before the enemies get you.

## How to run

No dependencies. Requires Node.js.

```bash
node server.js
```

Then open [http://localhost:4173](http://localhost:4173) in your browser.

The server port defaults to `4173`. Override it with the `PORT` environment variable:

```bash
PORT=8080 node server.js
```

On Windows you can also double-click `start-game.bat`.

## Controls

| Action | Player 1 | Player 2 (local dual / online) |
|---|---|---|
| Move | Arrow keys | WASD |
| Place bomb | Space | F |
| Start / continue | Enter | — |
| Pause | Escape | — |

## Game modes

### Single player
One player, three lives, ten levels. Reach the exit on each level to advance. Run out of lives and it's game over.

### Local dual player
Two players on the same keyboard sharing lives. Same rules as single player — cooperate to reach the exit, or blow each other up.

### Online multiplayer (best of 3)
Competitive head-to-head over the network. One player creates a room and shares the 5-character room code; the other enters it to join. Rooms can also be browsed directly from the online panel without entering a code.

**Match format** — best of 3 rounds. First player to win 2 rounds wins the match.

**Rounds** — each player has 1 life per round. The last player alive wins the round. If both players die at the same moment the round is a draw and no point is awarded.

**Starting** — the host presses Start Game once their opponent has joined (the button flashes green as a signal). The host also controls the start of each subsequent round.

**HUD during a match** — the Player field shows the current round score (`host–guest`) and the Lives field shows each player's remaining life (`P1/P2`).

## Gameplay

- **Objective** — reach the glowing exit tile on each level. The exit is hidden under a destructible block; blow it up to reveal it.
- **Bombs** — detonate after ~2 seconds and send flames in four directions. Chain explosions are possible. Bombs can kill both players.
- **Enemies** — four types appear across the 10 levels, spawning near the centre of the maze:
  - *Balloon* — wanders randomly
  - *Patrol* — follows a straight line until blocked
  - *Ghost* — can pass through destructible blocks
  - *Chaser* — actively hunts you when close
- **Power-ups** — hidden inside destructible blocks. Blow them up to reveal and collect:
  - **B** — extra bomb slot
  - **F** — longer flame range
  - Speed — faster movement
  - **+** — extra life
  - **$** — score bonus
- **Scoring** — destroying blocks (20 pts), killing enemies (120–250 pts), clearing a level (1000 + level × 250 pts), collecting score power-ups (500 pts).
- **Themes** — four visual themes cycle across the 10 levels: Grass Labyrinth, Corn Maze, Rye Field, and Moon Hedge.
- **Profiles** — player stats (games, wins, best score, best level, deaths, enemies killed, bombs placed) are saved in `localStorage` per player name.
