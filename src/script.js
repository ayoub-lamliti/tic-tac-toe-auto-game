let row = 3;
const factor = 2;
const node = "<div class='square'></div>";
let square = null;
let player_start_choice = null;
let playerCPU = null;
let centerBoard = null;
let board = [];
let possibilitiesBoardArray = [];
let possibilitiesBoard = board;
let fourPoints = [];
let rows = [];
let columns = [];
let countRow = [];
let center = [];
let centerReverse = [];

const x = "x",
    o = "o";

let init = {
    winner: { [x]: 0, [o]: 0 },
    pointXO: { [x]: [], [o]: [] },
    pointPossibilitiesCpu: { [x]: [], [o]: [] },
    possibilityThreePointEmpty: { possibility: [] },
    possibilitiesThreePointNotEmpty: [],
    start: true,
    player_now: player_start_choice,
    gameOver: false,
    playCpu: false,
    playNotEasy: false,
};

const incrementButton = document.querySelector("#increment");
const decrementButton = document.querySelector("#decrement");
const quantityInput = document.querySelector("#quantity");

incrementButton.addEventListener("click", () => {
    if (parseInt(quantityInput.value) < 15) {
        quantityInput.value = parseInt(quantityInput.value) + 2;
        row = parseInt(quantityInput.value);
    }
});
decrementButton.addEventListener("click", () => {
    if (parseInt(quantityInput.value) > 3) {
        quantityInput.value = parseInt(quantityInput.value) - 2;
        row = parseInt(quantityInput.value);
    }
});

document.getElementById("button").addEventListener("click", () => {
    const player = document.querySelector('input[name="player"]:checked').value;
    player === x
        ? ((player_start_choice = x), turn(x))
        : ((player_start_choice = o), turn(o));
    playerCPU = player_start_choice === x ? o : x;
    document.querySelector("#header-and-board-wrapper").classList.add("d-block");
    document.querySelector(".container").classList.add("d-none");
    render();
});

document.getElementById("checkAuto").addEventListener("change", (e) => {
    init.playCpu = e.target.checked;
    if (init.playCpu) {
        document.querySelector(".checkHardOrEasy").classList.add("d-block-force");
    } else
        document
            .querySelector(".checkHardOrEasy")
            .classList.remove("d-block-force");
});
document.getElementById("checkHardOrEasy").addEventListener("change", (e) => {
    init.playNotEasy = e.target.checked;
});

const render = () => {
    let nodeSquares = '';
    const countSquares = row * row;
    for (let i = 0; i < countSquares; i++) {
        nodeSquares += node;
    }
    document.querySelector(
        ".grid-container"
    ).style = `grid-template-columns: ${row}fr repeat(${row - 1}, auto);`;
    document.querySelector(".grid-container").innerHTML = nodeSquares;

    if (row > 3) {
        document
            .querySelectorAll(".square")
            .forEach((item) => item.classList.add("square-countBig"));
    }
    square = document.querySelectorAll(".square");

    possibilitiesBoardArray = Array.from(
        { length: countSquares },
        (_, index) => index
    );

    columns = Array.from({ length: row }, (_, index) => []);
    countRow = row;

    possibilitiesBoardArray.forEach((_) => {
        let oldCount = countRow - row;
        if (possibilitiesBoardArray.slice(oldCount, countRow).length) {
            rows.push(possibilitiesBoardArray.slice(oldCount, countRow));
        }
        countRow += row;
    });

    rows.forEach((row) => {
        let count = 0;
        row.forEach((i) => {
            columns[count].push(i);
            count = count + 1;
        });
    });

    let count = 0;
    rows.forEach((row) => {
        center.push(row[count]);
        count = count + 1;
    });

    count = row - 1;
    rows.forEach((row) => {
        centerReverse.push(row[count]);
        count = count - 1;
    });

    centerBoard = center.filter((item) => centerReverse.includes(item))[0];
    board.push(...rows, ...columns, center, centerReverse);
    possibilitiesBoard = board;
    fourPoints = [
        center.shift(),
        centerReverse.shift(),
        centerReverse.pop(),
        center.pop(),
    ];

    square.forEach((element, index) => {
        element.setAttribute("cell", index);
        element.addEventListener("click", (e) => {
            if (element.getAttribute("player")) return;
            checkPlyer(index);
            if (init.playCpu) {
                !init.gameOver && playCPU();
            }
            showPointWinnerPlayers();
        });
    });
};

const changeStartGame = () => {
    const playerNext = player_start_choice === x ? o : x;
    const type = init.start ? player_start_choice : playerNext;
    init.start = !init.start;
    return type;
};

const checkGame = (drew = false) => {
    possibilitiesBoard.forEach((row) => {
        if (row.every((cell) => checkWinner(cell, x))) {
            afterCheckWinner(row, x);
            init.winner = { ...init.winner, [x]: init.winner.x + 1 };
        }
        if (row.every((cell) => checkWinner(cell, o))) {
            afterCheckWinner(row, o);
            init.winner = { ...init.winner, [o]: init.winner.o + 1 };
        }
        if (drew) {
            afterCheckWinner([], "we drew");
        }
    });
};

const afterCheckWinner = (row, message) => {
    if (row.length) {
        player_start_choice === message
            ? (message = "winner")
            : (message = "loser");
        changeColor(row, message);
        message = "You " + message;
    }
    alertCustom(message);
    removeEvent();
    init.gameOver = true;
};

const showPointWinnerPlayers = () => {
    document.getElementById("countWinnerX").textContent = init.winner.x;
    document.getElementById("countWinnerO").textContent = init.winner.o;
};

const alertCustom = (message) => {
    alertify.confirm(
        "Winner !!",
        message,
        (_) => reset(),
        (_) => reset()
    );
};

const changeColor = (cell, color) => {
    cell.forEach((element) => {
        square[element].classList.add(color);
    });
};

const removeEvent = () => {
    square.forEach((item) => {
        item.removeEventListener("click", (_) => { });
    });
};

const checkWinner = (cell, player) => {
    return square[cell].getAttribute("player") === player;
};

const checkPlyer = (value) => {
    const player = changeStartGame();
    init.player_now = player;
    savePointXO(player, value);
    player === x
        ? (square[value].classList.add(x), turn(o))
        : (square[value].classList.add(o), turn(x));
    square[value].setAttribute("player", player);
    square[value].innerText = player;
    square[value].classList.add("active");
    checkGame();
};

const turn = (player) => {
    document.getElementById("turn").textContent = player.toUpperCase();
};

const savePointXO = (player, point) => {
    player === x ? init.pointXO[x].push(point) : init.pointXO[o].push(point);
    getPossibilitiesPointCpu(player);
    possibilityThreePointEmptyAfterStartGame();
};

const possibilityThreePointEmptyAfterStartGame = () => {
    const possibility = possibilitiesBoard.filter((possibility) =>
        possibility.every(
            (item) =>
                init.pointXO[x].every((i) => i !== item) &&
                init.pointXO[o].every((i) => i !== item)
        )
    );
    init.possibilityThreePointEmpty = {
        ...init.possibilityThreePointEmpty,
        possibility: possibility,
    };
};

const getPossibilitiesPointCpu = (player) => {
    init.pointPossibilitiesCpu = {
        ...init.pointPossibilitiesCpu,
        [player]: getPossibilitiesCpu(init.pointXO[player]),
    };
};

const getPossibilitiesCpu = (points) => {
    if (points.length > 1) {
        const max = row - 1,
            min = 1;
        let obj = {};
        possibilitiesBoard.map((cell, i) => {
            obj = { ...obj, [i]: [] };
            cell.some((item) => {
                points.includes(item) && obj[i].push(item);
            });
        });
        return Object.values(obj).filter(
            (item) => item.length > min && item.length <= max
        );
    }
    return [points];
};

const getThreePointNotEmpty = () => {
    return {
        [x]: getResThreePointNotEmpty(x, o), // x
        [o]: getResThreePointNotEmpty(o, x), // o
    };
};

const getResThreePointNotEmpty = (player_1, player_2) => {
    return possibilitiesBoard
        .filter((possibility) =>
            init.pointPossibilitiesCpu[player_1].some((item) =>
                item.every((subItem) => possibility.includes(subItem))
            )
        )
        .filter((item) =>
            init.pointXO[player_2].every((subItem) => !item.includes(subItem))
        );
};

const getPossibilitiesThreePointNotEmpty = () => {
    init.possibilitiesThreePointNotEmpty = possibilitiesBoard.filter((item) =>
        init.possibilityThreePointEmpty.possibility.every(
            (i) => !item.every((subItem) => i.includes(subItem))
        )
    );
};

const playCPU = () => {
    getPossibilitiesThreePointNotEmpty();
    playerNextIfStartPlay();
    helperPlayCPU();
};

const helperPlayCPU = () => {
    const isPossibilityWinner = getThreePointNotEmpty();
    const player_start = pointWinner(isPossibilityWinner, player_start_choice);
    const player_next = pointWinner(isPossibilityWinner, playerCPU);

    if (init.pointXO[init.player_now].length > 1) {
        if (init.player_now !== playerCPU) {
            if (player_start.possibilitiesWinner) {
                if (player_start.point[0].difference.length > 1) {
                    if (player_next.possibilitiesWinner) {
                        checkPlyer(player_next.point[0].difference[0]);
                    } else {
                        getPointIfAllPossibilitiesPlayerNull();
                    }
                } else {
                    checkPlyer(player_start.point[0].difference[0]);
                }
            } else if (player_next.possibilitiesWinner) {
                checkPlyer(player_next.point[0].difference[0]);
            } else {
                getPointIfAllPossibilitiesPlayerNull();
            }
        }
    }
};

const getPointIfAllPossibilitiesPlayerNull = () => {
    const point = randomIndexEmptyPoint();
    if (point !== undefined) {
        checkPlyer(point);
    } else {
        checkGame(true);
    }
};

const pointWinner = (PossibilityWinner, player) => {
    let point = { [player]: [] };
    PossibilityWinner[player].forEach((item) => {
        init.pointPossibilitiesCpu[player].some(
            (i) =>
                i.every((subItem) => item.includes(subItem)) &&
                point[player].push({
                    i,
                    item,
                    difference: item.filter((item) => !i.includes(item)),
                })
        );
    });
    return {
        player: [player][0],
        possibilitiesWinner: point[player].length,
        point: point[player],
    };
};

const playerNextIfStartPlay = () => {
    if (init.pointXO[init.player_now].length === 1) {
        let randomNumber;
        if (init.pointXO[init.player_now][0] !== centerBoard) {
            randomNumber = centerBoard;
        } else {
            randomNumber = randomIndex();
        }
        checkPlyer(randomNumber);
    }
};

const randomIndex = () => {
    let numbers = null;
    if (init.playNotEasy) {
        numbers = fourPoints;
    } else {
        numbers = possibilitiesBoardArray.filter(
            (item) => init.pointXO[init.player_now][0] !== item
        );
    }
    const randomIndex = Math.floor(Math.random() * numbers.length);
    return numbers[randomIndex];
};

const randomIndexEmptyPoint = () => {
    const numbers = possibilitiesBoardArray.filter(
        (item) =>
            init.pointXO[x].every((i) => i !== item) &&
            init.pointXO[o].every((i) => i !== item)
    );
    const randomIndex = Math.floor(Math.random() * numbers.length);
    return numbers[randomIndex];
};

const reset = () => {
    square.forEach((element) => {
        element.innerText = "";
        element.removeAttribute("player");
        element.classList.remove("winner", "loser", "active", "x", "o");
    });
    turn(player_start_choice);
    init = {
        ...init,
        pointXO: { [x]: [], [o]: [] },
        pointPossibilitiesCpu: { [x]: [], [o]: [] },
        possibilityThreePointEmpty: { possibility: [] },
        possibilitiesThreePointNotEmpty: [],
        start: true,
        player_now: player_start_choice,
        gameOver: false,
    };
};

const resetAll = () => {
    reset();
    init.winner = { [x]: 0, [o]: 0 };
    showPointWinnerPlayers();
};

const exitGame = () => {
    resetAll();
    document
        .querySelector("#header-and-board-wrapper")
        .classList.remove("d-block");
    document.querySelector(".container").classList.remove("d-none");
    playerCPU = null;
    player_start_choice = null;
    if (document.querySelector("#checkAuto").checked) {
        document.querySelector("#checkAuto").click();
    }
    if (document.querySelector("#checkHardOrEasy").checked) {
        document.querySelector("#checkHardOrEasy").click();
    }
    quantityInput.value = 3;
    row = 3;
    square = null;
    player_start_choice = null;
    playerCPU = null;
    centerBoard = null;
    board = [];
    possibilitiesBoardArray = [];
    possibilitiesBoard = board;
    fourPoints = [];
    rows = [];
    columns = [];
    countRow = [];
    center = [];
    centerReverse = [];
};

document.querySelector('.btn-resetAll').addEventListener('click', () => resetAll())
document.querySelector('.btn-exitGame').addEventListener('click', () => exitGame())