import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Board, SetBoardState, BoardConfig } from "./board-logic/board/board";
import { getPossibleMovesWithDetails, PossibleMove } from "./board-logic/possible-moves";
import { Colour } from "./board-logic/piece";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { Colour as PieceColour, PieceName } from "./board-logic/piece";

interface Tile {
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

interface InitReducerPayload extends BoardConfig {
  windowWidth: number;
}

const defaultBoardState: SetBoardState = {
  turn: 1,
  state: {
    D1: ["KING", "WHITE"],
    A1: ["CHARIOT", "WHITE"],
    B1: ["ARCHER", "WHITE"],
    F1: ["ARCHER", "WHITE"],
    B2: ["SPY", "WHITE"],
    D2: ["MAGICIAN", "WHITE"],
    F2: ["TOWER", "WHITE"],
    G1: ["CHARIOT", "WHITE"],

    D7: ["KING", "BLACK"],
    A7: ["CHARIOT", "BLACK"],
    B7: ["ARCHER", "BLACK"],
    F7: ["ARCHER", "BLACK"],
    B6: ["SPY", "BLACK"],
    F6: ["TOWER", "BLACK"],
    D6: ["MAGICIAN", "BLACK"],
    G7: ["CHARIOT", "BLACK"],
  },
};

const boardMaxWidth = 750;

const initialState: BoardState = {
  boardWidth: boardMaxWidth,
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

export const boardViewSlice = createSlice({
  name: "board",
  initialState,
  reducers: {
    /**
     *
     */
    init(state, action: PayloadAction<InitReducerPayload>) {
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
    reset(state) {
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
    undoMove(state) {
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
    pieceSelect(state, action: PayloadAction<string>) {
      if (state.status !== "ACTIVE") return;
      let board = makeNewBoard(state);
      let tileKey = action.payload;
      let tile = board.tiles.get(tileKey);
      if (!tile) {
        return console.error("Invalid Key: " + tileKey);
      }
      let piece = board.state.getPiece(tile.key);
      // If clicking on empty Tile
      if (!piece) return;
      // If clicking on same tile as before
      if (state.selectedTile && state.selectedTile === tileKey) {
        state.selectedTile = null;
        state.tiles = formatTiles(board, []);
        return;
      }

      if (piece.colour !== board.state.player) return;
      let possibleMoves = getPossibleMovesWithDetails(tile.key, board);
      state.selectedTile = tileKey;
      state.tiles = formatTiles(board, possibleMoves, tileKey);
    },

    /**
     *
     */
    pieceMove(state, action: PayloadAction<string>) {
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
      state.tiles = formatTiles(board, [], undefined, state.previousMove);
      state.selectedTile = null;
    },

    /**
     *
     */
    noPieceSelected(state) {
      let board = makeNewBoard(state);
      state.tiles = formatTiles(board, []);
      state.selectedTile = null;
    },

    /**
     *
     */
    windowResize(state, action: PayloadAction<number>) {
      let windowWidth = action.payload;
      let boardColumnCount = state.boardConfig.x;
      let [boardWidth, tileWidth] = calculateBoardAndTileWidth(windowWidth, boardColumnCount);
      state.boardWidth = boardWidth;
      state.tileWidth = tileWidth;
    },
  },
});

/*
const simulateComputerPlay = createAsyncThunk('boardView/simulateComputerPlay',  async () => {    
  const response = await userAPI.fetchById(userId)    return response.data  
})
*/

export const { init, reset, undoMove, pieceSelect, pieceMove, noPieceSelected, windowResize } =
  boardViewSlice.actions;

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
  let boardWidth = Math.min(windowWidth, boardMaxWidth);
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
  previousMove?: [string, string]
): Tile[][] {
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
