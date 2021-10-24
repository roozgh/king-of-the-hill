import { Piece } from "../piece";
import { Board } from "../board/board";
import { Tile } from "../tile";

type EvaluatePosition = {
  BLACK: number;
  WHITE: number;
};

export type EvaluatorPlugin = (tile: Tile, piece: Piece) => number;

/**
 * Given a Board Object, evaluates scores for both Blacn & White.
 * The score is calculated based on:
 * 1- Sum of active pieces' piece worth. e.g King is worth 1000 points.
 * 2- Active piece 'edge score', e.g King on edge is given bad edge score.
 * 3- Custom eval plugins that are passed into the funcion
 */
export function evaluatePosition(board: Board, plugins: EvaluatorPlugin[] = []): EvaluatePosition {
  let whitePieces: [string, Piece][] = [];
  let blackPieces: [string, Piece][] = [];

  board.state.getActivePieces().forEach((piece, key) => {
    if (piece.colour === "BLACK") blackPieces.push([key, piece]);
    else whitePieces.push([key, piece]);
  });

  let [blackScore, whiteScore] = [blackPieces, whitePieces].map((pieces) => {
    let score = 0;
    for (let [key, piece] of pieces) {
      let { value, edgePreference } = piece;
      let tile = board.tiles.get(key) as Tile;

      // Piece value
      score += value;

      // Give a small bonus for Tower being on Hill
      if (piece.name === "TOWER" && tile.isHill) {
        score += 5;
      }

      // Is piece out of position or in good position.
      // e.g Kings in central positions are generally good.
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
