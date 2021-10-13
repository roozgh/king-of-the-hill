import { useState } from "react";
import { Board } from "../board-logic/board/board";
import { Piece } from "./piece";
import Modal from "react-modal";
import Tutorial from "./tutorial";

const modalStyles = {
  overlay: { zIndex: 1000 },
  content: {
    //width: "100%",
    height: "100%",
    transition: "all 1s",

    //transform: "translate(-50%, -50%)",
    //top: "50%",
    //left: "50%",
    //right: "auto",
    //bottom: "auto",
    //marginRight: "-50%",
    //transform: "translate(-50%, -50%)",
  },
};

Modal.setAppElement("#root");

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

  let turnInfo = "";

  switch (board.state.status) {
    case "ACTIVE":
      turnInfo = `TURN: ${board.state.turn} / ${board.state.totalTurns}`;
      break;
    case "DRAW":
      turnInfo = "Game Drawn";
      break;
    case "WHITE":
      turnInfo = "Blue won!";
      break;
    case "BLACK":
      turnInfo = "Red won!";
      break;
    default:
      throw Error(`Invalid Board Status: ${board.state.status}`);
  }

  return (
    <div className="koth-board-info" style={{ height, width }}>
      <CapturedPieces board={board} colour={"BLACK"} />
      <div>
        {turnInfo}
        <hr />
        <button onClick={restart}>RESTART</button>
        <button onClick={() => setModalIsOpen(true)}>LEARN TO PLAY</button>
      </div>
      <CapturedPieces board={board} colour={"WHITE"} />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen((val) => !val)}
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        style={modalStyles}
        //onAfterOpen={afterOpenModal}
        //onRequestClose={closeModal}
        contentLabel="Example Modal"
      >
        <Tutorial close={() => setModalIsOpen(false)} />
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
    .map((piece) => <Piece name={piece.name} colour={colour} width={45} />);

  return <div className="koth-captured-pieces">{pieces}</div>;
}
