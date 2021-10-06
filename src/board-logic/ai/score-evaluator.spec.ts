import { Board, SetBoardState } from "../board/board";
import { evaluatePosition } from "./score-evaluator";

describe("Score Evaluator", () => {
  test("Stress Test", () => {
    let defaultSet: SetBoardState = {
      turn: 1,
      state: {
        D2: ["KING", "WHITE"],
      },
    };

    let board = new Board({ x: 7, y: 7, hills: ["D4"] });
    board.setState(defaultSet);

    console.time("EVAL");
    for (let i = 0; i < 100000; i++) {
      evaluatePosition(board);
    }
    console.timeEnd("EVAL");
  });
});
