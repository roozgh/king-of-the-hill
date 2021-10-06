import { Piece, Colour } from "../piece";

const startingPlayer = "WHITE";

type State = Map<string, Piece>;

type Status = "ACTIVE" | "DRAW" | Colour;

/**
 *
 */
export class BoardState {
  readonly totalTurns = 60;
  private stateHistory: Map<number, State> = new Map();
  player: Colour = startingPlayer;
  turn = 1;
  status: Status = "ACTIVE";

  /**
   *
   */
  getPiece(key: string) {
    let state = this.stateHistory.get(this.turn);
    if (!state) throw new Error(`Invalid State for Turn: ${this.turn}`);
    let piece = state.get(key);
    return piece;
  }

  /**
   *
   */
  getState(): State {
    let state = this.stateHistory.get(this.turn);
    if (!state) throw new Error(`Invalid State for Turn: ${this.turn}`);
    return state;
  }

  /**
   *
   */
  initState(newState: State, turn = 0) {
    this.stateHistory.set(turn, newState);
    this.turn = turn;
    this.player = this.getPlayerColourFromTurn();
  }

  /**
   *
   */
  setState(newState: State) {
    this.turn++;
    this.stateHistory.set(this.turn, newState);
  }

  /**
   *
   */
  undo() {
    if (this.turn > 1) {
      this.stateHistory.delete(this.turn);
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
    this.turn = 1;
    this.stateHistory = new Map();
    this.status = "ACTIVE";
    this.player = startingPlayer;
  }

  /**
   *
   */
  getNextTurnPlayer(): Colour {
    return this.player === "BLACK" ? "WHITE" : "BLACK";
  }
}
