import { useState, useEffect } from "react";
import { Board } from "../../board-logic/board/board";
import BoardView from "../../components/board-view/board-view";
import { PieceName } from "../../board-logic/piece";
import { pieceTutorials } from "./piece-tutorials";
import { playSequence } from "./play-sequence";
import { TutorialPieceSelect } from "./tutorial-piece-select";
import { GameRules } from "./game-rules";

// Make a new 5x5 board to display piece movements
const board = new Board({ x: 5, y: 5 });

/**
 *
 */
export default function Tutorial() {
  const [selectTile, setSelectTile] = useState<null | string>(null);
  const [selectedPiece, setselectedPiece] = useState<PieceName | null>(null);
  const [token, setToken] = useState(0);

  /**
   * This side-effect runs everytime user clicks on a Piece
   * in the tutorial modal.
   */
  useEffect(() => {
    const cleanUp = playSequence(selectedPiece, board, setSelectTile, setToken);
    return cleanUp;
  }, [selectedPiece]);

  let tutContent: JSX.Element;
  // Make sure board is initialised with a state before rendering it
  if (selectedPiece && token !== 0) {
    // If user has selected a piece, display piece description and movement
    // Else show Game rules
    tutContent = (
      <div className="koth-tutorial-moves">
        <div>
          <h3>{selectedPiece}</h3>
          <div dangerouslySetInnerHTML={{ __html: pieceTutorials[selectedPiece].desc }}></div>
        </div>
        <div>
          <br />
          <BoardView
            board={board}
            token={token}
            gameMode="AGAINST_HUMAN"
            playable={false}
            boardMaxWidth={290}
            selectTile={selectTile}
          />
        </div>
      </div>
    );
  } else {
    tutContent = <GameRules totalTurns={board.totalTurns} />;
  }

  return (
    <div className="koth-tutorial">
      <TutorialPieceSelect
        selectedPiece={selectedPiece}
        onPieceClick={(p) => setselectedPiece(p)}
      />
      <hr />
      {tutContent}
    </div>
  );
}
