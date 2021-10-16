import { useState } from "react";
import { Board } from "../board-logic/board/board";
import { Piece } from "../components/piece/piece";
import { Modal } from "../components/modal";
import Tutorial from "./tutorial/tutorial";
import questionSvg from "./assets/question.svg";
import restartSvg from "./assets/restart.svg";

interface BoardInfoProps {
  board: Board;
  restart: () => void;
  width: number;
  height: number;
}

interface CapturedPiecesProp {
  board: Board;
  colour: "WHITE" | "BLACK";
}

/**
 *
 */
export default function BoardInfo(props: BoardInfoProps) {
  const { board, restart, width, height } = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <div className="koth-board-info" style={{ height, width }}>
      <CapturedPieces board={board} colour={"BLACK"} />
      <div>
        <GameStatus board={board} />
        <hr />
        <div className="koth-btn-controls">
          <button onClick={restart} title="Restart Game">
            <img src={restartSvg} alt="Restart Game" width="20" />
          </button>
          <button onClick={() => setModalIsOpen(true)} className="attention" title="How To Play">
            <img src={questionSvg} alt="How To Play" width="20" />
          </button>
        </div>
      </div>
      <CapturedPieces board={board} colour={"WHITE"} />
      <Modal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} title="HOW TO PLAY">
        <Tutorial />
      </Modal>
    </div>
  );
}
/**
 *
 */
function CapturedPieces(props: CapturedPiecesProp) {
  const { board, colour } = props;
  const capturedPieces = board.state.getCapturedPieces();
  const pieces = capturedPieces
    .filter((piece) => colour === piece.colour)
    .map((piece) => <Piece name={piece.name} colour={colour} key={piece.id} width={45} />);

  return <div className="koth-captured-pieces">{pieces}</div>;
}

/**
 * Display game status
 */
function GameStatus(props: { board: Board }) {
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
