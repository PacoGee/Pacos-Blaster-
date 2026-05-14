# Paco's Blaster

A browser-based bomber game with single player, local two-player, and online multiplayer modes. Guide your signal-man through 10 themed field labyrinths, blow up obstacles with timed bombs, collect power-ups, and reach the exit before the enemies get you.

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

### Online multiplayer

The server includes a built-in WebSocket relay for online play. Both players must be able to reach the same server. One player creates a room and shares the 5-character room code; the other enters it and joins. The host presses Start when both are connected.

## Controls

| Action | Player 1 | Player 2 (local dual / online) |
|---|---|---|
| Move | Arrow keys | WASD |
| Place bomb | Space | F |
| Start / continue | Enter | — |
| Pause | Escape | — |

## Gameplay

- **Objective** — reach the glowing exit tile on each level. The exit is hidden under a destructible block; blow it up to reveal it.
- **Bombs** — bombs detonate after ~2 seconds and send flames in four directions. Chain explosions are possible.
- **Enemies** — four types appear across the 10 levels:
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
- **Scoring** — destroying blocks (20 pts), killing enemies (120–250 pts), clearing a level (1000 + level × 250 pts), and collecting score power-ups (500 pts).
- **Themes** — four visual themes cycle across the 10 levels: Grass Labyrinth, Corn Maze, Rye Field, and Moon Hedge.
- **Profiles** — player stats (games, wins, best score, best level, deaths, enemies killed, bombs placed) are saved in `localStorage` per player name.
