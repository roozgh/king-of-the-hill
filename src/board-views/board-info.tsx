import { useState, ReactNode } from "react";
import { Board } from "../board-logic/board/board";
import { Piece } from "./piece";

interface BoardInfoProps {
  board: Board;
  children: ReactNode;
}

/**
 *
 */
export default function BoardInfo(props: BoardInfoProps) {
  const { board, children } = props;

  return (
    <div className="koth-board-con">
      <div className="koth-board-header">
        Turn: {board.state.turn} / {board.state.totalTurns}
        {children}
      </div>
    </div>
  );
}
