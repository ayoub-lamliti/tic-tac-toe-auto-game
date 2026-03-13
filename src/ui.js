import {
    X, O, opponent,
    createBoard, generateWinLines,
    checkWinner, isDraw, getEmptyCells, makeMove
} from './game.js';
import { getCPUMove } from './ai.js';

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
    boardSize: 3,
    board: [],
    winLines: [],
    currentPlayer: X,
    startingPlayer: X,
    cpuPlayer: null,   // null = vs friend
    difficulty: 'hard',
    gameOver: false,
    scores: { [X]: 0, [O]: 0 },
    animatingCPU: false,
};

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const gridEl = document.getElementById('grid');
const turnEl = document.getElementById('turn-indicator');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const modalEl = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-message');
const modalOkBtn = document.getElementById('modal-ok');
const modalIcon = document.getElementById('modal-icon');
const quantityEl = document.getElementById('quantity');
const cpuToggle = document.getElementById('toggle-cpu');
const diffRow = document.getElementById('difficulty-row');
const diffToggle = document.getElementById('toggle-difficulty');

// ─── Setup Events ─────────────────────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('decrement').addEventListener('click', () => changeSize(-2));
document.getElementById('increment').addEventListener('click', () => changeSize(+2));

cpuToggle.addEventListener('change', () => {
    diffRow.classList.toggle('hidden', !cpuToggle.checked);
});

document.getElementById('exit-btn').addEventListener('click', exitGame);
document.getElementById('reset-btn').addEventListener('click', resetRound);

let modalCallback = null;
modalOkBtn.addEventListener('click', () => {
    hideModal();
    if (modalCallback) { modalCallback(); modalCallback = null; }
});

// ─── Size Stepper ─────────────────────────────────────────────────────────────
function changeSize(delta) {
    const val = parseInt(quantityEl.value) + delta;
    if (val >= 3 && val <= 15) quantityEl.value = val;
}

// ─── Start Game ───────────────────────────────────────────────────────────────
function startGame() {
    const playerChoice = document.querySelector('input[name="player"]:checked').value;
    state.boardSize = parseInt(quantityEl.value);
    state.startingPlayer = playerChoice;
    state.currentPlayer = playerChoice;
    state.cpuPlayer = cpuToggle.checked ? opponent(playerChoice) : null;
    state.difficulty = diffToggle.checked ? 'easy' : 'hard';
    state.scores = { [X]: 0, [O]: 0 };
    state.gameOver = false;

    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    initBoard();
    renderGrid();
    updateHUD();
}

// ─── Board Init ───────────────────────────────────────────────────────────────
function initBoard() {
    state.board = createBoard(state.boardSize);
    state.winLines = generateWinLines(state.boardSize);
    state.gameOver = false;
}

// ─── Render Grid ──────────────────────────────────────────────────────────────
function renderGrid() {
    const s = state.boardSize;
    gridEl.style.gridTemplateColumns = `repeat(${s}, 1fr)`;
    gridEl.innerHTML = '';

    state.board.forEach((_, idx) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.idx = idx;
        cell.addEventListener('click', () => onCellClick(idx));
        gridEl.appendChild(cell);
    });

    // Scale font based on board size
    const fontSize = s <= 3 ? 2.8 : s <= 5 ? 2 : s <= 7 ? 1.4 : 1;
    gridEl.style.setProperty('--cell-font', `${fontSize}rem`);
    const cellSize = s <= 3 ? 90 : s <= 5 ? 70 : s <= 7 ? 56 : 44;
    gridEl.style.setProperty('--cell-size', `${cellSize}px`);
}

// ─── Cell Click ───────────────────────────────────────────────────────────────
function onCellClick(idx) {
    if (state.gameOver || state.animatingCPU) return;
    if (state.board[idx] !== null) return;
    // Block human click if it's CPU's turn
    if (state.cpuPlayer && state.currentPlayer === state.cpuPlayer) return;

    placeMove(idx);
}

// ─── Place Move ───────────────────────────────────────────────────────────────
function placeMove(idx) {
    const player = state.currentPlayer;
    state.board = makeMove(state.board, idx, player);
    renderCell(idx, player, true);

    const result = checkWinner(state.board, state.winLines);
    if (result) {
        state.gameOver = true;
        state.scores[result.winner]++;
        updateHUD();
        highlightWin(result.line, result.winner);
        setTimeout(() => {
            const isHuman = result.winner !== state.cpuPlayer;
            const msg = state.cpuPlayer
                ? (isHuman ? 'You win! 🎉' : 'CPU wins! 🤖')
                : `Player ${result.winner.toUpperCase()} wins! 🎉`;
            showModal(result.winner === X ? '✕' : '○', 'GAME OVER', msg, resetRound);
        }, 600);
        return;
    }

    if (isDraw(state.board, state.winLines)) {
        state.gameOver = true;
        updateHUD();
        setTimeout(() => showModal('◈', 'DRAW', "It's a draw! Well played.", resetRound), 400);
        return;
    }

    // Switch player
    state.currentPlayer = opponent(player);
    updateHUD();

    // CPU turn
    if (state.cpuPlayer && state.currentPlayer === state.cpuPlayer && !state.gameOver) {
        scheduleCPU();
    }
}

// ─── CPU Turn ─────────────────────────────────────────────────────────────────
function scheduleCPU() {
    state.animatingCPU = true;
    setTimeout(() => {
        if (state.gameOver) { state.animatingCPU = false; return; }
        const move = getCPUMove(
            state.board, state.winLines,
            state.cpuPlayer, opponent(state.cpuPlayer),
            state.difficulty, state.boardSize
        );
        state.animatingCPU = false;
        if (move !== null) placeMove(move);
    }, 350);
}

// ─── Render Single Cell ───────────────────────────────────────────────────────
function renderCell(idx, player, animate = false) {
    const cell = gridEl.children[idx];
    if (!cell) return;
    cell.textContent = player === X ? '✕' : '○';
    cell.classList.add(player, animate ? 'pop' : '');
    cell.addEventListener('animationend', () => cell.classList.remove('pop'), { once: true });
}

// ─── Highlight Winning Cells ──────────────────────────────────────────────────
function highlightWin(line, winner) {
    // Dim all non-winning cells
    Array.from(gridEl.children).forEach((cell, i) => {
        if (!line.includes(i)) cell.classList.add('dim');
    });
    line.forEach(i => gridEl.children[i].classList.add('win', winner));
}

// ─── HUD Update ───────────────────────────────────────────────────────────────
function updateHUD() {
    scoreXEl.textContent = state.scores[X];
    scoreOEl.textContent = state.scores[O];

    if (state.gameOver) {
        turnEl.textContent = 'GAME OVER';
        turnEl.className = 'turn-text';
        return;
    }

    const p = state.currentPlayer;
    turnEl.textContent = state.cpuPlayer && p === state.cpuPlayer
        ? 'CPU THINKING...'
        : `${p.toUpperCase()} TURN`;
    turnEl.className = `turn-text player-${p}`;
}

// ─── Reset Round ──────────────────────────────────────────────────────────────
function resetRound() {
    // Alternate who starts
    state.startingPlayer = opponent(state.startingPlayer);
    state.currentPlayer = state.startingPlayer;
    state.gameOver = false;
    state.animatingCPU = false;

    initBoard();
    renderGrid();
    updateHUD();

    // If CPU goes first
    if (state.cpuPlayer && state.currentPlayer === state.cpuPlayer) {
        scheduleCPU();
    }
}

// ─── Exit Game ────────────────────────────────────────────────────────────────
function exitGame() {
    gameScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    state.gameOver = false;
    state.animatingCPU = false;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function showModal(icon, title, message, callback) {
    modalIcon.textContent = icon;
    modalTitle.textContent = title;
    modalMsg.textContent = message;
    modalCallback = callback;
    modalEl.classList.remove('hidden');
    modalEl.classList.add('show');
}

function hideModal() {
    modalEl.classList.remove('show');
    setTimeout(() => modalEl.classList.add('hidden'), 300);
}