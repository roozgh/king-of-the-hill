import { Colour } from "../piece";
import { Tile } from "../tile";
import { getPossibleMoves } from "../possible-moves";
import { makeBoardTilesFromAxis } from "../tile-maker";
import { BoardState } from "./board-state";

export interface BoardConfig {
  x: number;
  y: number;
  hills?: string[];
  totalTurns?: number;
}

const boardDimentions: { [k: string]: string[] } = {
  // X AXIS - Left To Right
  x: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
  // Y AXIS - Bottom toTop
  y: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
};

const defaultTotalTurns = 70;

/**
 *
 */
export class Board {
  tiles: Map<string, Tile>;
  // Hills is an array becuase it's possible for board to have more than 1 hill
  hills: Tile[];
  state = new BoardState();
  xAxis: string[];
  yAxis: string[];
  totalTurns: number;

  constructor({ x, y, hills, totalTurns }: BoardConfig) {
    checkBoardDimentions("x", x);
    checkBoardDimentions("y", y);
    let xAxis = boardDimentions.x.slice(0, x);
    let yAxis = boardDimentions.y.slice(0, y);
    this.tiles = makeBoardTilesFromAxis({ xAxis, yAxis, hills });
    this.hills = this.getTilesArray().filter((t) => t.isHill);
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.totalTurns = totalTurns || defaultTotalTurns;
  }

  /**
   *
   */
  getTilesArray(): Tile[] {
    return Array.from(this.tiles).map(([key, tile]) => tile);
  }

  /**
   * Moves Piece. Also checks if game has winner or ended in draw.
   * It changes the game 'status' to player colour if winner is found e.g WHITE
   * Or to 'DRAW' if game is drawn. Otherwise the status will remain 'ACTIVE'
   */
  move(from: string, to: string) {
    if (this.state.status !== "ACTIVE") throw Error("Game over. Cannot make moves");

    let fromTile = this.tiles.get(from);
    let toTile = this.tiles.get(to);
    if (!fromTile || !toTile) throw Error("Invalid tiles");

    let capturedPiece = this.state.getPiece(to);

    let movingPiece = this.state.getPiece(from);
    if (movingPiece == null) throw Error("No Piece found");

    let newState = new Map(this.state.getActivePieces());

    // Special Magician move
    if (movingPiece.name === "MAGICIAN" && capturedPiece) {
      // Captured piece and moving piece Swap positions
      newState.set(to, movingPiece);
      newState.set(from, capturedPiece);
      this.state.addState(newState, [from, to]);
    } else {
      newState.delete(from);
      newState.set(to, movingPiece);
      this.state.addState(newState, [from, to], capturedPiece);
    }

    // Check if King has been captured
    if (capturedPiece?.name === "KING" && movingPiece.name !== "MAGICIAN") {
      this.state.status = movingPiece.colour;
      return;
    }

    // Check if KOTH
    let winner = this.checkIfKOTH();
    if (winner) {
      this.state.status = winner;
      return;
    }

    if (this.totalTurns + 1 === this.state.turn) {
      this.state.status = "DRAW";
    } else {
      this.state.player = this.state.getNextTurnPlayer();
    }
  }

  /**
   *
   */
  isValidMove(from: string, to: string): boolean {
    try {
      let piece = this.state.getPiece(from);
      if (!piece) return false;
      if (piece.colour !== this.state.player) return false;
      let possibleMoves = getPossibleMoves(from, this);
      return possibleMoves.includes(to);
    } catch (e) {
      return false;
    }
  }

  /**
   * returns all possible moves by Colour
   */
  getAllPossibleMovesByColour(colour: Colour): string[] {
    let stateArray = Array.from(this.state.getActivePieces());
    return stateArray
      .filter(([key, piece]) => piece.colour === colour)
      .reduce((moves: string[], item) => {
        moves.push(...getPossibleMoves(item[0], this));
        return moves;
      }, []);
  }

  /**
   * Check if King Of The Hill condition is met
   */
  checkIfKOTH(): false | Colour {
    let nextTurnPlayer = this.state.getNextTurnPlayer();
    for (let hill of this.hills) {
      let piece = this.state.getPiece(hill.key);
      if (!piece) continue;

      if (piece.name === "KING") {
        // If player failed to capture opponent King on Hill
        if (this.state.player !== piece.colour) return piece.colour;
        // For edge-case when(for some reason) player Magician moves opponent King into Hill
        if (nextTurnPlayer === piece.colour) return this.state.player;
        // If King move to Hill on last move of the game
        if (this.totalTurns + 1 === this.state.turn) return piece.colour;
        // Check if possible for player to Contest opponent King on Hill
        let moves = this.getAllPossibleMovesByColour(nextTurnPlayer);
        if (!moves.includes(hill.key)) return this.state.player;
      }
    }
    return false;
  }
}

/**
 * Checks whether given board dimentions are valid
 */
function checkBoardDimentions(type: string, value: number) {
  let minVal = 2;
  if (value < minVal) {
    throw new Error(`'${type}' must be at least ${minVal}`);
  }
  if (value > boardDimentions[type].length) {
    throw new Error(`'${type}' cannot exceed ${boardDimentions[type].length}`);
  }
}
