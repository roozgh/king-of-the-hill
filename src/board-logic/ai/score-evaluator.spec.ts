import { Board } from "../board/board";
import { evaluatePosition } from "./score-evaluator";

describe("Score Evaluator", () => {
  test("Stress Test", () => {
    let defaultSet: any = [
      {
        lastMove: null,
        pieces: [["D1", "WHITE", "KING"]],
      },
    ];

    let board = new Board({ x: 7, y: 7, hills: ["D4"] });
    board.state.setStateFromJSON(defaultSet);

    //console.time("EVAL");
    for (let i = 0; i < 100; i++) {
      evaluatePosition(board);
    }
    //console.timeEnd("EVAL");
  });
});
