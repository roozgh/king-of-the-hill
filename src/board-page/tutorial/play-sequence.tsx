import { Dispatch } from "react";
import { Board } from "../../board-logic/board/board";
import { PieceName } from "../../board-logic/piece";
import { pieceTutorials } from "./piece-tutorials";
import { JSONBoardState } from "../../board-logic/board/board-state";

/**
 *
 */
export function playSequence(
  selectedPiece: PieceName | null,
  board: Board,
  setSelectTile: Dispatch<null | string>,
  setToken: Dispatch<number>
) {
  if (!selectedPiece) return;

  // Get all tutorials for selected Piece
  const { moves } = pieceTutorials[selectedPiece];
  // Always start with the first tutorial
  let tutMoveIndex = 0;
  let move: [string, string];
  let boardState: JSONBoardState;

  // Set tutorial state and move
  function initState() {
    move = moves[tutMoveIndex].move;
    boardState = moves[tutMoveIndex].state;
    board.state.setStateFromJSON(boardState);
    setToken(Math.random());
  }
  initState();

  // Sequence of functions to run every 2 seconds
  let sequenceIndex = 0;
  const simulatePlaySequences = [
    () => {
      setSelectTile(move[0]);
      sequenceIndex++;
    },
    () => {
      board.move(move[0], move[1]);
      setSelectTile(null);
      setToken(Math.random());
      sequenceIndex++;
    },
    () => {
      // Set to 0 so the animation sequence restarts
      sequenceIndex = 0;
      // If this was the last tutorial, replay the tutorials
      if (tutMoveIndex + 1 === moves.length) {
        tutMoveIndex = 0;
      }
      // If it wasn't the last tutorial, play the next tutorial
      else {
        tutMoveIndex++;
      }
      // Reset move and state
      initState();
    },
  ];

  // Play each sequence after a 2 sec delay
  const intervalId = window.setInterval(() => {
    simulatePlaySequences[sequenceIndex]();
  }, 1700);

  // Clean up
  return () => {
    setSelectTile(null);
    window.clearInterval(intervalId);
  };
}
