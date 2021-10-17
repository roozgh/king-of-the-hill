import { Board } from "../../board-logic/board/board";

/**
 * Display game status
 */
export function GameStatus(props: { board: Board }) {
  const { board } = props;
  let txt = "";
  switch (board.state.status) {
    case "ACTIVE":
      txt = `TURN: ${board.state.turn} / ${board.totalTurns}`;
      break;
    case "DRAW":
      txt = "Game Drawn";
      break;
    case "WHITE":
      txt = "Blue Won!";
      break;
    case "BLACK":
      txt = "Red Won!";
      break;
    default:
      throw Error(`Invalid board Status: ${board.state.status}`);
  }

  return <div className="koth-game-status">{txt}</div>;
}
