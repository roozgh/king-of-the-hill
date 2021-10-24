import { Piece, Colour, PieceName, makePiece } from "../piece";

const startingPlayer = "WHITE";

type ActivePieces = Map<string, Piece>;

// null on turn 1, [moveFrom, moveTo] on rest
type LastMove = null | [string, string];

interface State {
  lastMove: LastMove;
  activePieces: ActivePieces;
  capturedPieces: Piece[];
}

type JSONBoardStateTileKey = string | null;
type JSONBoardStatePiece = [JSONBoardStateTileKey, Colour, PieceName];
type JSONBoardStateSingle = {
  lastMove: LastMove;
  pieces: JSONBoardStatePiece[];
};

/**
 * Board's State in JSON form. e.g:
 * [
      {
        lastMove: null,
        pieces: [
          ["A1", "WHITE", "KING"],
          ["A2", "BLACK", "KING"],
        ],
      },
    ] 
 */
export type JSONBoardState = JSONBoardStateSingle[];

type Status = "ACTIVE" | "DRAW" | Colour;

/**
 *
 */
export class BoardState {
  private stateHistory: State[] = [];
  player: Colour = startingPlayer;
  status: Status = "ACTIVE";
  turn = 1;
  seed = generateSeed();

  /**
   * Takes a Tile key and returns its piece in current position
   */
  getPiece(key: string) {
    const state = this.stateHistory[this.turn - 1];
    if (!state) throw new Error(`Invalid State for Turn: ${this.turn}`);
    const piece = state.activePieces.get(key);
    return piece;
  }

  /**
   * Returns active pieces in current position.
   * Return value is a Javascript Map where
   * key is Tile key and value is a Piece Object
   */
  getActivePieces(): ActivePieces {
    const state = this.stateHistory[this.turn - 1];
    if (!state) throw new Error(`Invalid State for Turn: ${this.turn}`);
    return state.activePieces;
  }

  /**
   * Returns an of captured pieces in current position
   */
  getCapturedPieces(): Piece[] {
    const state = this.stateHistory[this.turn - 1];
    if (!state) throw new Error(`Invalid State for Turn: ${this.turn}`);
    return state.capturedPieces;
  }

  /**
   * Returns last move that was played.
   * If turn 1, returns null
   */
  getLastMove(): LastMove {
    const state = this.stateHistory[this.turn - 1];
    if (!state) throw new Error(`Invalid State for Turn: ${this.turn}`);
    return state.lastMove;
  }

  /**
   *
   */
  addState(activePieces: ActivePieces, lastMove: LastMove, capturedPiece?: Piece) {
    const state = this.stateHistory[this.turn - 1];
    if (!state) throw new Error(`Invalid State for Turn: ${this.turn}`);
    const capturedPieces = state.capturedPieces.slice();
    if (capturedPiece) capturedPieces.push(capturedPiece);
    this.stateHistory.push({ capturedPieces, lastMove, activePieces });
    this.turn++;
  }

  /**
   *
   */
  undo() {
    if (this.turn > 1) {
      this.stateHistory.pop();
      this.turn--;
      this.player = this.getPlayerColourFromTurn();
      this.status = "ACTIVE";
    }
  }

  /**
   *
   */
  getPlayerColourFromTurn() {
    return this.turn % 2 === 0 ? "BLACK" : "WHITE";
  }

  /**
   *
   */
  getNextTurnPlayer(): Colour {
    return this.player === "BLACK" ? "WHITE" : "BLACK";
  }

  /**
   *
   */
  reset() {
    this.turn = 1;
    this.stateHistory = this.stateHistory.slice(0, 1);
    this.status = "ACTIVE";
    this.player = startingPlayer;
    this.seed = generateSeed();
  }

  /**
   * Returns JSON representation of board state
   */
  getJSONState(): JSONBoardState {
    let boardStateJSON: JSONBoardState = [];

    this.stateHistory.forEach((state) => {
      const { lastMove } = state;
      const capturedPieces = state.capturedPieces.map((piece) => {
        const stateItem: JSONBoardStatePiece = [null, piece.colour, piece.name];
        return stateItem;
      });
      const activePieces = Array.from(state.activePieces).map(([key, piece]) => {
        const stateItem: JSONBoardStatePiece = [key, piece.colour, piece.name];
        return stateItem;
      });
      const combinedStates = [...activePieces, ...capturedPieces];
      boardStateJSON.push({ pieces: combinedStates, lastMove });
    });

    return boardStateJSON;
  }

  /**
   * Sets board state from JSON
   */
  setStateFromJSON(stateJSON: JSONBoardState) {
    let state: State[] = [];
    let turn = 0;

    stateJSON.forEach((JSONStateItem) => {
      const { pieces, lastMove } = JSONStateItem;
      const capturedPieces = pieces
        .filter(([key]) => key === null)
        .map(([key, colour, name]) => {
          let piece = makePiece(name, colour);
          return piece;
        });

      let activePieces = new Map();

      pieces
        .filter(([key]) => key !== null)
        .forEach(([key, colour, name]) => {
          let piece = makePiece(name, colour);
          activePieces.set(key, piece);
        });

      state.push({ capturedPieces, activePieces, lastMove });
      turn++;
    });

    this.stateHistory = state;
    this.status = "ACTIVE";
    this.turn = turn;
    this.player = this.getPlayerColourFromTurn();
    this.seed = generateSeed();
  }
}

/**
 *
 */
function generateSeed() {
  return Math.round(Math.random() * 10 ** 8);
}
