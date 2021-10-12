import { useState, useCallback, useEffect, memo, useRef } from "react";
import { useWindowEvent } from "../utils";
import BoardView from "./board-view";
import BoardInfo from "./board-info";
import { getMoveCandidates } from "../board-logic/ai/move-finder";
import { Board } from "../board-logic/board/board";
import { JSONBoardState } from "../board-logic/board/board-state";
import { EvaluatorPlugin } from "../board-logic/ai/score-evaluator";

const BoardMemo = memo(BoardView);

const boardMaxWidth = 900;

const archerOnDarkDarkTiles: EvaluatorPlugin = (tile, piece) => {
  if (piece.name === "ARCHER" && tile.colour === "DARK") return 10;
  return 0;
};

const kingOutOfPosition: EvaluatorPlugin = (tile, piece) => {
  if (piece.name === "KING") {
    // If Red King is on First Rank
    if (piece.colour === "BLACK" && tile.y === 6) {
      return -25;
    }
    // If Blue King is on Last Rank
    else if (piece.colour === "WHITE" && tile.y === 0) {
      return -25;
    }
  }
  return 0;
};

const scoreEvalPlugins = [archerOnDarkDarkTiles, kingOutOfPosition];

const defaultBoardState: JSONBoardState = [
  [
    ["D1", "WHITE", "KING"],
    ["A1", "WHITE", "CHARIOT"],
    ["B1", "WHITE", "ARCHER"],
    ["F1", "WHITE", "ARCHER"],
    ["B2", "WHITE", "SPY"],
    ["D2", "WHITE", "MAGICIAN"],
    ["F2", "WHITE", "TOWER"],
    ["G1", "WHITE", "CHARIOT"],

    ["D7", "BLACK", "KING"],
    ["A7", "BLACK", "CHARIOT"],
    ["B7", "BLACK", "ARCHER"],
    ["F7", "BLACK", "ARCHER"],
    ["B6", "BLACK", "SPY"],
    ["D6", "BLACK", "MAGICIAN"],
    ["F6", "BLACK", "TOWER"],
    ["G7", "BLACK", "CHARIOT"],
  ],
];

const board = new Board({ x: 7, y: 7, hills: ["D4"] });
board.state.setStateFromJSON(defaultBoardState);

/**
 *
 */
export default function BoardPage() {
  const [screenSize, updateScreenSize] = useState<"sm" | "lg">("sm");
  const [boardWidth, updateBoardWidth] = useState(0);
  const [boardInfoSize, updateBoardInfoSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [gameMode] = useState("AGAINST_CPU");
  const [moveToPlay, setMoveToPlay] = useState<null | [string, string]>(null);
  const moveToPlayTimeoutId = useRef(0);
  const [playable, updatePlayable] = useState(true);
  // Why have a seperate 'turn' variable when board.state.turn exists?
  // To force react to re-render board-view after board.move()
  const [turn, setTurn] = useState(1);

  /**
   *
   */
  const adjustBoardSize = useCallback(() => {
    // Don't go bigger than max width
    let newBoardWidth = Math.min(window.innerWidth, boardMaxWidth);
    let screenSize: "sm" | "lg" = "sm";
    let boardInfoSize = { w: newBoardWidth, h: 200 };

    if (newBoardWidth > 660) {
      screenSize = "lg";
      newBoardWidth -= 160;
      boardInfoSize = { w: 120, h: newBoardWidth + 20 };
    }
    updateScreenSize(screenSize);
    updateBoardWidth(newBoardWidth);
    updateBoardInfoSize(boardInfoSize);
  }, []);

  // On initial render
  useEffect(adjustBoardSize, [adjustBoardSize]);
  // On Window resize
  useWindowEvent("resize", adjustBoardSize);

  /**
   * Called when player makes a new move
   */
  const onPieceMove = useCallback(
    (from: string, to: string) => {
      if (!board.isValidMove(from, to)) {
        console.error(`Invalid move: [${from}, ${to}]`);
        return;
      }
      board.move(from, to);
      setTurn(board.state.turn);
      if (board.state.status !== "ACTIVE") return;
      if (gameMode === "AGAINST_HUMAN") return;
      if (board.state.player === "WHITE") {
        // Disable board interaction if it's computer's turn
        updatePlayable(true);
      } else {
        updatePlayable(false);
        // Simulate computer play
        moveToPlayTimeoutId.current = window.setTimeout(() => {
          if (!board) return;
          const moveCandidate = getMoveCandidates(board, scoreEvalPlugins);
          if (moveCandidate === null) {
            return console.error("No move candidates found");
          }
          setMoveToPlay(moveCandidate);
          moveToPlayTimeoutId.current = 0;
        }, 500);
      }
    },
    [gameMode]
  );

  /**
   *
   */
  function onRestart() {
    if (board.state.turn > 1) {
      // Clear move simulation timeout if it exists
      if (moveToPlayTimeoutId.current) {
        clearTimeout(moveToPlayTimeoutId.current);
      }
      board.state.reset();
      setTurn(1);
      updatePlayable(true);
    }
  }

  return (
    <div className="koth-page">
      <div className={`koth-board-wrapper ${screenSize}`}>
        <div className={`koth-board ${board.state.player === "WHITE" ? "blue-turn" : "red-turn"}`}>
          <BoardMemo
            board={board}
            turn={turn}
            gameMode={gameMode}
            playable={playable}
            boardMaxWidth={boardWidth}
            simulateMove={moveToPlay}
            onPieceMove={onPieceMove}
          />
        </div>
        <BoardInfo
          board={board}
          restart={onRestart}
          height={boardInfoSize.h}
          width={boardInfoSize.w}
        />
      </div>
    </div>
  );
}
