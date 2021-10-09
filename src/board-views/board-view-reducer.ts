import { createContext, Dispatch } from "react";
import { Board } from "../board-logic/board/board";
import { Colour as PieceColour, PieceName } from "../board-logic/piece";
import { getPossibleMovesWithDetails, PossibleMove } from "../board-logic/possible-moves";

interface FormatedTile {
  key: string;
  colour: string;
  piece: {
    name: PieceName;
    colour: PieceColour;
  } | null;
  isHill: boolean;
  isPossibleMove: boolean;
  isMovingPiece: boolean;
  isPreviousMove: boolean;
  edgeScore: string;
  distanceFromPiece: number | null;
}

export interface BoardViewState {
  board: Board | null;
  tiles: FormatedTile[][];
  selectedTile: string | null;
  possibleMoves: string[] | null;
  previousMove: null | [string, string];
  tileWidth: number;
  boardWidth: number;
  gameMode: string;
  draging: boolean;
  draggedPiece: null | {
    colour: PieceColour;
    name: PieceName;
    tile: string;
  };
  draggedPieceCoords: null | {
    x: number;
    y: number;
  };
}

export const boardViewInitialState: BoardViewState = {
  board: null,
  selectedTile: null,
  tiles: [],
  possibleMoves: null,
  previousMove: null,
  gameMode: "AGAINST_CPU",
  tileWidth: 90,
  boardWidth: 750,
  draging: false,
  draggedPiece: null,
  draggedPieceCoords: null,
};

export type BoardViewAction =
  | { type: "INIT"; board: Board; gameMode: string }
  | { type: "NEW_TURN" }
  | { type: "BOARD_WIDTH_CHANGE"; boardWidth: number; tileWidth: number }
  | { type: "PIECE_CLICK"; tile: string }
  | { type: "PIECE_DRAG"; tile: string; colour: PieceColour; name: PieceName }
  | { type: "PIECE_DRAG_CONTINUE"; x: number; y: number }
  | { type: "PIECE_DRAG_STOP" }
  | { type: "NO_TILE_SELECTED" }
  | { type: "MOVE"; from: string; to: string };

type TBoardViewContext = [BoardViewState, Dispatch<BoardViewAction>];

export const BoardViewContext = createContext<TBoardViewContext>([boardViewInitialState, () => {}]);

/**
 *
 */
export function boardViewReducer(state: BoardViewState, action: BoardViewAction): BoardViewState {
  switch (action.type) {
    case "INIT": {
      const { board, gameMode } = action;
      const tiles = formatTiles(board);
      return { ...boardViewInitialState, board, tiles, gameMode };
    }

    case "NEW_TURN": {
      const { board } = state;
      if (!board) throw Error("Board not set");
      const tiles = formatTiles(board, state.previousMove);
      return {
        ...state,
        tiles,
        selectedTile: null,
        draging: false,
        draggedPiece: null,
        draggedPieceCoords: null,
      };
    }

    case "BOARD_WIDTH_CHANGE": {
      const { boardWidth, tileWidth } = action;
      return { ...state, boardWidth, tileWidth };
    }

    case "PIECE_DRAG": {
      const { tile, colour, name } = action;
      if (!state.board) throw Error("Board not set");
      const possibleMovesWithDetails = getPossibleMovesWithDetails(tile, state.board);
      const possibleMoves = possibleMovesWithDetails.map((m) => m.tileTo.key);
      const tiles = formatTiles(
        state.board,
        state.previousMove,
        possibleMovesWithDetails,
        tile,
        tile
      );
      const draggedPiece = { tile, colour, name };
      return { ...state, tiles, possibleMoves, draggedPiece, draging: true, selectedTile: tile };
    }

    case "PIECE_DRAG_CONTINUE": {
      const { x, y } = action;
      return { ...state, draggedPieceCoords: { x, y } };
    }

    case "PIECE_DRAG_STOP": {
      if (!state.board) throw Error("Board not set");
      const tiles = formatTiles(state.board, state.previousMove);
      return { ...state, tiles, draggedPiece: null, draggedPieceCoords: null };
    }

    case "MOVE": {
      if (!state.board) throw Error("Board not set");
      const { from, to } = action;
      return { ...state, previousMove: [from, to] };
    }

    case "PIECE_CLICK": {
      const { tile } = action;
      if (!state.board) throw Error("Board not set");
      const possibleMovesWithDetails = getPossibleMovesWithDetails(tile, state.board);
      const possibleMoves = possibleMovesWithDetails.map((m) => m.tileTo.key);
      const tiles = formatTiles(state.board, state.previousMove, possibleMovesWithDetails, tile);
      return { ...state, tiles, possibleMoves, selectedTile: tile };
    }

    case "NO_TILE_SELECTED": {
      if (!state.board) throw Error("Board not set");
      const tiles = formatTiles(state.board, state.previousMove);
      return {
        ...state,
        tiles,
        possibleMoves: null,
        selectedTile: null,
        draggedPiece: null,
        draggedPieceCoords: null,
        draging: false,
      };
    }

    default:
      throw new Error(`Invalid Action`);
  }
}

/**
 *
 */
export function formatTiles(
  board: Board,
  previousMove?: [string, string] | null,
  possibleMoves: PossibleMove[] = [],
  movingPiece?: string,
  draggedPiece?: string
): FormatedTile[][] {
  return board.yAxis.map((y) => {
    return board.xAxis.map((x) => {
      const key = x + y;
      const tile = board.tiles.get(key);
      if (!tile) throw Error("Invalid Tile " + key);

      const possibleMoveTile = possibleMoves.find((m) => m.tileTo.key === key);
      const distanceFromPiece = possibleMoveTile ? possibleMoveTile.distanceFromPiece : null;
      const isPossibleMove = possibleMoveTile ? true : false;
      let isMovingPiece = false;
      if (movingPiece && movingPiece === key) isMovingPiece = true;

      const isPreviousMove = previousMove ? previousMove.includes(key) : false;

      const _piece = board.state.getPiece(tile.key);
      let piece = null;
      if (_piece) {
        piece = {
          name: _piece.name,
          colour: _piece.colour,
        };
      }

      // Do not render piece that is being dragged
      if (draggedPiece && draggedPiece === key) {
        piece = null;
      }

      return {
        key,
        colour: tile.colour,
        piece,
        isHill: tile.isHill,
        isPossibleMove,
        isMovingPiece,
        isPreviousMove,
        edgeScore: tile.xEdge + " - " + tile.yEdge,
        distanceFromPiece,
      };
    });
  });
}
