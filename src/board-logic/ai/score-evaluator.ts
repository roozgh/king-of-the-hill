import { Piece } from "../piece";
import { Board } from "../board/board";
import { Tile } from "../tile";

type EvaluatePosition = {
  BLACK: number;
  WHITE: number;
};

export type EvaluatorPlugin = (tile: Tile, piece: Piece) => number;

/**
 *
 */
export function evaluatePosition(board: Board, plugins: EvaluatorPlugin[] = []): EvaluatePosition {
  let bluePieces: [string, Piece][] = [];
  let redPieces: [string, Piece][] = [];

  board.state.getState().forEach((piece, key) => {
    if (piece.colour === "BLACK") redPieces.push([key, piece]);
    else bluePieces.push([key, piece]);
  });

  let [blackScore, whiteScore] = [redPieces, bluePieces].map((pieces) => {
    let score = 0;
    for (let [key, piece] of pieces) {
      let { value, edgePreference } = piece;
      let tile = board.tiles.get(key) as Tile;

      score += value;

      if (piece.name === "TOWER" && tile.isHill) {
        score += 5;
      }

      score += edgePreference.x * tile.xEdge + edgePreference.y * tile.yEdge;

      if (plugins.length) {
        for (let plugin of plugins) {
          score += plugin(tile, piece);
        }
      }
    }
    return score;
  });

  return {
    WHITE: whiteScore,
    BLACK: blackScore,
  };
}

/*
export function evaluatePosition2(board: Board): EvaluatePosition {
  let { turn } = board;
  let colours: Colour[] = ["BLACK", "WHITE"];

  let [blackScore, whiteScore] = colours.map((player) => {
    let score = 0;
    let pieces = board.pieces[player].getPices();
    for (let piece of pieces) {
      let { name, isTakable, colour, tile } = piece;

      // Add Piece value
      score += piece.value;

      score += getEdgePreferenceValue(piece);

      if (!tile || !isTakable || name === "TOWER") continue;

      let possibleMoves = getPossibleMoveTiles(piece, true);

      for (let moveTile of possibleMoves) {
        // Bonus for having an eye on Hill tile
        if (moveTile.isHill) score += 2;

        let attackedPiece = moveTile.piece;
        if (!attackedPiece) continue;

        // If hitting a piece that can't be captured
        if (!attackedPiece.isTakable) {
          continue;
          // e.g if hitting enemy Tower
          //if (attackedPiece.colour !== player) score -= 1;
        }

        // If hittin friendly and not own King(no point in protecting own king)
        if (attackedPiece.colour === player) {
          if (attackedPiece.name !== "KING") {
            score += 0.5;
          }
        }
        // If attacking opponent
        else {
          // If it's attacking player's turn
          if (player === turn) {
            if (name === "MAGICIAN") score += attackedPiece.value / 4;
            else {
              if (attackedPiece.name === "KING") return 100;
              score += 2;
            }
          }
          // If it's not attacking player's turn
          else {
            score += 1;
          }
        }
      }
    }
    return score;
  });

  if (blackScore == 100) whiteScore = 0;
  else if (whiteScore == 100) blackScore = 0;

  //let [bHillScore, rHillScore] = getHillScores(board);
  //whiteScore += bHillScore;
  //blackScore += rHillScore;

  //let [bCoverrageScore, rCoverageScore] = getPieceCoverageScore(board);
  //whiteScore += bCoverrageScore;
  //blackScore += rCoverageScore;

  return {
    BLACK: Math.floor(blackScore),
    WHITE: Math.floor(whiteScore),
  };
}
*/

/*
function getPieceValue(pieces: Piece[], board: Board, player: Colour) {
  let score = 0;
  for (let piece of pieces) {
    let { name, isTakable, colour, tile } = piece;

    // Add Piece value
    score += piece.value;

    if (!tile || !isTakable || name === "TOWER") continue;

    let possibleMoves = getPossibleMoveTiles(piece, true);

    for (let moveTile of possibleMoves) {
      // Bonus for having an eye on Hill tile
      if (moveTile.isHill) score++;

      let attackedPiece = moveTile.piece;
      if (!attackedPiece) continue;

      // If hitting a piece that can't be captured
      if (!attackedPiece.isTakable) {
        // e.g if hitting enemy Tower
        //if (attackedPiece.colour !== player) score -= 1;
      }

      // If hittin friendly and not own King(no point in protecting own king)
      if (attackedPiece.colour === player) {
        if (attackedPiece.name !== "KING") score += 0.5;
      }
      // If attacking opponent
      else {
        // If attacking player turn
        if (player === colour) {
          if (name === "MAGICIAN") score += attackedPiece.value / 4;
          else {
            if (attackedPiece.name === "KING") return 100;
            score += attackedPiece.value / 2;
          }
        }
        // If not attacking player turn
        else {
          //score += attackedPiece.value / 4;
        }
      }
    }
  }
  return Math.floor(score);
}
*/

/*
function getPieceCoverageScore(board: Board): [number, number] {
  let redPossibleMoves = board.getAllPossibleMovesByColour("BLACK");
  let bluePossibleMoves = board.getAllPossibleMovesByColour("WHITE");
  let totalMoves = redPossibleMoves.length + bluePossibleMoves.length;
  return [
    Math.floor((bluePossibleMoves.length / totalMoves) * 10),
    Math.floor((redPossibleMoves.length / totalMoves) * 10),
  ];
}
*/

/*
function getHillScores(board: Board) {
  let whiteScore = 0;
  let blackScore = 0;
  for (let hill of board.hills) {
    let { piece, neighbours } = hill;
    if (piece?.name === "KING") {
      if (piece.colour === "WHITE") whiteScore += 10;
      else blackScore += 10;
    }
    // Check if King is present around Hill
    else {
      for (let [dir, neighbour] of Array.from(neighbours)) {
        if (neighbour.piece?.name === "KING") {
          if (neighbour.piece.colour === "WHITE") whiteScore += 2;
          else blackScore += 2;
        }
      }
    }
  }
  return [whiteScore, blackScore];
}
*/
