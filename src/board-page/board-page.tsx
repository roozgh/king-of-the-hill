import { useState, useCallback, useEffect, memo, useRef } from "react";
import { useWindowEvent, delay, getWindowInnerWidth } from "../utils/utils";
import BoardView from "../components/board-view/board-view";
import BoardInfo from "./board-info/board-info";
import { getMoveCandidates } from "../board-logic/ai/move-finder";
import { Board } from "../board-logic/board/board";
import { JSONBoardState } from "../board-logic/board/board-state";
import { EvaluatorPlugin } from "../board-logic/ai/score-evaluator";
import MoveSound from "./assets/move.mp3";
import githubSvg from "./assets/github.svg";

const BoardMemo = memo(BoardView);

const boardMaxWidth = 850;

const moveSound = new Audio(MoveSound);
moveSound.volume = 0.3;

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
  {
    lastMove: null,
    pieces: [
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
  },
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
  const [selectTile, setSelectTile] = useState<null | string>(null);
  const moveToPlayTimeoutId = useRef(0);
  const [playable, updatePlayable] = useState(true);
  // 'token' is a random arbitrary number.
  // It's used to force react to re-render board-view after board.move() or board.reset()
  // I initially tried to listern to board.state.turn changes inside board-view but
  // that didn't always trigger a re-render. Weird React bug :/
  const [token, setToken] = useState(Math.random());

  /**
   *
   */
  const adjustBoardSize = useCallback(() => {
    // 'window.innerWidth' is not reliable
    const windowInnerWidth = getWindowInnerWidth();
    // Don't go bigger than max width
    let newBoardWidth = Math.min(windowInnerWidth, boardMaxWidth);
    let screenSize: "sm" | "lg" = "sm";
    let boardInfoSize = { w: newBoardWidth, h: 140 };

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
   *
   */
  const simulateComputerPlay = useCallback(async () => {
    // Disable board interaction if it's computer's turn
    updatePlayable(false);
    const seed = board.state.seed;

    await delay(500);

    const moveCandidate = getMoveCandidates(board, scoreEvalPlugins);
    if (moveCandidate === null) {
      return console.error("No move candidates found");
    }
    const [moveFrom, moveTo] = moveCandidate;

    setSelectTile(moveFrom);
    await delay(1500);

    // Make sure there's no turn mis-match.
    // e.g User pressing the 'Restart' button
    // while move animation is hapening
    if (board.state.seed !== seed) return;

    board.move(moveFrom, moveTo);
    setToken(Math.random());
    moveSound.play();
    setSelectTile(null);
    updatePlayable(true);
  }, []);

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
      setToken(Math.random());
      if (board.state.turn !== 1) moveSound.play();

      // Can't move or click pieces if game over
      if (board.state.status !== "ACTIVE") {
        return updatePlayable(false);
      }

      if (gameMode === "AGAINST_HUMAN") return;
      if (board.state.player === "WHITE") return;
      // If game not over and it's Black's turn
      // and game mode is Against CPU, play CPU's turn
      simulateComputerPlay();
    },
    [gameMode, simulateComputerPlay]
  );

  /**
   *
   */
  function onRestart() {
    if (board.state.turn === 1) return;
    board.state.reset();
    setToken(Math.random());
    setSelectTile(null);
    updatePlayable(true);
    // Clear move simulation timeout if it exists
    if (moveToPlayTimeoutId.current) {
      clearTimeout(moveToPlayTimeoutId.current);
    }
  }

  return (
    <div>
      <div className="koth-page-header">
        <div className="koth-logo"></div>
        <a
          href="https://github.com/roozgh/king-of-the-hill"
          style={{ float: "right", marginRight: "25px" }}
        >
          <img src={githubSvg} alt="See How It's Made" title="See How It's Made" width="30" />
        </a>
      </div>
      <div className="koth-page">
        <div
          className={`koth-board-wrapper ${screenSize}  ${
            board.state.player === "WHITE" ? "white-turn" : "black-turn"
          }`}
        >
          <div className="koth-board">
            <BoardMemo
              board={board}
              token={token}
              gameMode={gameMode}
              playable={playable}
              boardMaxWidth={boardWidth}
              selectTile={selectTile}
              onPieceMove={onPieceMove}
            />
          </div>
          <BoardInfo
            board={board}
            restart={onRestart}
            height={boardInfoSize.h}
            width={boardInfoSize.w}
            screenSize={screenSize}
          />
        </div>
      </div>
    </div>
  );
}
