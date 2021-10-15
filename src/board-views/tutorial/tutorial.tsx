import { useState, useEffect, useRef } from "react";
import { Board } from "../../board-logic/board/board";
import BoardView from "../board-view";
import { PieceName } from "../../board-logic/piece";
import { pieceTutorials } from "./piece-tutorials";
import { Piece } from "../piece";
import { JSONBoardState } from "../../board-logic/board/board-state";

const board = new Board({ x: 5, y: 5 });

const gameRulesTxt = `
King Of The Hill is a turn based strategy game similar to Chess. There are 2 ways to win: 
<br/>
<ol>
<li><u title='Take an oponent piece with your piece'>Capture</u> the oponent King.</li>
<li>
  Move your King to the <u title='Hill is the golden tile in the middle of the board'>Hill</u> Tile 
  <u title='Cannot be captured or moved on next turn'>uncontested</u>. Uncontested means it cannot be captured or moved by thr opponent on next turn.
</li>
</ol>
Each game lasts ${board.totalTurns} turns. Like Chess, each piece has a unique set of moves. 
Some pieces have special moves and properties. You can learn about piece movement by clickng on piece icons above.
`;

/**
 *
 */
export default function Tutorial() {
  const [selectTile, setSelectTile] = useState<null | string>(null);
  const [selectedTutPiece, setSelectedTutPiece] = useState<PieceName | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    return () => console.log("TUT CLEAN UP");
  }, []);

  /**
   * This side-effect runs everytime user clicks on a Piece
   * in the tutorial modal.
   */
  useEffect(() => {
    if (!selectedTutPiece) return;

    // Get all tutorials for selected Piece
    const { moves } = pieceTutorials[selectedTutPiece];
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
  }, [selectedTutPiece]);

  /**
   *
   */
  let pieces: JSX.Element[] = [];
  for (let pieceName in pieceTutorials) {
    let width = 60;
    let wrapperDivClass = "";
    if (pieceName === selectedTutPiece) wrapperDivClass = "selected";
    pieces.push(
      <div
        key={pieceName}
        className={wrapperDivClass}
        title={pieceName}
        onClick={() => setSelectedTutPiece(pieceName as PieceName)}
      >
        <Piece name={pieceName as PieceName} colour={"WHITE"} width={width} />
      </div>
    );
  }

  let tutContent: JSX.Element;

  // Make sure board is initialised with a state before rendering it
  if (selectedTutPiece && token !== 0) {
    tutContent = (
      <div className="koth-tutorial-moves">
        <div>
          <h3>{selectedTutPiece}</h3>
          <div dangerouslySetInnerHTML={{ __html: pieceTutorials[selectedTutPiece].desc }}></div>
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
    tutContent = (
      <div dangerouslySetInnerHTML={{ __html: gameRulesTxt }} className="koth-tutorial-rules"></div>
    );
  }

  return (
    <div className="koth-tutorial">
      <div className="koth-tutorial-top"> {pieces}</div>
      <hr />
      {tutContent}
    </div>
  );
}
