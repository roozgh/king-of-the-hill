import { useRef, CSSProperties, MouseEvent } from "react";
import { Colour, PieceName } from "../board-logic/piece";

import whiteKing from "./images/white/king.png";
import whiteMagician from "./images/white/magician.png";
import whiteSpy from "./images/white/spy.png";
import whiteTower from "./images/white/tower.png";
import whiteArcher from "./images/white/archer.png";
import whiteChariot from "./images/white/chariot.png";

import blackKing from "./images/black/king.png";
import blackMagician from "./images/black/magician.png";
import blackSpy from "./images/black/spy.png";
import blackTower from "./images/black/tower.png";
import blackArcher from "./images/black/archer.png";
import blackChariot from "./images/black/chariot.png";

//import goldenKing from "./images/golden-king.png";

type PieceImages = {
  [key in Colour]: {
    [key in PieceName]: string;
  };
};

const pieceImages: PieceImages = {
  WHITE: {
    KING: whiteKing,
    MAGICIAN: whiteMagician,
    SPY: whiteSpy,
    TOWER: whiteTower,
    ARCHER: whiteArcher,
    CHARIOT: whiteChariot,
  },
  BLACK: {
    KING: blackKing,
    MAGICIAN: blackMagician,
    SPY: blackSpy,
    TOWER: blackTower,
    ARCHER: blackArcher,
    CHARIOT: blackChariot,
  },
};

export interface PieceProps {
  name: PieceName;
  colour: Colour;
  width: number;
  movable?: boolean;
  position?: { x: number; y: number };
  onPieceDrag?: () => void;
  onPieceClick?: () => void;
}

export function Piece(opts: PieceProps) {
  const { name, colour, movable, width, position, onPieceDrag, onPieceClick } = opts;
  const mouseDown = useRef(false);
  const pieceImage = pieceImages[colour][name];

  /**
   * Firefox image drag fix
   */
  function onDragStart(e: MouseEvent) {
    e.preventDefault();
  }

  /**
   *
   */
  function onMouseDown(e: MouseEvent) {
    e.stopPropagation();
    if (!movable) return;
    mouseDown.current = true;
  }

  /**
   *
   */
  function onMouseUp(e: MouseEvent) {
    if (!movable) return;
    mouseDown.current = false;
  }

  /**
   *
   */
  function onMouseMove(e: MouseEvent) {
    if (!onPieceDrag) return;
    if (mouseDown.current) {
      onPieceDrag();
    }
  }

  /**
   *
   */
  function onClick(e: MouseEvent) {
    if (!onPieceClick) return;
    if (!movable) return;
    e.stopPropagation();
    onPieceClick();
  }

  let style: CSSProperties = { width, height: width };
  if (movable) style.cursor = "grab";
  // When piece is being dragged
  if (position) {
    style.position = "absolute";
    style.zIndex = 10;
    style.left = position.x - width / 2;
    style.top = position.y - width / 2;
    style.transform = "scale(1.2)";
    // CSS trick for 'mouseup' event fire on Tile.
    style.pointerEvents = "none";
  }

  return (
    <img
      src={pieceImage}
      alt={name}
      draggable={false}
      style={style}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onDragStart={onDragStart}
      className={`piece ${colour === "WHITE" ? "blue" : "red"}`}
    />
  );
}
