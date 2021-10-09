import { useState, ReactNode } from "react";
import { Board } from "../board-logic/board/board";
import { Piece } from "./piece";

interface BoardInfoProps {
  board: Board;
  colour: "WHITE" | "BLACK";
}

/**
 *
 */
export default function CapturedPieces(props: BoardInfoProps) {
  const { board, colour } = props;
  const capturedPieces = board.state.getCompleteState().capturedPieces;
  const pieces = capturedPieces
    .filter((piece) => colour === piece.colour)
    .map((piece) => <Piece name={piece.name} colour={colour} width={50} />);

  return <div className="koth-captured-pieces">{pieces}</div>;
}
