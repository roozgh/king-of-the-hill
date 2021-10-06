import { Board } from "./board";

describe("Board", () => {
  test("Basic Test", () => {
    let board = new Board({ x: 7, y: 7, hills: ["D4"] });
    expect(board).toBeTruthy();
  });

  test("Board with no Hills", () => {
    let board = new Board({ x: 5, y: 6 });
    expect(board).toBeTruthy();
    expect(board.hills.length).toBe(0);
    expect(board.xAxis.length).toBe(5);
    expect(board.yAxis.length).toBe(6);
  });
});
