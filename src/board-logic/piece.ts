import { Direction } from "./tile-maker";

export type Colour = "BLACK" | "WHITE";

type PieceMoves = Array<{
  type: "LINEAR" | "CONTINUOUS" | "JUMP";
  direction: Direction | Direction[];
}>;

interface PieceDesc {
  isTakable: boolean;
  canTake: boolean;
  value: number;
  moveSets: PieceMoves;
  edgePreference: { x: number; y: number };
}

export type PieceName = "KING" | "TOWER" | "CHARIOT" | "SPY" | "ARCHER" | "MAGICIAN";

export const pieceDescMap: Map<PieceName, PieceDesc> = new Map([
  [
    "KING",
    {
      isTakable: true,
      canTake: true,
      value: 1000,
      moveSets: [
        { type: "LINEAR", direction: ["UP"] },
        { type: "LINEAR", direction: ["RIGHT"] },
        { type: "LINEAR", direction: ["DOWN"] },
        { type: "LINEAR", direction: ["LEFT"] },
        { type: "LINEAR", direction: ["UP_RIGHT"] },
        { type: "LINEAR", direction: ["DOWN_RIGHT"] },
        { type: "LINEAR", direction: ["DOWN_LEFT"] },
        { type: "LINEAR", direction: ["UP_LEFT"] },
      ],
      edgePreference: { x: -2, y: -2 },
    },
  ],

  [
    "TOWER",
    {
      isTakable: false,
      canTake: false,
      value: 1,
      moveSets: [
        { type: "LINEAR", direction: ["UP"] },
        { type: "LINEAR", direction: ["RIGHT"] },
        { type: "LINEAR", direction: ["DOWN"] },
        { type: "LINEAR", direction: ["LEFT"] },
      ],
      edgePreference: { x: 0, y: -2 },
    },
  ],

  [
    "CHARIOT",
    {
      isTakable: true,
      canTake: true,
      value: 20,
      moveSets: [
        { type: "LINEAR", direction: ["UP", "UP", "UP"] },
        { type: "LINEAR", direction: ["DOWN", "DOWN", "DOWN"] },
        { type: "CONTINUOUS", direction: "RIGHT" },
        { type: "CONTINUOUS", direction: "LEFT" },
      ],
      edgePreference: { x: 0, y: -1 },
    },
  ],

  [
    "ARCHER",
    {
      isTakable: true,
      canTake: true,
      value: 15,
      moveSets: [
        { type: "JUMP", direction: ["UP_RIGHT", "UP_RIGHT"] },
        { type: "JUMP", direction: ["DOWN_RIGHT", "DOWN_RIGHT"] },
        { type: "JUMP", direction: ["DOWN_LEFT", "DOWN_LEFT"] },
        { type: "JUMP", direction: ["UP_LEFT", "UP_LEFT"] },
      ],
      edgePreference: { x: -1, y: -1 },
    },
  ],

  [
    "MAGICIAN",
    {
      isTakable: true,
      canTake: false,
      value: 15,
      moveSets: [
        { type: "CONTINUOUS", direction: "UP" },
        { type: "CONTINUOUS", direction: "RIGHT" },
        { type: "CONTINUOUS", direction: "DOWN" },
        { type: "CONTINUOUS", direction: "LEFT" },
        { type: "CONTINUOUS", direction: "UP_RIGHT" },
        { type: "CONTINUOUS", direction: "DOWN_RIGHT" },
        { type: "CONTINUOUS", direction: "DOWN_LEFT" },
        { type: "CONTINUOUS", direction: "UP_LEFT" },
      ],
      edgePreference: { x: 0, y: 0 },
    },
  ],

  [
    "SPY",
    {
      isTakable: true,
      canTake: true,
      value: 25,
      moveSets: [
        { type: "LINEAR", direction: ["UP"] },
        { type: "LINEAR", direction: ["RIGHT"] },
        { type: "LINEAR", direction: ["DOWN"] },
        { type: "LINEAR", direction: ["LEFT"] },
        { type: "LINEAR", direction: ["UP_RIGHT"] },
        { type: "LINEAR", direction: ["DOWN_RIGHT"] },
        { type: "LINEAR", direction: ["DOWN_LEFT"] },
        { type: "LINEAR", direction: ["UP_LEFT"] },
        { type: "LINEAR", direction: ["TELE_UP"] },
        { type: "LINEAR", direction: ["TELE_RIGHT"] },
        { type: "LINEAR", direction: ["TELE_DOWN"] },
        { type: "LINEAR", direction: ["TELE_LEFT"] },
        { type: "LINEAR", direction: ["TELE_UP_RIGHT"] },
        { type: "LINEAR", direction: ["TELE_UP_LEFT"] },
        { type: "LINEAR", direction: ["TELE_DOWN_RIGHT"] },
        { type: "LINEAR", direction: ["TELE_DOWN_LEFT"] },
      ],
      edgePreference: { x: 0, y: 0 },
    },
  ],
]);

export class Piece {
  name: PieceName;
  id: number;
  colour: Colour;
  isTakable: boolean;
  canTake: boolean;
  value: number;
  moveSets: PieceMoves;
  edgePreference: { x: number; y: number };

  constructor(pieceDesc: PieceDesc, name: PieceName, colour: Colour) {
    let { isTakable, canTake, value, moveSets, edgePreference } = pieceDesc;
    this.id = Math.floor(Math.random() * 10000000);
    this.name = name;
    this.colour = colour;
    this.isTakable = isTakable;
    this.canTake = canTake;
    this.value = value;
    this.moveSets = moveSets;
    this.edgePreference = { x: edgePreference.x, y: edgePreference.y };
  }
}

/**
 *
 */
export function makePiece(name: PieceName, colour: Colour) {
  let pieceDesc = pieceDescMap.get(name);
  if (!pieceDesc) throw Error("Invalid Piece name: " + name);
  return new Piece(pieceDesc, name, colour);
}
