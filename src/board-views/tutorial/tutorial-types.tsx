import { PieceName } from "../../board-logic/piece";
import { JSONBoardState } from "../../board-logic/board/board-state";

/**
 * Each tutorial item contains a board state and a board move [from, to]
 *
 */
type TutItem = {
  state: JSONBoardState;
  move: [string, string];
};

/**
 * Each 'PieceTutorial' contains a description of a piece
 * and array of Tutorial Items
 */
type PieceTutorial = {
  desc: string;
  tutorials: TutItem[];
};

/**
 * A JS dictionary where the Key is Piece name
 * and value is a 'PieceTutorial'
 */
export const tutTypes: Record<PieceName, PieceTutorial> = {
  KING: {
    desc: "The king moves 1 Tile in any direction",
    tutorials: [
      {
        state: [{ lastMove: null, pieces: [["C3", "WHITE", "KING"]] }],
        move: ["C3", "C4"],
      },
    ],
  },

  CHARIOT: {
    desc: "Chariot can move up to 3 tiles Vertically and any number of tiles Horizontally.",
    tutorials: [
      {
        state: [{ lastMove: null, pieces: [["A1", "WHITE", "CHARIOT"]] }],
        move: ["A1", "A4"],
      },
      {
        state: [{ lastMove: null, pieces: [["A4", "WHITE", "CHARIOT"]] }],
        move: ["A4", "E4"],
      },
    ],
  },

  ARCHER: {
    desc: "Archer can move 2 Tiles Diagonally. The Archer can also Leap over other pieces.",
    tutorials: [
      {
        state: [
          {
            lastMove: null,
            pieces: [["C3", "WHITE", "ARCHER"]],
          },
        ],
        move: ["C3", "E5"],
      },
      {
        state: [
          {
            lastMove: null,
            pieces: [
              ["C3", "WHITE", "ARCHER"],
              ["E5", "BLACK", "KING"],
              ["D4", "BLACK", "TOWER"],
            ],
          },
        ],
        move: ["C3", "E5"],
      },
    ],
  },

  MAGICIAN: {
    desc: "Magician can move any number of Tiles in any direction. The Magician cannot capture pieces, howerver it can swap position with firendly and enemy pieces in its line of sight.",
    tutorials: [
      {
        state: [
          {
            lastMove: null,
            pieces: [
              ["C1", "WHITE", "TOWER"],
              ["C3", "WHITE", "MAGICIAN"],
            ],
          },
        ],
        move: ["C3", "C1"],
      },
      {
        state: [
          {
            lastMove: null,
            pieces: [
              ["C3", "BLACK", "KING"],
              ["E1", "WHITE", "MAGICIAN"],
            ],
          },
        ],
        move: ["E1", "C3"],
      },
    ],
  },

  SPY: {
    desc: "Spy moves 1 Tile in any direction. If on the edge of the board, Spy can move 1 Tile from one edge of the board to the oposite edge.",
    tutorials: [
      { state: [{ lastMove: null, pieces: [["C2", "WHITE", "SPY"]] }], move: ["C2", "C1"] },
      { state: [{ lastMove: null, pieces: [["C1", "WHITE", "SPY"]] }], move: ["C1", "C5"] },
      {
        state: [
          {
            lastMove: null,
            pieces: [
              ["A1", "WHITE", "SPY"],
              ["E5", "BLACK", "KING"],
            ],
          },
        ],
        move: ["A1", "E5"],
      },
    ],
  },

  TOWER: {
    desc: "Tower can move 1 Tile in Horizontal or Vertical direction. The Tower cannot Capture other pieces and also cannot be captured.",
    tutorials: [
      {
        state: [
          {
            lastMove: null,
            pieces: [
              ["B3", "WHITE", "KING"],
              ["C2", "WHITE", "TOWER"],
              ["E3", "BLACK", "CHARIOT"],
            ],
          },
        ],
        move: ["C2", "C3"],
      },
      {
        state: [
          {
            lastMove: null,
            pieces: [
              ["B3", "WHITE", "KING"],
              ["C3", "WHITE", "TOWER"],
              ["E3", "BLACK", "CHARIOT"],
            ],
          },
          {
            lastMove: ["C2", "C3"],
            pieces: [
              ["B3", "WHITE", "KING"],
              ["C3", "WHITE", "TOWER"],
              ["E3", "BLACK", "CHARIOT"],
            ],
          },
        ],
        move: ["E3", "D3"],
      },
    ],
  },
};
