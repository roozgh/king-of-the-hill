import { useState, useCallback, useEffect, memo, useRef } from "react";
import { useWindowEvent } from "./utils";
import BoardView from "./board-views/board-view";
import { getMoveCandidates } from "./board-logic/ai/move-finder";
import { Board, SetBoardState } from "./board-logic/board/board";
import { EvaluatorPlugin } from "./board-logic/ai/score-evaluator";

const BoardMemo = memo(BoardView);

const boardMaxWidth = 750;

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

const defaultBoardState: SetBoardState = {
  turn: 1,
  state: {
    D1: ["KING", "WHITE"],
    A1: ["CHARIOT", "WHITE"],
    B1: ["ARCHER", "WHITE"],
    F1: ["ARCHER", "WHITE"],
    B2: ["SPY", "WHITE"],
    D2: ["MAGICIAN", "WHITE"],
    F2: ["TOWER", "WHITE"],
    G1: ["CHARIOT", "WHITE"],

    D7: ["KING", "BLACK"],
    A7: ["CHARIOT", "BLACK"],
    B7: ["ARCHER", "BLACK"],
    F7: ["ARCHER", "BLACK"],
    B6: ["SPY", "BLACK"],
    F6: ["TOWER", "BLACK"],
    D6: ["MAGICIAN", "BLACK"],
    G7: ["CHARIOT", "BLACK"],
  },
};

const board = new Board({ x: 7, y: 7, hills: ["D4"] });
board.setState(defaultBoardState);

/**
 *
 */
export default function BoardPage() {
  console.log("RENDER BoardPage");
  const [boardWidth, updateBoardWidth] = useState(boardMaxWidth);
  const [gameMode] = useState("AGAINST_CPU");
  const [moveToPlay, setMoveToPlay] = useState<null | [string, string]>(null);
  const [playable, updatePlayable] = useState(true);
  // Why have a seperate 'turn' variable when board.state.turn exists?
  // To force react to re-render board-view after board.move()
  const [turn, setTurn] = useState(1);

  /**
   * On Window resize
   */
  useWindowEvent("resize", () => {
    let newWidth = boardMaxWidth;
    if (window.innerWidth < boardMaxWidth) {
      newWidth = window.innerWidth;
    } else {
      Math.min(window.innerWidth, boardMaxWidth);
    }
    updateBoardWidth(newWidth);
  });

  /**
   * Called when player makes a new move
   */
  const onPieceMove = useCallback(
    (from: string, to: string) => {
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
        setTimeout(() => {
          const moveCandidate = getMoveCandidates(board, scoreEvalPlugins);
          if (moveCandidate === null) {
            return console.error("No move candidates found");
          }
          setMoveToPlay(moveCandidate);
        }, 200);
      }
    },
    [gameMode]
  );

  return (
    <div className="koth-page">
      <div className="koth-board-con">
        <div className="koth-board-header">
          Turn: {board.state.turn} / {board.state.totalTurns}
        </div>
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
    </div>
  );
}
