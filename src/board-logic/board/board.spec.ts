import { Board } from "./board";

describe("Board", () => {
  test("Basic Test", () => {
    const board = new Board({ x: 7, y: 7, hills: ["D4"] });
    expect(board).toBeTruthy();
  });

  test("Board with no Hills", () => {
    const board = new Board({ x: 5, y: 6 });
    expect(board).toBeTruthy();
    expect(board.hills.length).toBe(0);
    expect(board.xAxis.length).toBe(5);
    expect(board.yAxis.length).toBe(6);
  });

  test("JSON State", () => {
    const JSONState: any = [
      {
        lastMove: null,
        pieces: [
          ["A1", "WHITE", "KING"],
          ["A2", "BLACK", "ARCHER"],
        ],
      },
    ];

    const board = new Board({ x: 5, y: 5 });
    board.state.setStateFromJSON(JSONState);
    expect(board.state.turn).toEqual(1);
    expect(board.state.player).toEqual("WHITE");

    board.move("A1", "A2");
    expect(board.state.turn).toEqual(2);
    expect(board.state.player).toEqual("BLACK");

    let newState = board.state.getJSONState();
    expect(newState).toEqual([
      {
        lastMove: null,
        pieces: [
          ["A1", "WHITE", "KING"],
          ["A2", "BLACK", "ARCHER"],
        ],
      },
      {
        lastMove: ["A1", "A2"],
        pieces: [
          ["A2", "WHITE", "KING"],
          [null, "BLACK", "ARCHER"],
        ],
      },
    ]);

    board.state.undo();
    expect(board.state.turn).toEqual(1);
    expect(board.state.player).toEqual("WHITE");

    newState = board.state.getJSONState();
    expect(newState).toEqual([
      {
        lastMove: null,
        pieces: [
          ["A1", "WHITE", "KING"],
          ["A2", "BLACK", "ARCHER"],
        ],
      },
    ]);
  });
});
