import { Tile, TileColour } from "./tile";

export type MoveDirections = Array<0 | 1 | -1>;

/**
 * 'TELE_' moves are special SPY moves that help SPY
 * move from edge of the board to the other edge
 */
export type Direction =
  | "UP"
  | "RIGHT"
  | "DOWN"
  | "LEFT"
  | "UP_RIGHT"
  | "DOWN_RIGHT"
  | "DOWN_LEFT"
  | "UP_LEFT"
  | "TELE_UP"
  | "TELE_RIGHT"
  | "TELE_DOWN"
  | "TELE_LEFT"
  | "TELE_UP_RIGHT"
  | "TELE_DOWN_RIGHT"
  | "TELE_DOWN_LEFT"
  | "TELE_UP_LEFT";

type NeighbourFinderConfig = { xAxis: string[]; yAxis: string[]; x: number; y: number };

type NeighbourFinder = (config: NeighbourFinderConfig) => string | undefined;

type NeighbourFinderMap = Map<Direction, NeighbourFinder>;

const getLast = (arr: string[]) => arr[arr.length - 1];
const isLast = (index: number, arr: string[]) => index === arr.length - 1;
/**
 *
 */
function findAdjacentTile(
  config: NeighbourFinderConfig,
  xIncrement: number,
  yIncrement: number
): string | undefined {
  let { xAxis, yAxis, x, y } = config;
  if (xAxis[x + xIncrement] && yAxis[y + yIncrement]) {
    return xAxis[x + xIncrement] + yAxis[y + yIncrement];
  }
}

const neighbourFinderMap: NeighbourFinderMap = new Map([
  ["UP", (c) => findAdjacentTile(c, 0, -1)],
  ["RIGHT", (c) => findAdjacentTile(c, 1, 0)],
  ["DOWN", (c) => findAdjacentTile(c, 0, 1)],
  ["LEFT", (c) => findAdjacentTile(c, -1, 0)],
  ["UP_RIGHT", (c) => findAdjacentTile(c, 1, 1)],
  ["DOWN_RIGHT", (c) => findAdjacentTile(c, 1, -1)],
  ["DOWN_LEFT", (c) => findAdjacentTile(c, -1, -1)],
  ["UP_LEFT", (c) => findAdjacentTile(c, -1, 1)],

  [
    "TELE_UP",
    (c) => {
      if (c.y !== 0) return undefined;
      if (c.xAxis[c.x] && c.yAxis[c.yAxis.length - 1]) {
        return c.xAxis[c.x] + c.yAxis[c.yAxis.length - 1];
      }
    },
  ],

  [
    "TELE_RIGHT",
    (c) => {
      if (c.x !== c.xAxis.length - 1) return undefined;
      if (c.xAxis[c.xAxis.length - 1] && c.yAxis[c.y]) {
        return c.xAxis[0] + c.yAxis[c.y];
      }
    },
  ],

  [
    "TELE_DOWN",
    (c) => {
      if (c.y !== c.yAxis.length - 1) return undefined;
      if (c.xAxis[c.x] && c.yAxis[0]) {
        return c.xAxis[c.x] + c.yAxis[0];
      }
    },
  ],

  [
    "TELE_LEFT",
    (c) => {
      if (c.x !== 0) return undefined;
      if (c.xAxis[c.xAxis.length - 1] && c.yAxis[c.y]) {
        return c.xAxis[c.xAxis.length - 1] + c.yAxis[c.y];
      }
    },
  ],

  [
    "TELE_UP_RIGHT",
    (c) => {
      if (isLast(c.x, c.xAxis) && c.y === 0) return c.xAxis[0] + getLast(c.yAxis);
      else if (isLast(c.x, c.xAxis)) return c.xAxis[0] + c.yAxis[c.y - 1];
      else if (c.y === 0) return c.xAxis[c.x + 1] + getLast(c.yAxis);
    },
  ],

  [
    "TELE_UP_LEFT",
    (c) => {
      if (c.x === 0 && c.y === 0) return c.xAxis[c.xAxis.length - 1] + c.yAxis[c.yAxis.length - 1];
      else if (c.x === 0) return c.xAxis[c.xAxis.length - 1] + c.yAxis[c.y - 1];
      else if (c.y === 0) return c.xAxis[c.x - 1] + c.yAxis[c.yAxis.length - 1];
    },
  ],

  [
    "TELE_DOWN_RIGHT",
    (c) => {
      if (isLast(c.x, c.xAxis) && isLast(c.y, c.yAxis)) return c.xAxis[0] + c.yAxis[0];
      else if (isLast(c.x, c.xAxis)) return c.xAxis[0] + c.yAxis[c.y + 1];
      else if (isLast(c.y, c.yAxis)) return c.xAxis[c.x + 1] + c.yAxis[0];
    },
  ],

  [
    "TELE_DOWN_LEFT",
    (c) => {
      if (c.x === 0 && c.y === c.yAxis.length - 1) return getLast(c.xAxis) + c.yAxis[0];
      else if (c.x === 0) return getLast(c.xAxis) + c.yAxis[c.y + 1];
      else if (c.y === c.yAxis.length - 1) return c.xAxis[c.x - 1] + c.yAxis[0];
    },
  ],
]);

interface TileMakerConfig {
  xAxis: string[];
  yAxis: string[];
  hills?: string[];
}

/**
 *
 */
export function makeBoardTilesFromAxis({
  hills,
  xAxis,
  yAxis,
}: TileMakerConfig): Map<string, Tile> {
  let tiles: Map<string, Tile> = new Map();

  // Reverse Y Axis array so that first Rank is at bottom of board
  // This way top left Tile is 'A7' and bottom left Tile is 'A1'
  yAxis.reverse();

  // Create Board Tiles with empty Neighbours
  xAxis.forEach((xValue, x) => {
    yAxis.forEach((yValue, y) => {
      let key = xValue + yValue;
      let isHill = hills ? hills.includes(key) : false;
      let xEdge = getEdgeScore(xAxis.length, x);
      let yEdge = getEdgeScore(yAxis.length, y);
      let colour = getTileColour(x, y);
      let tile = new Tile({ key, x, y, colour, isHill, xEdge, yEdge });
      tiles.set(key, tile);
    });
  });

  // Populate Neighbours
  tiles.forEach((tile, tileKey) => {
    let { x, y } = tile;
    neighbourFinderMap.forEach((finder, direction) => {
      let neighbourKey = finder({ x, y, xAxis, yAxis });
      if (neighbourKey) {
        let neighbour = tiles.get(neighbourKey);
        if (neighbour) tile.neighbours.set(direction, neighbour);
      }
    });
  });

  return tiles;
}

/**
 * Whether Tile is Dark or Light
 */
function getTileColour(x: number, y: number): TileColour {
  if (y % 2 === 0) {
    if (x % 2 === 0) return "DARK";
    else return "LIGHT";
  } else {
    if (x % 2 === 0) return "LIGHT";
    else return "DARK";
  }
}

/**
 * Calculate how far from the center the Tile is
 */
function getEdgeScore(boardWidth: number, tileIndex: number) {
  let centrePosition = Math.floor(boardWidth / 2);
  let distanceFromCentre = Math.abs(centrePosition - tileIndex);
  return Math.round(distanceFromCentre);
}
