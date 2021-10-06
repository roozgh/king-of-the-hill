import { getMoveCandidates } from "./move-finder";

describe("Move Finder", () => {
  test("Basic Test", () => {
    let data: any = [
      {
        move: ["D2", "D3"],
        score: 2,
        replies: [
          // 1, 6, 0(6)
          { score: 1, replies: [{ score: 3 }, { score: -1 }] }, // 3
          { score: 6, replies: [{ score: 6 }, { score: -3 }] }, // 6
          { score: 0, replies: [{ score: 12 }, { score: 11 }] }, // 12
        ],
      },

      {
        move: ["E2", "E3"],
        score: 1,
        replies: [
          // 1, 3, 2(-1)
          { score: 0, replies: [{ score: -1 }, { score: -3 }] }, // -1
          { score: 3, replies: [{ score: 3 }, { score: 1 }] }, // 3
          { score: 2, replies: [{ score: 12 }, { score: 2 }] }, // 12
        ],
      },
    ];

    //let result = getBestMove(data);
    //expect(result[0].move).toBe(["D2", "D3"]);
  });
});
