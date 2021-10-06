import { Board } from "./board";

describe("Move Finder", () => {
  test("Basic Test", () => {
    let board = new Board({ x: 7, y: 7, hills: ["D4"] });
    expect(board).toBeTruthy();
  });
});
