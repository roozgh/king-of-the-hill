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
