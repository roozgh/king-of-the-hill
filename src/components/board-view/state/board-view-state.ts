import { Board } from "../../../board-logic/board/board";
import { Colour as PieceColour, PieceName } from "../../../board-logic/piece";

export interface FormatedTile {
  playerTurn: PieceColour;
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
  draggedPiece: null | {
    colour: PieceColour;
    name: PieceName;
    tile: string;
    // Mouse x, y when drag start
    initialCoords: {
      x: number;
      y: number;
    };
  };
}

export const boardViewInitialState = {
  board: null,
  selectedTile: null,
  tiles: [],
  possibleMoves: null,
  gameMode: "AGAINST_CPU",
  tileWidth: 90,
  boardWidth: 750,
  draggedPiece: null,
  draggedPieceCoords: null,
};
