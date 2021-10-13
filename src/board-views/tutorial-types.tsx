import { PieceName } from "../board-logic/piece";
import { JSONBoardState } from "../board-logic/board/board-state";

type TutItem = {
  state: JSONBoardState;
  move: [string, string];
};

type PieceTutorial = {
  desc: string;
  tutorials: TutItem[];
};

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

  MAGICIAN: {
    desc: "The Magician can move any number of Tiles in any direction. The Magician cannot capture pieces, howerver it can swap position with firendly and enemy pieces in its line of sight.",
    tutorials: [
      {
        state: [
          {
            lastMove: null,
            pieces: [
              ["C1", "WHITE", "KING"],
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
    desc: "The Spy moves 1 Tile in any direction. It can also move 1 Tile from one edge of the board to the other edge.",
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

  CHARIOT: {
    desc: "The Chariot can move up to 3 tiles Vertically and any number of tiles Horizontally.",
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
    desc: "The Archer can move 2 Tiles Diagonally. The Archer can also Leap over other pieces.",
    tutorials: [
      {
        state: [
          {
            lastMove: null,
            pieces: [
              ["C3", "WHITE", "ARCHER"],
              ["E5", "BLACK", "KING"],
            ],
          },
        ],
        move: ["C3", "E5"],
      },
      {
        state: [
          {
            lastMove: null,
            pieces: [
              ["B2", "WHITE", "ARCHER"],
              ["C3", "WHITE", "TOWER"],
              ["D4", "BLACK", "KING"],
            ],
          },
        ],
        move: ["B2", "D4"],
      },
    ],
  },

  TOWER: {
    desc: "The Tower can move 1 Tile Horizontal and Vertical direction. The Tower cannot Capture other pieces and also cannot be captured.",
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
    ],
  },
};
