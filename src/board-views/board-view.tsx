import { useState, useEffect, useRef, createContext, useCallback } from "react";
import "../App.css";
import Tile from "./tile";
import { evaluatePosition, EvaluatorPlugin } from "../board-logic/ai/score-evaluator";
import { getMoveCandidates } from "../board-logic/ai/move-finder";
import { Board } from "../board-logic/board/board";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  init,
  reset,
  pieceSelect,
  pieceMove,
  noPieceSelected,
  undoMove,
  windowResize,
} from "./board-view-slice";

const moveSound = new Audio("../move.mp3");
moveSound.volume = 0.3;

/**
 *
 */
const archerOnDarkDarkTiles: EvaluatorPlugin = (tile, piece) => {
  if (piece.name === "ARCHER" && tile.colour === "DARK") return 10;
  return 0;
};

/**
 *
 */
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

interface BoardViewContext {
  playerTurn: string;
  draging: boolean;
  status: string;
  gameMode: string;
  humanPlayer: string;
}

export const BoardViewContext = createContext<BoardViewContext>({
  playerTurn: "WHITE",
  draging: false,
  status: "ACTIVE",
  gameMode: "AGAINST_CPU",
  humanPlayer: "WHITE",
});

/**
 *
 */
export const useWindowEvent = (event: any, callback: any) => {
  useEffect(() => {
    window.addEventListener(event, callback);
    return () => window.removeEventListener(event, callback);
  }, [event, callback]);
};

/**
 *
 */
export default function BoardView() {
  console.log("RENDER");
  const state = useAppSelector((state) => state.boardView);
  const dispatch = useAppDispatch();
  // When board is animating CPU move
  const isBusy = useRef(false);
  const cpuTurnFlag = useRef(false);
  const { status, selectedTile, gameMode, boardConfig, boardState } = state;
  const [draging, updateDragging] = useState(false);

  useEffect(() => {
    if (cpuTurnFlag.current) {
      cpuTurnFlag.current = false;
      if (state.status === "ACTIVE") simulateComputerPlay();
    }
  }, [cpuTurnFlag.current, state.status, simulateComputerPlay]);

  /**
   * Initialise Board
   */
  useEffect(() => {
    let windowWidth = window.innerWidth;
    let initPayload = { x: 7, y: 7, hills: ["D4"], windowWidth };
    dispatch(init(initPayload));
  }, [dispatch]);

  useWindowEvent("resize", () => {
    dispatch(windowResize(window.innerWidth));
  });

  /**
   * For detecting mpose click and mouse ups outside Board
   */
  const onWindowMouseUp = useCallback(() => {
    console.log("Window Mouse Up");
    if (selectedTile) {
      if (draging) updateDragging(false);
      dispatch(noPieceSelected());
    }
  }, [dispatch, selectedTile, draging]);

  useWindowEvent("mouseup", onWindowMouseUp);

  /**
   *
   */
  function onPieceMove(toTile: string) {
    if (isBusy.current) return;
    if (selectedTile) {
      let board = new Board(boardConfig);
      board.setState(boardState);
      // Check if valid move
      if (board.moveAllowed(selectedTile, toTile)) {
        // Play compuer move
        if (gameMode === "AGAINST_CPU") {
          cpuTurnFlag.current = true;
        }
        moveSound.play();
        dispatch(pieceMove(toTile));
      } else {
        return dispatch(noPieceSelected());
      }
    }
  }

  /**
   *
   */
  function onPieceDrag(tile: string) {
    updateDragging(true);
    if (selectedTile) {
      // If draging a piece not already selected
      if (tile !== selectedTile) {
        dispatch(pieceSelect(tile));
      }
    } else {
      dispatch(pieceSelect(tile));
    }
  }

  /**
   *
   */
  function onPieceDrop(toTile: string) {
    if (draging) {
      updateDragging(false);
      if (selectedTile) {
        if (toTile === selectedTile) {
          return dispatch(noPieceSelected());
        }
        onPieceMove(toTile);
      }
    }
  }

  /**
   *
   */
  function onTileClick(tile: string) {
    if (selectedTile) {
      onPieceMove(tile);
    }
  }

  /**
   *
   */
  function onPieceClick(tile: string) {
    if (selectedTile) {
      if (tile === selectedTile) {
        dispatch(noPieceSelected());
      }
      onPieceMove(tile);
    } else {
      dispatch(pieceSelect(tile));
    }
  }

  /**
   *
   */
  function resetGame() {
    cpuTurnFlag.current = false;
    isBusy.current = false;
    dispatch(reset());
  }

  /**
   *
   */
  function logScore() {
    let board = new Board(state.boardConfig);
    board.setState(state.boardState);
    let scores = evaluatePosition(board, [archerOnDarkDarkTiles, kingOutOfPosition]);
    console.log(scores);
  }

  /**
   *
   */
  function undo() {
    if (state.turn > 1) {
      dispatch(undoMove());
    }
  }

  /**
   *
   */
  async function simulateComputerPlay() {
    isBusy.current = true;
    // small delay to let browser finish paint
    await delay(100);
    let startTime = Date.now();
    let board = new Board(state.boardConfig);
    board.setState(state.boardState);
    let moveCandidate = getMoveCandidates(board, [archerOnDarkDarkTiles, kingOutOfPosition]);
    if (moveCandidate === null) {
      return console.error("No move candidates found");
    }
    // A Trick to add artificial CPU think time of at least 1 second
    let findMoveTime = Date.now() - startTime;
    let thinkingTime = 800;
    if (thinkingTime > findMoveTime) {
      thinkingTime = thinkingTime - findMoveTime;
    }
    await delay(thinkingTime);

    let [moveFrom, moveTo] = moveCandidate;
    dispatch(pieceSelect(moveFrom));
    await delay(2000);
    dispatch(pieceMove(moveTo));
    isBusy.current = false;
    moveSound.play();
  }

  /**
   *
   */
  function delay(duration: number) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  /**
   * Returns an Array od <div class="row"> Elements
   */
  let boardRowsHtml = state.tiles.map((tileRows, i) => {
    let rowHtml = tileRows.map((tileRow) => {
      let {
        key,
        colour,
        piece,
        isPossibleMove,
        isMovingPiece,
        isHill,
        edgeScore,
        distanceFromPiece,
        isPreviousMove,
      } = tileRow;

      return (
        <Tile
          key={key}
          colour={colour}
          width={state.tileWidth}
          tileKey={key}
          turn={state.playerTurn}
          isHill={isHill}
          isPossibleMove={isPossibleMove}
          edgeScore={edgeScore}
          isMovingPiece={isMovingPiece}
          piece={piece}
          distanceFromPiece={distanceFromPiece}
          isPrevMove={isPreviousMove}
          onPieceDrag={onPieceDrag}
          onPieceDrop={onPieceDrop}
          onPieceClick={onPieceClick}
          onTileClick={onTileClick}
        />
      );
    });

    return (
      <div className="row" key={i}>
        {rowHtml}
      </div>
    );
  });

  /*
  let infoBox = winner ? (
    <div>
      WINING PLAYER: {winner} <br />
    </div>
  ) : (
    <div>
      PLAYER TURN: {state.player} <br />
    </div>
  );*/

  const contextValue = {
    playerTurn: state.playerTurn,
    draging: draging,
    status: state.status,
    gameMode: state.gameMode,
    humanPlayer: state.humanPlayer,
  };

  return (
    <BoardViewContext.Provider value={contextValue}>
      <div>
        {/*infoBox*/}
        Turn: {state.turn} / {state.totalTurns}
        <br />
        <button onClick={resetGame}>Reset Game</button>
        <button onClick={logScore}>Log Score</button>
        <button onClick={undo}>Undo</button>
        <button onClick={simulateComputerPlay}>CPU Play</button>
        <div
          className={`koth-board ${state.playerTurn === "WHITE" ? "blue-turn" : "red-turn"}`}
          style={{ width: state.boardWidth, height: state.boardWidth }}
        >
          <div className={`board-inner ${state.selectedTile ? "drag" : ""}`}>{boardRowsHtml}</div>
        </div>
      </div>
    </BoardViewContext.Provider>
  );
}
