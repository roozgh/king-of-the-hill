import { JSONBoardState } from "../board-logic/board/board-state";
import { EvaluatorPlugin } from "../board-logic/ai/score-evaluator";

/**
 * Small bonus for Archers being on Drak Tiles.
 * Archers on dark Tiles are more effective
 * becuase they can attack the Hill Tile on 'D4'
 * whcih is also on a Dark Tile.
 */
const archerOnDarkTiles: EvaluatorPlugin = (tile, piece) => {
  if (piece.name === "ARCHER" && tile.colour === "DARK") return 5;
  return 0;
};

/**
 * Penalty for King being on the last 'rank'
 */
const kingOutOfPosition: EvaluatorPlugin = (tile, piece) => {
  if (piece.name === "KING") {
    // If Black King is on First Rank
    if (piece.colour === "BLACK" && tile.y === 6) {
      return -20;
    }
    // If White King is on Last Rank
    else if (piece.colour === "WHITE" && tile.y === 0) {
      return -20;
    }
  }
  return 0;
};

/**
 * Plugins are functions that are passed to
 * board evaluator when evaluating positions.
 */
export const scoreEvalPlugins = [archerOnDarkTiles, kingOutOfPosition];

export const defaultBoardState: JSONBoardState = [
  {
    lastMove: null,
    pieces: [
      ["D1", "WHITE", "KING"],
      ["A1", "WHITE", "CHARIOT"],
      ["B1", "WHITE", "ARCHER"],
      ["F1", "WHITE", "ARCHER"],
      ["B2", "WHITE", "SPY"],
      ["D2", "WHITE", "MAGICIAN"],
      ["F2", "WHITE", "TOWER"],
      ["G1", "WHITE", "CHARIOT"],

      ["D7", "BLACK", "KING"],
      ["A7", "BLACK", "CHARIOT"],
      ["B7", "BLACK", "ARCHER"],
      ["F7", "BLACK", "ARCHER"],
      ["B6", "BLACK", "SPY"],
      ["D6", "BLACK", "MAGICIAN"],
      ["F6", "BLACK", "TOWER"],
      ["G7", "BLACK", "CHARIOT"],
    ],
  },
];
