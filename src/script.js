let row = 3; // Number of rows and columns on the board

// Constants
const factor = 2,
    node = "<div class='square'></div>";
const x = "x",
    o = "o";

// Variables declaration
let square = null, // Stores all the squares of the grid
    player_start_choice = null, // Starting player
    playerCPU = null, // Computer player
    centerBoard = null, // Center of the board
    board = [], // Game board
    possibilitiesBoardArray = [], // Array of all possible plays
    possibilitiesBoard = board, // Possible plays on the board
    fourPoints = [], // Box edges
    rows = [], // Rows on the board
    columns = [], // Columns on the board
    countRow = 0, // Counter for rows
    squareIntersectionFirst = [], // The first intersection of the square
    squareIntersectionSecond = []; // Second intersection of the square

// Initialization object
let init = {
    winner: { [x]: 0, [o]: 0 }, // Count of wins for each player
    pointXO: { [x]: [], [o]: [] }, // Points chosen by each player
    pointPossibilitiesCpu: { [x]: [], [o]: [] }, // Possible plays by CPU
    possibilityThreePointEmpty: { possibility: [] }, // Possibilities with three empty points
    possibilitiesThreePointNotEmpty: [], // Possibilities with three points not empty
    start: true, // Starting state
    player_now: player_start_choice, // Current player
    gameOver: false, // Game over flag
    playCpu: false, // Flag to play against the CPU
    playNotEasy: false, // Flag to make CPU play not easy
};

// DOM elements
const incrementButton = document.querySelector("#increment"),
    decrementButton = document.querySelector("#decrement"),
    quantityInput = document.querySelector("#quantity");

// Event listeners for increment and decrement buttons
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

// Event listener for starting the game
document.getElementById("button").addEventListener("click", () => {
    const player = document.querySelector('input[name="player"]:checked').value;
    player_start_choice = player;
    playerCPU = player === x ? o : x;
    turn(player);
    document.querySelector("#header-and-board-wrapper").classList.add("d-block");
    document.querySelector(".container").classList.add("d-none");
    render();
});

// Event listener for enabling CPU play
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

// Event listeners for resetting and exiting the game
document
    .querySelector(".btn-resetAll")
    .addEventListener("click", () => resetAll());
document
    .querySelector(".btn-exitGame")
    .addEventListener("click", () => exitGame());

// Rendering the game board
const render = () => {
    let nodeSquares = "";

    // Calculate total squares
    const countSquares = row * row;

    for (let i = 0; i < countSquares; i++) {
        nodeSquares += node;
    }

    // Set up grid template
    document.querySelector(
        ".grid-container"
    ).style = `grid-template : repeat(${row}, 1fr) / repeat(${row}, 1fr);`;
    document.querySelector(".grid-container").innerHTML = nodeSquares;

    // If the row is greater than 3, apply a class
    if (row > 3) {
        document
            .querySelectorAll(".square")
            .forEach((item) => item.classList.add("square-countBig"));
    }
    square = document.querySelectorAll(".square");

    // Generate an array with all possible moves
    possibilitiesBoardArray = Array.from(
        { length: countSquares },
        (_, index) => index
    );

    countRow = row;
    // Divide the board into rows
    for (let i = 0; i < row; i++) {
        let oldCount = countRow - row;
        let slice = possibilitiesBoardArray.slice(oldCount, countRow)
        if (slice.length) {
            rows.push(slice);
            countRow += row;
        }
    }

    // Divide the board into columns
    for (let i = 0; i < row; i++) {
        columns.push(rows.map(row => row[i]));
    }

    // Define the first intersection of squares
    let count = 0;
    rows.forEach((row) => {
        squareIntersectionFirst.push(row[count]);
        count = count + 1;
    });

    // Define the second intersection of squares
    count = row - 1;
    rows.forEach((row) => {
        squareIntersectionSecond.push(row[count]);
        count = count - 1;
    });

    // Define the intersections
    const intersections = [squareIntersectionFirst, squareIntersectionSecond];
    board.push(...rows, ...columns, ...intersections);
    possibilitiesBoard = board;

    // Define the center of the board
    centerBoard = squareIntersectionFirst.filter((item) =>
        squareIntersectionSecond.includes(item)
    )[0];

    // Define the edges of the board
    fourPoints = [
        [...squareIntersectionFirst].shift(),
        [...squareIntersectionSecond].shift(),
        [...squareIntersectionSecond].pop(),
        [...squareIntersectionFirst].pop(),
    ];

    // Add click event listener to each square
    square.forEach((element, index) => {
        element.setAttribute("cell", index);
        element.addEventListener("click", (e) => {
            if (element.getAttribute("player")) return;
            place_play(index);
            if (init.playCpu) {
                !init.gameOver && playCPU();
            }
            showPointWinnerPlayers();
        });
    });
};

// Placing a play
const place_play = (value) => {
    const player = switch_player();
    init.player_now = player;
    savePointXO(player, value);
    player === x
        ? (square[value].classList.add(x), turn(o))
        : (square[value].classList.add(o), turn(x));
    square[value].setAttribute("player", player);
    square[value].innerText = player;
    square[value].classList.add("active");
    check_winner();
};

// Displaying the winner counts
const showPointWinnerPlayers = () => {
    document.getElementById("countWinnerX").textContent = init.winner.x;
    document.getElementById("countWinnerO").textContent = init.winner.o;
};

// Switching player
const switch_player = () => {
    const playerNext = player_start_choice === x ? o : x;
    const type = init.start ? player_start_choice : playerNext;
    init.start = !init.start;
    return type;
};

// Checking winner
const check_winner = (drew = false) => {
    possibilitiesBoard.forEach((row) => {
        if (row.every((cell) => getPointWinner(cell, x))) {
            afterCheckWinner(row, x);
            init.winner = { ...init.winner, [x]: init.winner.x + 1 };
        }
        if (row.every((cell) => getPointWinner(cell, o))) {
            afterCheckWinner(row, o);
            init.winner = { ...init.winner, [o]: init.winner.o + 1 };
        }
        if (drew) {
            afterCheckWinner([], "we drew");
        }
    });
};

// Actions after checking the winner
const afterCheckWinner = (row, message) => {
    if (row.length) {
        player_start_choice === message
            ? (message = "winner")
            : (message = "loser");
        changeColor(row, message);
        message = "You " + message;
    }
    alertCustom(message);
    init.gameOver = true;
};

// Custom alert message
const alertCustom = (message) => {
    alertify.confirm(
        "Winner !!",
        message,
        (_) => reset(),
        (_) => reset()
    );
};

// Changing color of the cells
const changeColor = (cell, color) => {
    cell.forEach((element) => {
        square[element].classList.add(color);
    });
};

// Checking if a point belongs to a player
const getPointWinner = (cell, player) => {
    return square[cell].getAttribute("player") === player;
};

// Changing the turn
const turn = (player) => {
    document.getElementById("turn").textContent = player.toUpperCase();
};

// Saving the point played by a player
const savePointXO = (player, point) => {
    player === x ? init.pointXO[x].push(point) : init.pointXO[o].push(point);
    getPossibilitiesPointPlayCpu(player);
    possibilityThreePointEmpty();
};

// Determining possibilities of three empty points
const possibilityThreePointEmpty = () => {
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

// Getting possibilities of a player to win
const getPossibilitiesPointPlayCpu = (player) => {
    const helper = (points) => {
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
    init.pointPossibilitiesCpu = {
        ...init.pointPossibilitiesCpu,
        [player]: helper(init.pointXO[player]),
    };
};

// Getting three points not empty
const getThreePointNotEmpty = () => {
    const helper = (player_one, player_two) => {
        return possibilitiesBoard
            .filter((possibility) =>
                init.pointPossibilitiesCpu[player_one].some((item) =>
                    item.every((subItem) => possibility.includes(subItem))
                )
            )
            .filter((item) =>
                init.pointXO[player_two].every((subItem) => !item.includes(subItem))
            );
    };
    return {
        [x]: helper(x, o), // x
        [o]: helper(o, x), // o
    };
};

// Getting possibilities of three points not empty
const getPossibilitiesThreePointNotEmpty = () => {
    init.possibilitiesThreePointNotEmpty = possibilitiesBoard.filter((item) =>
        init.possibilityThreePointEmpty.possibility.every(
            (i) => !item.every((subItem) => i.includes(subItem))
        )
    );
};

// CPU playing function
const playCPU = () => {
    getPossibilitiesThreePointNotEmpty();
    playPlayerNextIfStartPlayOneTime();
    helperPlayCPU();
};

// Helper function for CPU play
const helperPlayCPU = () => {
    const isPossibilityWinner = getThreePointNotEmpty();
    const player_start = locationPointPossibilityWinning(
        isPossibilityWinner,
        player_start_choice
    );
    const player_next = locationPointPossibilityWinning(
        isPossibilityWinner,
        playerCPU
    );
    if (init.pointXO[init.player_now].length <= 1 && init.player_now === playerCPU) {
        return;
    }

    const playNextDifference = () => place_play(player_next.point[0].difference.pop());
    const playStartDifference = () => place_play(player_start.point[0].difference.pop());

    if (player_start.possibilitiesWinner) {
        if (player_start.point[0].difference.length > 1) {
            if (player_next.possibilitiesWinner) {
                place_play(player_next.point[0].difference[0]);
            } else {
                playRandomIfAllPossibilitiesEqualNull();
            }
        } else {
            if (player_next.possibilitiesWinner && player_next.point[0].difference.length === 1) {
                playNextDifference();
            } else {
                playStartDifference();
            }
        }
    } else if (player_next.possibilitiesWinner) {
        playNextDifference();
    } else {
        playRandomIfAllPossibilitiesEqualNull();
    }

};

// Playing random if all possibilities are null
const playRandomIfAllPossibilitiesEqualNull = () => {
    const numbers = possibilitiesBoardArray.filter(
        (item) =>
            init.pointXO[x].every((i) => i !== item) &&
            init.pointXO[o].every((i) => i !== item)
    );
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const point = numbers[randomIndex];
    point !== undefined ? place_play(point) : check_winner(true);
};

// Location point possibility of winning
const locationPointPossibilityWinning = (PossibilityWinner, player) => {
    let point = { [player]: [] };
    PossibilityWinner[player].forEach((item) => {
        init.pointPossibilitiesCpu[player].some(
            (i) =>
                i.every((subItem) => item.includes(subItem)) &&
                point[player].push({
                    filled: i,
                    pointToBeWinner: item,
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

// Playing player next if start play one time
const playPlayerNextIfStartPlayOneTime = () => {
    if (init.pointXO[init.player_now].length === 1) {
        let randomNumber;
        if (init.pointXO[init.player_now][0] !== centerBoard) {
            randomNumber = centerBoard;
        } else {
            randomNumber = randomPointPlacePlay();
        }
        place_play(randomNumber);
    }
};

// Generating a random point for play
const randomPointPlacePlay = () => {
    const numbers = init.playNotEasy ? fourPoints : possibilitiesBoardArray.filter(
        (item) => init.pointXO[init.player_now][0] !== item
    );
    const randomIndex = Math.floor(Math.random() * numbers.length);
    return numbers[randomIndex];
};

// Resetting the game
const reset = () => {
    square.forEach((element) => {
        element.removeAttribute("player");
        element.classList.remove("winner", "loser", "active", "x", "o");
        element.innerText = "";
    });
    turn(player_start_choice);
    Object.assign(init, {
        pointXO: { [x]: [], [o]: [] },
        pointPossibilitiesCpu: { [x]: [], [o]: [] },
        possibilityThreePointEmpty: { possibility: [] },
        possibilitiesThreePointNotEmpty: [],
        start: true,
        player_now: player_start_choice,
        gameOver: false,
    });
};

// Resetting everything
const resetAll = () => {
    reset();
    init.winner = { [x]: 0, [o]: 0 };
    showPointWinnerPlayers();
};

// Exiting the game
const exitGame = () => {
    resetAll();
    document
        .querySelector("#header-and-board-wrapper")
        .classList.remove("d-block");
    document.querySelector(".container").classList.remove("d-none");
    playerCPU = null;
    player_start_choice = null;
    const checkAuto = document.querySelector("#checkAuto");
    const checkHardOrEasy = document.querySelector("#checkHardOrEasy");
    if (checkAuto.checked) checkAuto.click()
    if (checkHardOrEasy.checked) checkHardOrEasy.click()
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
    squareIntersectionFirst = [];
    squareIntersectionSecond = [];
};
