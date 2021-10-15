import { Direction } from "./tile-maker";
import { Piece } from "./piece";
import { Tile } from "./tile";
import { Board } from "./board/board";

export interface PossibleMove {
  piece: Piece;
  tileFrom: Tile;
  tileTo: Tile;
  tileScore: number;
  capturing?: boolean;
  // Tile distance from Tile containing the moving piece
  distanceFromPiece: number;
}

/**
 *
 */
export function getPossibleMoves(key: string, board: Board): string[] {
  let possibleMoves = getPossibleMovesWithDetails(key, board);
  return possibleMoves.map((t) => t.tileTo.key);
}

/**
 * To be used by AI Move Finder
 */
export function getPossibleMovesWithDetails(key: string, board: Board): PossibleMove[] {
  let possibleMoves: PossibleMove[] = [];
  let piece = board.state.getPiece(key);
  if (!piece) throw Error("Piece not found on Key: " + key);

  let tile = board.tiles.get(key);
  if (!tile) throw Error("Tile not found: " + key);

  for (let moveSet of piece.moveSets) {
    let { type, direction } = moveSet;
    if (type === "LINEAR") {
      possibleMoves.push(...getLinearMoves(tile, piece, board, direction as Direction[]));
    } else if (type === "CONTINUOUS") {
      possibleMoves.push(
        ...getContinuousMoves(tile, tile, piece, board, direction as Direction, [])
      );
    } else if (type === "JUMP") {
      possibleMoves.push(...getJumpMoves(tile, piece, board, direction as Direction[]));
    } else {
      throw new Error(`Invalid Move Type: ${type}`);
    }
  }
  return possibleMoves;
}

/**
 * used for 'linear' moves
 */
export function getLinearMoves(
  tile: Tile,
  piece: Piece,
  board: Board,
  directions: Direction[]
): PossibleMove[] {
  let moves = [];

  let tmpTile: Tile | null = tile;
  for (let i = 0; i < directions.length; i++) {
    let direction = directions[0];
    let neightbour = tmpTile.walk(direction);
    if (!neightbour) return moves;
    tmpTile = neightbour as Tile;
    let neightbourPiece = board.state.getPiece(neightbour.key);
    let tileScore = getTileScore(neightbour, piece);
    let distanceFromPiece = i + 1;
    let move: PossibleMove = {
      tileFrom: tile,
      tileTo: neightbour,
      piece,
      tileScore,
      distanceFromPiece,
    };
    if (neightbourPiece) {
      if (canTakeNeighbour(piece, neightbourPiece)) {
        move.capturing = true;
        moves.push(move);
      }
      return moves;
    } else {
      moves.push(move);
    }
  }
  return moves;
}

/**
 * used for 'continous' moves
 */
export function getContinuousMoves(
  startingTile: Tile,
  tile: Tile,
  piece: Piece,
  board: Board,
  direction: Direction,
  moves: PossibleMove[] = []
): PossibleMove[] {
  let neightbour = tile.walk(direction);
  if (neightbour) {
    let neightbourPiece = board.state.getPiece(neightbour.key);
    let tileScore = getTileScore(neightbour, piece);
    let distanceFromPiece = moves.length + 1;
    let move: PossibleMove = {
      tileFrom: startingTile,
      tileTo: neightbour,
      piece,
      tileScore,
      distanceFromPiece,
    };
    if (neightbourPiece) {
      if (canTakeNeighbour(piece, neightbourPiece)) {
        move.capturing = true;
        moves.push(move);
        return moves;
      } else {
        return moves;
      }
    } else {
      moves.push(move);
      return getContinuousMoves(startingTile, neightbour, piece, board, direction, moves);
    }
  } else {
    return moves;
  }
}

/**
 * used for 'jump' moves
 */
export function getJumpMoves(
  tile: Tile,
  piece: Piece,
  board: Board,
  directions: Direction[]
): PossibleMove[] {
  let moves = [];

  let tmpTile: Tile | null = tile;
  for (let i = 0; i < directions.length; i++) {
    let direction = directions[0];
    let neightbour = tmpTile.walk(direction);
    if (neightbour) {
      tmpTile = neightbour as Tile;
      let neightbourPiece = board.state.getPiece(neightbour.key);
      let tileScore = getTileScore(neightbour, piece);
      let distanceFromPiece = i + 1;
      let move: PossibleMove = {
        tileFrom: tile,
        tileTo: neightbour,
        piece,
        tileScore,
        distanceFromPiece,
      };
      if (neightbourPiece) {
        if (canTakeNeighbour(piece, neightbourPiece)) {
          move.capturing = true;
          moves.push(move);
        }
      } else {
        moves.push(move);
      }
    } else {
      return moves;
    }
  }
  return moves;
}

/**
 *
 */
function canTakeNeighbour(piece: Piece, neighbour: Piece): boolean {
  if (piece.name === "MAGICIAN") return true;

  if (piece.canTake && neighbour.isTakable) {
    if (neighbour.colour !== piece.colour) {
      return true;
    }
  }
  return false;
}

/**
 *
 */
function getTileScore(tile: Tile, piece: Piece) {
  let { x, y } = piece.edgePreference;
  return x * tile.xEdge + y * tile.yEdge;
}
