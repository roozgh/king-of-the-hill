import { useContext, useRef, useEffect, useCallback } from "react";
import { BoardViewContext } from "./board-view";
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

import goldenKing from "./images/golden-king.png";

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
  isHill: boolean;
  onPieceDrag: any;
  onPieceClick: any;
}

export function Piece({ name, colour, isHill, onPieceDrag, onPieceClick }: PieceProps) {
  let context = useContext(BoardViewContext);
  let ref = useRef(null) as any;
  let dragCoords: any = useRef({ x: 0, y: 0 });
  let mouseDown = useRef(false);
  const { gameMode, playerTurn, humanPlayer, status } = context;

  let canMovePiece = false;
  // If game is not over and not 'busy' e.g in midle of animation
  if (status === "ACTIVE") {
    if (gameMode === "AGAINST_CPU") {
      if (humanPlayer === colour && playerTurn === colour) {
        canMovePiece = true;
      }
    } else if (gameMode === "AGAINST_HUMAN") {
      if (playerTurn === colour) {
        canMovePiece = true;
      }
    }
  }

  /**
   *
   */
  const onWindowMouseMove = useCallback((e) => {
    if (ref.current) {
      let transformX = e.clientX - dragCoords.current.x;
      let transformY = e.clientY - dragCoords.current.y;
      ref.current.style.transform = `translate(${transformX}px, ${transformY}px) scale(1.2)`;
    } else {
      window.removeEventListener("mousemove", onWindowMouseMove);
    }
  }, []);

  /**
   *
   */
  useEffect(() => {
    // When user drops piece outside Board
    if (!context.draging && mouseDown.current === false) {
      if (ref.current) {
        ref.current.style.transform = "none";
        ref.current.style.pointerEvents = "auto";
        ref.current.style.zIndex = "10";
      }
      mouseDown.current = false;
      window.removeEventListener("mousemove", onWindowMouseMove);
    }
  }, [onWindowMouseMove, context.draging]);

  /**
   *
   */
  function onMouseMove(e: any) {
    if (!canMovePiece) return;
    if (mouseDown.current) {
      e.stopPropagation();
      mouseDown.current = false;
      dragCoords.current = {
        x: e.clientX,
        y: e.clientY,
      };
      // Trick to make mouse Events go through piece
      ref.current.style.pointerEvents = "none";
      ref.current.style.zIndex = "11";
      window.addEventListener("mousemove", onWindowMouseMove);
      onPieceDrag(e);
    }
  }

  /**
   * Firefox image drag fix
   */
  function onDragStart(e: any) {
    e.preventDefault();
  }

  /**
   *
   */
  function onMouseDown(e: any) {
    e.stopPropagation();
    if (!canMovePiece) return;
    mouseDown.current = true;
  }

  /**
   *
   */
  function onMouseUp(e: any) {
    if (!canMovePiece) return;
    mouseDown.current = false;
  }

  /**
   *
   */
  function onClick(e: any) {
    if (!canMovePiece) return;
    e.stopPropagation();
    onPieceClick(e);
  }

  let style: any = {};
  if (canMovePiece) style.cursor = "grab";

  let image = pieceImages[colour][name];
  // If King Of The Hill
  if (context.status === colour && name === "KING" && isHill) {
    image = goldenKing;
  }

  return (
    <img
      ref={ref}
      src={image}
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
