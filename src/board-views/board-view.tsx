import "../board.css";
import { Piece } from "./piece";
import { useEffect, useCallback, useReducer, MouseEvent, memo } from "react";
import { useWindowEvent } from "../utils";
import Tile from "./tile";
import { Board } from "../board-logic/board/board";
import { boardViewReducer, boardViewInitialState, BoardViewContext } from "./board-view-reducer";

const moveSound = new Audio("../move.mp3");
moveSound.volume = 0.3;

interface BoardViewProps {
  board: Board;
  turn: number | null;
  gameMode: string;
  playable: boolean;
  boardMaxWidth: number;
  simulateMove: null | [string, string];
  onPieceMove: (from: string, to: string) => void;
}

/**
 *
 */
export default function BoardView(opt: BoardViewProps) {
  console.log("RENDER");
  const { board, turn, playable, gameMode, boardMaxWidth, simulateMove, onPieceMove } = opt;
  const { totalTurns } = board.state;
  const [state, dispatch] = useReducer(boardViewReducer, boardViewInitialState);
  const { selectedTile, draggedPiece, draggedPieceCoords } = state;

  /**
   * Initialise Board
   */
  useEffect(() => {
    dispatch({ type: "INIT", board, gameMode });
  }, []);

  /**
   * On new turn
   */
  useEffect(() => {
    dispatch({ type: "NEW_TURN" });
    moveSound.play();
  }, [turn]);

  /**
   * simulate CPU move
   */
  useEffect(() => {
    if (simulateMove) {
      let [moveFrom, moveTo] = simulateMove;
      dispatch({ type: "PIECE_CLICK", tile: moveFrom });
      setTimeout(() => {
        onPieceMove(moveFrom, moveTo);
      }, 1500);
    }
  }, [simulateMove, onPieceMove]);

  /**
   * Set Board and Tile width
   */
  useEffect(() => {
    const windowWidth = window.innerWidth;
    const boardColumnCount = board.xAxis.length;
    let boardWidth = Math.min(windowWidth, boardMaxWidth);
    let tileWidth = Math.floor(boardWidth / boardColumnCount);
    boardWidth = tileWidth * boardColumnCount;
    dispatch({ type: "BOARD_WIDTH_CHANGE", boardWidth, tileWidth });
  }, [boardMaxWidth, board.xAxis.length]);

  /**
   * For detecting mouse click and mouse-ups outside Board
   */
  const onWindowMouseUp = useCallback(() => {
    if (selectedTile) {
      dispatch({ type: "NO_TILE_SELECTED" });
    }
  }, [selectedTile]);

  useWindowEvent("mouseup", onWindowMouseUp);

  /**
   * On Window mouse
   * check if piece was dragged. Then re-render board with
   * new dragged piece x, y coordinates equal to mouse x, y.
   */
  const onWindowMouseMove = useCallback(
    (e: MouseEvent) => {
      if (draggedPiece) {
        const x = e.clientX;
        const y = e.clientY;
        dispatch({ type: "PIECE_DRAG_CONTINUE", x, y });
      }
    },
    [draggedPiece]
  );

  useWindowEvent("mousemove", onWindowMouseMove);

  /**
   * Returns an Array of <div class="row"> Elements
   * that contain a row of Tiles
   */
  const boardRowsHtml = state.tiles.map((tileRows, i) => {
    const rowHtml = tileRows.map((tileRow) => {
      const {
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
          isHill={isHill}
          isPossibleMove={isPossibleMove}
          edgeScore={edgeScore}
          isMovingPiece={isMovingPiece}
          piece={piece}
          distanceFromPiece={distanceFromPiece}
          isPrevMove={isPreviousMove}
          playable={playable}
          onPieceMove={onPieceMove}
        />
      );
    });

    return (
      <div className="row" key={i}>
        {rowHtml}
      </div>
    );
  });
  return (
    <BoardViewContext.Provider value={[state, dispatch]}>
      {draggedPiece && draggedPieceCoords && (
        <Piece
          name={draggedPiece.name}
          colour={draggedPiece.colour}
          width={state.tileWidth - 20}
          position={{ x: draggedPieceCoords.x, y: draggedPieceCoords.y }}
        />
      )}
      <div
        className={`koth-board ${board.state.player === "WHITE" ? "blue-turn" : "red-turn"}`}
        style={{ width: state.boardWidth, height: state.boardWidth }}
      >
        <div className={`board-inner ${selectedTile ? "drag" : ""}`}>{boardRowsHtml}</div>
      </div>
    </BoardViewContext.Provider>
  );
}
