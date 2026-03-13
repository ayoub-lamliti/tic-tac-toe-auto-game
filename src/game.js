// ─── Constants ────────────────────────────────────────────────────────────────
export const X = 'x';
export const O = 'o';

// ─── Board Factory ─────────────────────────────────────────────────────────────
export function createBoard(size) {
    return new Array(size * size).fill(null);
}

// ─── Win Size ──────────────────────────────────────────────────────────────────
// 3→3, 4→4, 5+→5  (large boards need only 5-in-a-row)
export function getWinSize(boardSize) {
    return Math.min(boardSize, 5);
}

// ─── Win Lines ─────────────────────────────────────────────────────────────────
// Generates every possible winning sequence of `winSize` cells
export function generateWinLines(boardSize) {
    const w = getWinSize(boardSize);
    const s = boardSize;
    const lines = [];

    for (let r = 0; r < s; r++)
        for (let c = 0; c <= s - w; c++)
            lines.push(Array.from({ length: w }, (_, i) => r * s + c + i));       // row

    for (let c = 0; c < s; c++)
        for (let r = 0; r <= s - w; r++)
            lines.push(Array.from({ length: w }, (_, i) => (r + i) * s + c));     // col

    for (let r = 0; r <= s - w; r++)
        for (let c = 0; c <= s - w; c++)
            lines.push(Array.from({ length: w }, (_, i) => (r + i) * s + c + i)); // ↘

    for (let r = 0; r <= s - w; r++)
        for (let c = w - 1; c < s; c++)
            lines.push(Array.from({ length: w }, (_, i) => (r + i) * s + c - i)); // ↙

    return lines;
}

// ─── Check Winner ──────────────────────────────────────────────────────────────
// Returns { winner, line } or null
export function checkWinner(board, winLines) {
    for (const line of winLines) {
        const first = board[line[0]];
        if (first && line.every(idx => board[idx] === first))
            return { winner: first, line };
    }
    return null;
}

// ─── Check Draw ────────────────────────────────────────────────────────────────
export function isDraw(board, winLines) {
    return !board.includes(null) && !checkWinner(board, winLines);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
export function getEmptyCells(board) {
    return board.reduce((acc, cell, i) => { if (!cell) acc.push(i); return acc; }, []);
}

export function makeMove(board, idx, player) {
    const b = [...board];
    b[idx] = player;
    return b;
}

export function opponent(player) {
    return player === X ? O : X;
}