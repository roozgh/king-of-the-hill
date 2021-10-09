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
  tileWidth: number;
  boardWidth: number;
  gameMode: string;
  draging: boolean;
}

export const boardViewInitialState: BoardViewState = {
  board: null,
  selectedTile: null,
  tiles: [],
  possibleMoves: null,
  gameMode: "AGAINST_CPU",
  tileWidth: 90,
  boardWidth: 750,
  draging: false,
};

export type BoardViewAction =
  | { type: "INIT"; board: Board; gameMode: string }
  | { type: "NEW_TURN" }
  | { type: "BOARD_WIDTH_CHANGE"; boardWidth: number; tileWidth: number }
  | { type: "PIECE_CLICK"; tile: string }
  | { type: "PIECE_DRAG"; tile: string }
  | { type: "NO_TILE_SELECTED" };

type TBoardViewContext = [BoardViewState, Dispatch<BoardViewAction>];

export const BoardViewContext = createContext<TBoardViewContext>([boardViewInitialState, () => {}]);

/**
 *
 */
export function boardViewReducer(state: BoardViewState, action: BoardViewAction): BoardViewState {
  switch (action.type) {
    case "INIT": {
      console.log("INIT");
      let { board, gameMode } = action;
      let tiles = formatTiles(board);
      return { ...boardViewInitialState, board, tiles, gameMode };
    }

    case "NEW_TURN": {
      console.log("NEW_TURN");
      const { board } = state;
      if (!board) throw Error("Board not set");
      const tiles = formatTiles(board, [], undefined);
      return { ...state, tiles, selectedTile: null, draging: false };
    }

    case "BOARD_WIDTH_CHANGE": {
      console.log("BOARD_WIDTH_CHANGE");
      let { boardWidth, tileWidth } = action;
      return { ...state, boardWidth, tileWidth };
    }

    case "PIECE_DRAG": {
      console.log("PIECE_DRAG");
      let { tile } = action;
      if (!state.board) throw Error("Board not set");
      let possibleMovesWithDetails = getPossibleMovesWithDetails(tile, state.board);
      let possibleMoves = possibleMovesWithDetails.map((m) => m.tileTo.key);
      let tiles = formatTiles(state.board, possibleMovesWithDetails, tile);
      return { ...state, tiles, possibleMoves, draging: true, selectedTile: tile };
    }

    case "PIECE_CLICK": {
      console.log("ON_PIECE_CLICK");
      let { tile } = action;
      if (!state.board) throw Error("Board not set");
      let possibleMovesWithDetails = getPossibleMovesWithDetails(tile, state.board);
      let possibleMoves = possibleMovesWithDetails.map((m) => m.tileTo.key);
      let tiles = formatTiles(state.board, possibleMovesWithDetails, tile);
      return { ...state, tiles, possibleMoves, selectedTile: tile };
    }

    case "NO_TILE_SELECTED": {
      console.log("NO_TILE_SELECTED");
      if (!state.board) throw Error("Board not set");
      let tiles = formatTiles(state.board);
      return { ...state, tiles, possibleMoves: null, selectedTile: null, draging: false };
    }

    default:
      throw new Error();
  }
}

/**
 *
 */
export function formatTiles(
  board: Board,
  possibleMove: PossibleMove[] = [],
  movingPiece?: string,
  previousMove?: [string, string]
): FormatedTile[][] {
  return board.yAxis.map((y) => {
    return board.xAxis.map((x) => {
      let key = x + y;
      let tile = board.tiles.get(key);
      if (!tile) throw Error("Invalid Tile " + key);

      let possibleMoveTile = possibleMove.find((m) => m.tileTo.key === key);
      let distanceFromPiece = possibleMoveTile ? possibleMoveTile.distanceFromPiece : null;
      let isPossibleMove = possibleMoveTile ? true : false;
      let isMovingPiece = false;
      if (movingPiece && movingPiece === key) isMovingPiece = true;

      let isPreviousMove = previousMove ? previousMove.includes(key) : false;

      let _piece = board.state.getPiece(tile.key);
      let piece = null;
      if (_piece) {
        piece = {
          name: _piece.name,
          colour: _piece.colour,
        };
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
