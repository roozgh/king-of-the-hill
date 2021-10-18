import { useState, useRef, useEffect } from "react";
import { Board } from "../../board-logic/board/board";
import { Modal } from "../../components/modal/modal";
import { CapturedPieces } from "./captured-pieces";
import { GameStatus } from "./game-status";
import Tutorial from "../tutorial/tutorial";
import questionSvg from "../assets/question.svg";
import restartSvg from "../assets/restart.svg";

interface BoardInfoProps {
  board: Board;
  restart: () => void;
  width: number;
  height: number;
  screenSize: string;
}

const tutDoneKey = "koth-done-tutorial";

/**
 *
 */
export default function BoardInfo(props: BoardInfoProps) {
  const { board, restart, width, height, screenSize } = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pieceWidth, setPieceWidth] = useState(50);
  const tutorialBtn = useRef<HTMLButtonElement>(null);

  /**
   * Checks to see if user has opened the tutorial modal before.
   * If the havn't, we highlight the tutorial button with animation.
   */
  useEffect(() => {
    const doneTutorial = localStorage.getItem(tutDoneKey);
    if (doneTutorial) return;
    const btn = tutorialBtn.current;
    let count = 0;
    let intervalId = 0;

    intervalId = window.setInterval(() => {
      if (!btn) return;
      btn.classList.remove("attention");
      // JS trick to force browser to animate
      void btn.offsetWidth;
      btn.classList.add("attention");
      count++;
      // Animate  btn 3 times then remove inetarvel
      if (count === 3) clearInterval(intervalId);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  /**
   *
   */
  useEffect(() => {
    if (screenSize === "lg") {
      setPieceWidth(50);
    } else {
      setPieceWidth(32);
    }
  }, [screenSize]);

  /**
   *
   */
  function onAfterOpen() {
    const doneTutorial = localStorage.getItem(tutDoneKey);
    if (!doneTutorial) {
      localStorage.setItem(tutDoneKey, "1");
    }
  }

  return (
    <div className="koth-board-info" style={{ height, width }}>
      <CapturedPieces board={board} colour={"BLACK"} pieceWidth={pieceWidth} />
      <div>
        <GameStatus
          status={board.state.status}
          turn={board.state.turn}
          totalTurns={board.totalTurns}
        />
        <hr />
        <div className="koth-btn-controls">
          <button onClick={restart} title="Restart Game">
            <img src={restartSvg} alt="Restart Game" width="20" />
          </button>
          <button ref={tutorialBtn} onClick={() => setModalIsOpen(true)} title="How To Play">
            <img src={questionSvg} alt="How To Play" width="20" />
          </button>
        </div>
      </div>
      <CapturedPieces board={board} colour={"WHITE"} pieceWidth={pieceWidth} />
      <Modal
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        onAfterOpen={onAfterOpen}
        title="HOW TO PLAY"
      >
        <Tutorial screenSize={screenSize} />
      </Modal>
    </div>
  );
}
