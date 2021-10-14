import { Piece } from "./piece";
import { useEffect, useCallback, useReducer, MouseEvent, memo } from "react";
import { useWindowEvent } from "../utils";
import Tile from "./tile";
import { Board } from "../board-logic/board/board";
import { boardViewReducer, boardViewInitialState, BoardViewContext } from "./board-view-reducer";

interface BoardViewProps {
  board: Board;
  // 'token' is randmon number that changes everytime board.state changes.
  // Used by parent component to trigger board-view re-renders
  token: number | null;
  gameMode: string;
  playable: boolean;
  boardMaxWidth: number;
  selectTile: null | string;
  onPieceMove?: (from: string, to: string) => void;
}

/**
 *
 */
export default function BoardView(opt: BoardViewProps) {
  //console.log("RENDER");
  const { board, token, playable, gameMode, boardMaxWidth, selectTile, onPieceMove } = opt;
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
   * On new turn.
   * Or on board reset.
   */
  useEffect(() => {
    dispatch({ type: "NEW_TURN" });
  }, [token]);

  /**
   * simulate CPU move
   */
  useEffect(() => {
    if (selectTile) {
      dispatch({ type: "TILE_SELECT", tile: selectTile });
    }
  }, [selectTile, onPieceMove]);

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
        playerTurn,
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
          playerTurn={playerTurn}
          key={key}
          colour={colour}
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
        className={`board-inner ${selectedTile ? "drag" : ""}`}
        style={{ width: state.boardWidth, height: state.boardWidth }}
      >
        {boardRowsHtml}
      </div>
    </BoardViewContext.Provider>
  );
}
