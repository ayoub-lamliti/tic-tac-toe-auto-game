# Tic Tac Toe

[![Live Demo](https://img.shields.io/badge/▶%20Live%20Demo-Play%20now-brightgreen?style=for-the-badge)](https://ayoub-lamliti.github.io/tic-tac-toe-auto-game)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A browser-based Tic Tac Toe game with an AI opponent powered by the **Minimax algorithm** — the hard mode CPU plays a perfect, unbeatable game.

---

## 📸 Screenshots

<p>
  <img src="https://raw.githubusercontent.com/ayoub-lamliti/tic-tac-toe-auto-game/main/images/img1.png" width="400" alt="Game screen 1" />
  <img src="https://raw.githubusercontent.com/ayoub-lamliti/tic-tac-toe-auto-game/main/images/img2.png" width="400" alt="Game screen 2" />
</p>
<p>
  <img src="https://raw.githubusercontent.com/ayoub-lamliti/tic-tac-toe-auto-game/main/images/img3.png" width="400" alt="Game screen 3" />
  <img src="https://raw.githubusercontent.com/ayoub-lamliti/tic-tac-toe-auto-game/main/images/img4.png" width="400" alt="Game screen 4" />
</p>

---

## ✨ Features

- **vs CPU** — easy (random moves) or hard (Minimax, unbeatable)
- **vs Friend** — local two-player mode
- **Responsive design** — works on desktop and mobile
- **Zero dependencies** — pure HTML / CSS / JS, no install needed

---

## 🧠 How the AI works

The hard mode CPU uses **Minimax** — a classic game-tree algorithm that simulates every possible move sequence to pick the optimal play. It cannot be beaten, only drawn.

```
For every empty cell:
→ Simulate placing the CPU's mark
→ Recursively evaluate all opponent responses
→ Score the outcome (win / draw / loss)
→ Pick the move with the highest score
```

---

## 🚀 Quick Start

```bash
open index.html
```

Or just double-click `index.html` — no server, no build step.

---

## 🎮 How to Play

1. Choose **vs CPU** or **vs Friend**
2. If vs CPU, pick **Easy** or **Hard**
3. Click a cell to place your mark
4. First to get three in a row wins

---

## 📁 Project Structure

```
index.html
src/
  ├── game.js       — game logic & Minimax AI
  ├── ui.js         — DOM interactions
  └── style.css     — layout & animations
images/
  └── screenshots
README.md
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

**Author:** Ayoub Lamliti · Made for 42 School
