import { Piece, Colour, PieceName, makePiece } from "../piece";

const startingPlayer = "WHITE";

type State = Map<string, Piece>;

interface CompleteState {
  state: State;
  capturedPieces: Piece[];
}

type Status = "ACTIVE" | "DRAW" | Colour;

type JSONBoardStateTileKey = string | null;
type JSONBoardStateItem = [JSONBoardStateTileKey, Colour, PieceName];
type JSONBoardState = JSONBoardStateItem[];
export type JSONBoardStates = JSONBoardState[];

/**
 *
 */
export class BoardState {
  readonly totalTurns = 80;
  private stateHistory: CompleteState[] = [];
  player: Colour = startingPlayer;
  turn = 1;
  status: Status = "ACTIVE";

  /**
   *
   */
  getPiece(key: string) {
    let completeState = this.stateHistory[this.turn - 1];
    if (!completeState) throw new Error(`Invalid State for Turn: ${this.turn}`);
    let piece = completeState.state.get(key);
    return piece;
  }

  /**
   *  Includes both captured & uncaptured pieces
   */
  getCompleteState(): CompleteState {
    let completeState = this.stateHistory[this.turn - 1];
    if (!completeState) throw new Error(`Invalid State for Turn: ${this.turn}`);
    return completeState;
  }

  /**
   * Only Includes uncaptured pieces and their Tile key
   */
  getState(): State {
    let completeState = this.stateHistory[this.turn - 1];
    if (!completeState) throw new Error(`Invalid State for Turn: ${this.turn}`);
    return completeState.state;
  }

  /**
   *
   */
  initState(newState: CompleteState, turn = 1) {
    this.stateHistory = [newState];
    this.turn = turn;
    this.player = this.getPlayerColourFromTurn();
  }

  /**
   *
   */
  addState(newState: State, capturedPiece?: Piece) {
    const completeState = this.getCompleteState();
    let capturedPieces = completeState.capturedPieces.slice();
    if (capturedPiece) capturedPieces.push(capturedPiece);
    this.stateHistory.push({ capturedPieces, state: newState });
    this.turn++;
  }

  /**
   *
   */
  undo() {
    if (this.turn > 0) {
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
  reset() {
    this.turn = 0;
    this.stateHistory = [];
    this.status = "ACTIVE";
    this.player = startingPlayer;
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
  getJSONState(): JSONBoardStates {
    let boardStateJSON: JSONBoardStates = [];

    this.stateHistory.forEach((completeState) => {
      const capturedPieces = completeState.capturedPieces.map((piece) => {
        const stateItem: JSONBoardStateItem = [null, piece.colour, piece.name];
        return stateItem;
      });
      const notCapturedPieces = Array.from(completeState.state).map(([key, piece]) => {
        const stateItem: JSONBoardStateItem = [key, piece.colour, piece.name];
        return stateItem;
      });
      const combinedStates = [...notCapturedPieces, ...capturedPieces];
      boardStateJSON.push(combinedStates);
    });

    return boardStateJSON;
  }

  /**
   *
   */
  setStateFromJSON(stateJSON: JSONBoardStates) {
    let completeState: CompleteState[] = [];
    let turn = 0;

    stateJSON.forEach((state) => {
      turn++;
      const capturedPieces = state
        .filter(([key]) => key === null)
        .map(([key, colour, name]) => {
          let piece = makePiece(name, colour);
          return piece;
        });

      let stateMap = new Map();

      state
        .filter(([key]) => key !== null)
        .forEach(([key, colour, name]) => {
          let piece = makePiece(name, colour);
          stateMap.set(key, piece);
        });

      completeState.push({ capturedPieces, state: stateMap });
    });

    this.stateHistory = completeState;
    this.turn = turn;
    this.player = this.getPlayerColourFromTurn();
  }
}
