import { useState, useEffect, useRef, createContext, memo, useCallback } from "react";
import { batch } from "react-redux";
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

const MemoTile = memo(Tile);

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
  const isBusy = useRef(false);
  const cpuTurnFlag = useRef(false);
  const { status, selectedTile, gameMode, boardConfig, boardState } = state;
  const draging = useRef(false);

  useEffect(() => {
    if (cpuTurnFlag.current) {
      cpuTurnFlag.current = false;
      if (state.status === "ACTIVE") simulateComputerPlay();
    }
  }, [cpuTurnFlag.current, state.status]);

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
   *
   */
  const onWindowMouseUp = useCallback(() => {
    console.log("Window Mouse Up");
    if (state.selectedTile) {
      if (draging.current) {
        draging.current = false;
      }
      dispatch(noPieceSelected());
    }
  }, [dispatch, state.selectedTile]);

  useWindowEvent("mouseup", onWindowMouseUp);

  /**
   *
   */
  const onPieceMove = useCallback(
    (toTile: string) => {
      console.log("onPieceMove");
      if (status !== "ACTIVE") return;
      if (isBusy.current) return;
      if (selectedTile) {
        // If clicking on same tile again
        if (selectedTile === toTile) {
          draging.current = false;
          return dispatch(noPieceSelected());
        }
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
          draging.current = false;
          return dispatch(noPieceSelected());
        }
      }
      // If no piece was selected to move
      else {
        dispatch(pieceSelect(toTile));
      }
    },
    [dispatch, status, selectedTile, boardConfig, boardState, gameMode]
  );

  /**
   *
   */
  const onPieceDrag = useCallback(
    (tile: string, piece: any) => {
      draging.current = true;
      dispatch(pieceSelect(tile));
    },
    [dispatch]
  );

  /**
   *
   */
  const onPieceDrop = useCallback(
    (toTile: string) => {
      if (draging.current) {
        onPieceMove(toTile);
        draging.current = false;
      }
    },
    [onPieceMove]
  );

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
        <MemoTile
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
          onTileClick={onPieceMove}
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
    draging: draging.current,
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
