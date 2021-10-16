import { useEffect, useCallback, useReducer, useState, useMemo } from "react";
import { Piece } from "../piece/piece";
import { useWindowEvent } from "../../utils";
import { Board } from "../../board-logic/board/board";
import { boardViewInitialState } from "./state/board-view-state";
import { boardViewReducer } from "./state/board-view-reducer";
import { BoardViewContext } from "./state/board-view-context";
import { BoardTiles } from "./board-tiles";

interface BoardViewProps {
  board: Board;
  // 'token' is randmon number that changes everytime board.state changes.
  // Used by parent component to trigger board-view re-renders
  token: number | null;
  gameMode: string;
  playable: boolean;
  // Suggested board width from parent component.
  boardMaxWidth: number;
  selectTile: null | string;
  onPieceMove?: (from: string, to: string) => void;
}

type draggedPieceCoords = null | { x: number; y: number };

/**
 *
 */
export default function BoardView(opt: BoardViewProps) {
  //console.log("RENDER");
  const { board, token, playable, gameMode, boardMaxWidth, selectTile, onPieceMove } = opt;
  const [state, dispatch] = useReducer(boardViewReducer, boardViewInitialState);
  const { selectedTile, draggedPiece } = state;
  // Why is 'draggedPieceCoords' not part of the Reducer?
  // To stop board tiles re-rendering everytime we render the dragged piece
  const [draggedPieceCoords, setDraggedPieceCoords] = useState<draggedPieceCoords>(null);

  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state]);

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
    const boardColumnCount = board.xAxis.length;
    let boardWidth = boardMaxWidth;
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
   * Check if piece drag has started,
   * set dragged piece x, y coordinates equal to mouse x, y.
   */
  useEffect(() => {
    if (!draggedPiece) return;
    // When drag starts set inital values.
    const { x, y } = draggedPiece.initialCoords;
    setDraggedPieceCoords({ x, y });

    const onWindowMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setDraggedPieceCoords({ x, y });
    };
    window.addEventListener("mousemove", onWindowMouseMove);
    // Event Listener Clean-up
    return () => {
      setDraggedPieceCoords(null);
      window.removeEventListener("mousemove", onWindowMouseMove);
    };
  }, [draggedPiece]);

  return (
    <>
      {draggedPiece && draggedPieceCoords && (
        <Piece
          name={draggedPiece.name}
          colour={draggedPiece.colour}
          width={state.tileWidth - 20}
          position={{ x: draggedPieceCoords.x, y: draggedPieceCoords.y }}
        />
      )}
      <BoardViewContext.Provider value={contextValue}>
        <div
          className={`board-inner ${selectedTile ? "drag" : ""}`}
          style={{ width: state.boardWidth, height: state.boardWidth }}
        >
          <BoardTiles tiles={state.tiles} playable={playable} onPieceMove={onPieceMove} />
        </div>
      </BoardViewContext.Provider>
    </>
  );
}
