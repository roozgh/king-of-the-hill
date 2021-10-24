import { Board } from "../board/board";
import { evaluatePosition } from "./score-evaluator";

describe("Score Evaluator", () => {
  test("Simple Test", () => {
    const state: any = [
      {
        lastMove: null,
        pieces: [
          ["D1", "WHITE", "KING"],
          ["D7", "BLACK", "KING"],
        ],
      },
    ];

    // Set up a 7X7 board
    const board = new Board({ x: 7, y: 7 });
    board.state.setStateFromJSON(state);

    const result = evaluatePosition(board);

    /**
     * King is worth 1000 points.
     * -6 penalty for being away from the centre.
     * Which should give us 994 score for both Black and White
     */
    expect(result).toEqual({
      WHITE: 994,
      BLACK: 994,
    });
  });
});
