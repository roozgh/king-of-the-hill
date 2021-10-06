import { useState, useEffect, useRef } from "react";
import { Board, SetBoardState, BoardConfig } from "../board-logic/board/board";
import { getPossibleMovesWithDetails, PossibleMove } from "../board-logic/possible-moves";
import { Colour } from "../board-logic/piece";

interface Tile {
  key: string;
  colour: string;
  piece?: {
    name: string;
    colour: string;
  };
  isHill: boolean;
  highlight: boolean;
  isMovingPiece: boolean;
  edgeScore: string;
  distanceFromPiece: number | null;
}

interface BoardState {
  boardWidth: number;
  tileWidth: number;
  turn: number;
  status: "ACTIVE" | "DRAW" | "BLACK" | "WHITE";
  humanPlayer: Colour;
  playerTurn: Colour;
  tiles: Tile[][];
  selectedTile: string | null;
  boardConfig: BoardConfig;
  boardState: SetBoardState;
  previousMove?: [string, string] | null;
  gameMode: "AGAINST_CPU" | "AGAINST_HUMAN";
  totalTurns: number;
  boardStateHistory: SetBoardState[];
  draggedPieceTile: string | null;
}

/**
 *
 */
export function BoardViewState() {
  //
}

const defaultBoardState: SetBoardState = {
  turn: 1,
  state: {
    D2: ["KING", "WHITE"],
    A1: ["CHARIOT", "WHITE"],
    B1: ["ARCHER", "WHITE"],
    F1: ["ARCHER", "WHITE"],
    B2: ["SPY", "WHITE"],
    D1: ["MAGICIAN", "WHITE"],
    F2: ["TOWER", "WHITE"],
    G1: ["CHARIOT", "WHITE"],

    D6: ["KING", "BLACK"],
    A7: ["CHARIOT", "BLACK"],
    B7: ["ARCHER", "BLACK"],
    F7: ["ARCHER", "BLACK"],
    B6: ["SPY", "BLACK"],
    F6: ["TOWER", "BLACK"],
    D7: ["MAGICIAN", "BLACK"],
    G7: ["CHARIOT", "BLACK"],
  },
};

const initialState: BoardState = {
  boardWidth: 800,
  tileWidth: 90,
  turn: 1,
  status: "ACTIVE",
  humanPlayer: "WHITE",
  playerTurn: "WHITE",
  tiles: [],
  selectedTile: null,
  boardConfig: { x: 7, y: 7, hills: ["D4"] },
  boardState: Object.assign({}, defaultBoardState),
  previousMove: null,
  gameMode: "AGAINST_CPU",
  totalTurns: 0,
  boardStateHistory: [],
  draggedPieceTile: null,
};

export const reducers = {
  /**
   *
   */
  init(state: any, action: any) {
    let { x, y, hills, windowWidth } = action.payload;
    let boardConfig = { x, y, hills };
    let board = new Board(boardConfig);
    board.setState(defaultBoardState);
    state.boardState = defaultBoardState;
    state.boardConfig = boardConfig;
    state.totalTurns = board.state.totalTurns;
    state.tiles = formatTiles(board);
    let boardColumnCount = state.boardConfig.x;
    let [boardWidth, tileWidth] = calculateBoardAndTileWidth(windowWidth, boardColumnCount);
    state.boardWidth = boardWidth;
    state.tileWidth = tileWidth;
  },

  /**
   *
   */
  reset(state: any) {
    let board = new Board(state.boardConfig);
    board.setState(defaultBoardState);
    state.boardState = defaultBoardState;
    state.boardStateHistory = [];
    state.turn = 1;
    state.playerTurn = "WHITE";
    state.status = "ACTIVE";
    state.selectedTile = null;
    state.previousMove = null;
    state.tiles = formatTiles(board);
  },

  /**
   *
   */
  undoMove(state: any) {
    if (state.turn === 1) return;
    let board = new Board(state.boardConfig);
    state.boardStateHistory.pop();
    let previousBoardstate = state.boardStateHistory[state.boardStateHistory.length - 1];
    // If move 1
    if (!previousBoardstate) {
      previousBoardstate = defaultBoardState;
    }
    board.setState(previousBoardstate);
    state.boardState = previousBoardstate;
    state.turn--;
    state.playerTurn = board.state.player;
    state.status = board.state.status;
    state.tiles = formatTiles(board);
  },

  /**
   *
   */
  pieceSelect(state: any, action: any) {
    if (state.status !== "ACTIVE") return;
    let board = makeNewBoard(state);
    let tileKey = action.payload;
    let tile = board.tiles.get(tileKey);
    if (!tile) {
      return console.error("Invalid Key: " + tileKey);
    }
    let piece = board.state.getPiece(tile.key);
    // If clicking on empty Tile
    if (!piece) {
      return console.error("Specified Tile does not contain any piece");
    }
    // If clicking on same tile as before
    if (state.selectedTile && state.selectedTile === tileKey) {
      state.selectedTile = null;
      state.tiles = formatTiles(board, [], undefined, state.draggedPieceTile);
      return;
    }

    if (piece.colour !== board.state.player) return;
    let possibleMoves = getPossibleMovesWithDetails(tile.key, board);
    state.selectedTile = tileKey;
    state.tiles = formatTiles(board, possibleMoves, tileKey, state.draggedPieceTile);
  },

  /**
   *
   */
  pieceMove(state: any, action: any) {
    if (state.status !== "ACTIVE") return;
    let { selectedTile } = state;
    if (!selectedTile) return;
    let board = makeNewBoard(state);
    let toTile = action.payload;
    board.move(selectedTile, toTile);
    state.boardState = board.getState();
    state.boardStateHistory.push(state.boardState);
    state.playerTurn = board.state.player;
    state.turn = board.state.turn;
    state.previousMove = [selectedTile, toTile];
    state.status = board.state.status;
    state.tiles = formatTiles(board, [], undefined, state.draggedPieceTile);
    state.selectedTile = null;
  },

  /**
   *
   */
  noPieceSelected(state: any) {
    let board = makeNewBoard(state);
    state.tiles = formatTiles(board, [], undefined, state.draggedPieceTile);
    state.selectedTile = null;
  },

  /**
   *
   */
  draggedPieceToggle(state: any, action: any) {
    state.draggedPieceTile = action.payload;
  },

  /**
   *
   */
  windowResize(state: any, action: any) {
    let windowWidth = action.payload;
    let boardColumnCount = state.boardConfig.x;
    let [boardWidth, tileWidth] = calculateBoardAndTileWidth(windowWidth, boardColumnCount);
    state.boardWidth = boardWidth;
    state.tileWidth = tileWidth;
  },
};

/*
const simulateComputerPlay = createAsyncThunk('boardView/simulateComputerPlay',  async () => {    
  const response = await userAPI.fetchById(userId)    return response.data  
})
*/

/**
 *
 */
function makeNewBoard(state: BoardState): Board {
  let board = new Board(state.boardConfig);
  board.setState(state.boardState);
  return board;
}

/**
 *
 */
function calculateBoardAndTileWidth(windowWidth: number, boardColumnCount: number) {
  let boardWidth = Math.min(windowWidth, 800);
  let tileWidth = Math.floor(boardWidth / boardColumnCount);
  boardWidth = tileWidth * boardColumnCount;
  return [boardWidth, tileWidth];
}

/**
 *
 */
export function formatTiles(
  board: Board,
  possibleMove: PossibleMove[] = [],
  movingPiece?: string,
  draggedPieceTile?: string | null
): Tile[][] {
  return board.yAxis.map((y) => {
    return board.xAxis.map((x) => {
      let key = x + y;
      let tile = board.tiles.get(key);
      if (!tile) throw Error("Invalid Tile " + key);

      let isPossibleMove = possibleMove.find((m) => m.tileTo.key === key);
      let distanceFromPiece = isPossibleMove ? isPossibleMove.distanceFromPiece : null;
      let highlight = isPossibleMove ? true : false;
      let isMovingPiece = false;
      if (movingPiece && movingPiece === key) isMovingPiece = true;

      let _piece = board.state.getPiece(tile.key);
      let piece;
      if (_piece && key !== draggedPieceTile) {
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
        highlight,
        isMovingPiece,
        edgeScore: tile.xEdge + " - " + tile.yEdge,
        distanceFromPiece,
      };
    });
  });
}
