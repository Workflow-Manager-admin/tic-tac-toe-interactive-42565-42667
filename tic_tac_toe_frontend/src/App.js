import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Top navigation bar component.
 * Displays the game title and navigation actions.
 */
function NavBar({ onReset, mode, setMode }) {
  return (
    <nav className="navbar">
      <div className="navbar-title">Tic Tac Toe</div>
      <div className="navbar-actions">
        <select
          value={mode}
          className="nav-select"
          onChange={e => setMode(e.target.value)}
          aria-label="Choose game mode"
        >
          <option value="2p">2 Players</option>
          <option value="cpu">Vs Computer</option>
        </select>
        <button className="nav-btn" onClick={onReset} aria-label="Reset game">
          Reset
        </button>
      </div>
    </nav>
  );
}

/**
 * Status display - shows game status and which player's turn
 */
function StatusBar({ winner, draw, current, mode }) {
  let text;
  if (winner) {
    text =
      mode === "cpu" && winner === "O"
        ? "Computer Wins! 😎"
        : `${winner === "X" ? "Player 1" : "Player 2"} Wins! 🎉`;
  } else if (draw) {
    text = "It's a Draw. 🤝";
  } else {
    if (mode === "cpu" && current === "O") {
      text = "Computer's Turn";
    } else {
      text =
        (mode === "cpu" && current === "X"
          ? "Your Turn"
          : `${current === "X" ? "Player 1" : "Player 2"}'s Turn`) +
        (current === "X" ? " (X)" : " (O)");
    }
  }
  return <div className="status-bar">{text}</div>;
}

/**
 * Individual Tic Tac Toe square.
 */
function Square({ value, onClick, highlight, disabled }) {
  return (
    <button
      className={"square" + (highlight ? " highlight" : "")}
      onClick={onClick}
      disabled={disabled}
      aria-label={value ? `Cell ${value}` : "Empty cell"}
    >
      {value}
    </button>
  );
}

const BOARD_SIZE = 3;
const EMPTY_BOARD = Array(BOARD_SIZE * BOARD_SIZE).fill(null);

/**
 * Checks board for a winner.
 * Returns [winner, winningLineIndexes] or [null, []]
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return [squares[a], line];
    }
  }
  return [null, []];
}

/**
 * Checks if board has any more moves
 */
function isDraw(squares) {
  return squares.every(x => x !== null);
}

/**
 * PUBLIC_INTERFACE
 * Main App for Tic Tac Toe game.
 */
function App() {
  // mode: "2p" or "cpu"
  const [mode, setMode] = useState("2p");
  // Array(9) for 3x3 board. "X", "O" or null
  const [board, setBoard] = useState(EMPTY_BOARD);
  // "X" = Player 1, "O" = Player 2
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null); // "X" | "O" | null
  const [winningLine, setWinningLine] = useState([]);
  const [draw, setDraw] = useState(false);

  /**
   * Reset game state
   * PUBLIC_INTERFACE
   */
  function resetGame() {
    setBoard(EMPTY_BOARD);
    setXIsNext(true);
    setWinner(null);
    setWinningLine([]);
    setDraw(false);
  }

  /**
   * Handles move for player or computer.
   */
  function handlePlay(index) {
    if (board[index] || winner || draw) return;
    const squares = board.slice();
    squares[index] = xIsNext ? "X" : "O";
    setBoard(squares);
    setXIsNext(!xIsNext);
  }

  /**
   * Detect win/draw after every move.
   */
  useEffect(() => {
    const [win, line] = calculateWinner(board);
    if (win) {
      setWinner(win);
      setWinningLine(line);
      setDraw(false);
    } else if (isDraw(board)) {
      setWinner(null);
      setDraw(true);
    } else {
      setWinner(null);
      setWinningLine([]);
      setDraw(false);
    }
  }, [board]);

  /**
   * Computer Move ("O") if in CPU mode and computer's turn
   */
  useEffect(() => {
    if (mode !== "cpu" || winner || draw) return;
    // CPU is always "O"
    if (!xIsNext) {
      // Simple AI: Try to win, else block, else random
      const bestMove = cpuMove(board, "O");
      if (bestMove !== null) {
        setTimeout(() => {
          handlePlay(bestMove);
        }, 400); // Delay for UX
      }
    }
    // eslint-disable-next-line
  }, [xIsNext, mode, winner, draw, board]);

  /**
   * On mode change, reset game.
   */
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line
  }, [mode]);

  /**
   * PUBLIC_INTERFACE
   * Simple computer AI: tries to win, block, else pick random empty
   */
  function cpuMove(squares, player) {
    const opponent = player === "X" ? "O" : "X";

    // Try to win
    for (let i = 0; i < 9; ++i) {
      if (!squares[i]) {
        let copy = squares.slice();
        copy[i] = player;
        if (calculateWinner(copy)[0] === player) return i;
      }
    }
    // Block opponent
    for (let i = 0; i < 9; ++i) {
      if (!squares[i]) {
        let copy = squares.slice();
        copy[i] = opponent;
        if (calculateWinner(copy)[0] === opponent) return i;
      }
    }
    // Pick center
    if (!squares[4]) return 4;
    // Pick random corner
    const corners = [0, 2, 6, 8].filter(i => !squares[i]);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    // Pick any empty
    const empties = squares.map((v, i) => (v ? null : i)).filter(x => x !== null);
    if (empties.length) return empties[Math.floor(Math.random() * empties.length)];
    return null;
  }

  /**
   * Board rendering
   */
  function renderBoard() {
    return (
      <div className="board" role="grid" aria-label="Tic Tac Toe board">
        {[...Array(BOARD_SIZE)].map((_, rowIdx) => (
          <div className="board-row" key={rowIdx} role="row">
            {[...Array(BOARD_SIZE)].map((_, colIdx) => {
              const idx = rowIdx * BOARD_SIZE + colIdx;
              return (
                <Square
                  key={idx}
                  value={board[idx]}
                  onClick={() => handlePlay(idx)}
                  highlight={winningLine.includes(idx)}
                  disabled={
                    !!board[idx] ||
                    !!winner ||
                    !!draw ||
                    (mode === "cpu" &&
                      !xIsNext) // prevent clicking during computer "thinking"
                  }
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="main-app light-theme">
      <NavBar onReset={resetGame} mode={mode} setMode={setMode} />
      <div className="game-container">
        <StatusBar
          winner={winner}
          draw={draw}
          current={xIsNext ? "X" : "O"}
          mode={mode}
        />
        {renderBoard()}
      </div>
      <footer className="footer-bar">
        <span>
          <a
            href="https://reactjs.org/"
            className="footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>{" "}
          Tic Tac Toe &mdash; Minimal Demo
        </span>
      </footer>
    </div>
  );
}

export default App;
