import { checkWinner, isDraw, getEmptyCells, makeMove, opponent } from './game.js';

// ─── Minimax with Alpha-Beta Pruning ──────────────────────────────────────────
// Only used for 3×3 (guarantees unbeatable play)
function minimax(board, winLines, player, cpuPlayer, alpha, beta, depth) {
    const result = checkWinner(board, winLines);
    if (result) return result.winner === cpuPlayer ? 10 - depth : depth - 10;
    if (isDraw(board, winLines)) return 0;

    const empty = getEmptyCells(board);
    const isMax = player === cpuPlayer;
    let best = isMax ? -Infinity : Infinity;

    for (const idx of empty) {
        const score = minimax(
            makeMove(board, idx, player),
            winLines,
            opponent(player),
            cpuPlayer,
            alpha, beta,
            depth + 1
        );
        if (isMax) { best = Math.max(best, score); alpha = Math.max(alpha, best); }
        else { best = Math.min(best, score); beta = Math.min(beta, best); }
        if (beta <= alpha) break;
    }
    return best;
}

function getBestMinimax(board, winLines, cpuPlayer, humanPlayer) {
    const empty = getEmptyCells(board);
    let bestScore = -Infinity;
    let bestMove = empty[0];

    for (const idx of empty) {
        const score = minimax(
            makeMove(board, idx, cpuPlayer),
            winLines, humanPlayer, cpuPlayer,
            -Infinity, Infinity, 0
        );
        if (score > bestScore) { bestScore = score; bestMove = idx; }
    }
    return bestMove;
}

// ─── Heuristic Move (for boards > 3×3) ────────────────────────────────────────
function getHeuristicMove(board, winLines, cpuPlayer, humanPlayer) {
    const empty = getEmptyCells(board);
    const size = Math.sqrt(board.length);

    // 1. Win immediately
    for (const idx of empty) {
        if (checkWinner(makeMove(board, idx, cpuPlayer), winLines)) return idx;
    }

    // 2. Block opponent's immediate win
    for (const idx of empty) {
        if (checkWinner(makeMove(board, idx, humanPlayer), winLines)) return idx;
    }

    // 3. Center
    const center = Math.floor(board.length / 2);
    if (board[center] === null) return center;

    // 4. Random corner
    const corners = [0, size - 1, (size - 1) * size, board.length - 1];
    const emptyCorners = corners.filter(c => board[c] === null);
    if (emptyCorners.length)
        return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];

    // 5. Any empty cell
    return empty[Math.floor(Math.random() * empty.length)];
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function getCPUMove(board, winLines, cpuPlayer, humanPlayer, difficulty, boardSize) {
    const empty = getEmptyCells(board);
    if (!empty.length) return null;

    if (difficulty === 'easy') {
        return empty[Math.floor(Math.random() * empty.length)];
    }

    // Minimax is practical only for 3×3 (perfect play, ~9! states with pruning)
    if (boardSize <= 3) {
        return getBestMinimax(board, winLines, cpuPlayer, humanPlayer);
    }

    return getHeuristicMove(board, winLines, cpuPlayer, humanPlayer);
}