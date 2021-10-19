import { Direction } from "./tile-maker";

export type TileColour = "DARK" | "LIGHT";

export type TileConfig = {
  key: string;
  x: number;
  y: number;
  isHill: boolean;
  xEdge: number; // Indication how far the tile is away from the centre
  yEdge: number;
  colour: TileColour;
};

export class Tile {
  key: string;
  x: number;
  y: number;
  colour: TileColour;
  neighbours: Map<Direction, Tile>;
  isHill: boolean;
  xEdge: number;
  yEdge: number;

  constructor({ key, x, y, colour, isHill, xEdge, yEdge }: TileConfig) {
    this.key = key;
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.neighbours = new Map();
    this.isHill = isHill;
    this.xEdge = xEdge;
    this.yEdge = yEdge;
  }

  /**
   *
   */
  walk(direction: Direction) {
    return this.neighbours.get(direction);
  }
}
