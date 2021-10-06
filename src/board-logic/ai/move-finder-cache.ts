import { Board } from "../board/board";

type Cache = [string, number];

let cache: Cache[] = [];

/**
 *
 */
export function findPosition(board: Board): { hash: string; score?: number } {
  let score;
  let hash = makeHashFromBoard(board);
  //console.log(hash);
  let found = cache.find((item) => item[0] === hash);
  if (found) score = found[1];
  return { hash, score };
}

/**
 *
 */
export function storePosition(hash: string, score: number) {
  cache.push([hash, score]);
  // @TODO Empty cache if too big
}

/**
 *
 */
function makeHashFromBoard(board: Board) {
  let tiles = Array.from(board.state.getState()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  let hash = tiles
    .map(([key, piece]) => {
      return key + piece.colour === "BLACK" ? "R" : "B" + piece.name;
    })
    .join("-");
  return hash;
}
