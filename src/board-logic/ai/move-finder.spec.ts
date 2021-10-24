import { Board } from "../board/board";
import { getMoveCandidates } from "./move-finder";

describe("Move Finder", () => {
  test("Basic Test", () => {
    const state: any = [
      {
        lastMove: null,
        pieces: [
          ["A1", "WHITE", "KING"],
          ["A2", "BLACK", "KING"],
        ],
      },
    ];

    // Set up a 4X4 board for testing
    const board = new Board({ x: 4, y: 4 });
    board.state.setStateFromJSON(state);

    const result = getMoveCandidates(board);
    // White King on A1 should capture Black King on A2
    expect(result).toEqual(["A1", "A2"]);
  });
});
