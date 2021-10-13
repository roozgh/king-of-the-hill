import { useState, useEffect } from "react";
import { Board } from "../board-logic/board/board";
import BoardView from "./board-view";
import { PieceName } from "../board-logic/piece";
import { tutTypes } from "./tutorial-types";
import { Piece } from "./piece";
import { JSONBoardState } from "../board-logic/board/board-state";

interface TutorialProps {
  close: () => void;
}

const board = new Board({ x: 5, y: 5 });

/**
 *
 */
export default function Tutorial({ close }: TutorialProps) {
  const [selectTile, setSelectTile] = useState<null | string>(null);
  const [selectedTutPiece, setSelectedTutPiece] = useState<PieceName | null>(null);
  const [token, setToken] = useState(Math.random());

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
    const tutorials = tutTypes[selectedTutPiece].tutorials;
    // Always start with the first tutorial
    let tutItemIndex = 0;
    let move: [string, string];
    let boardState: JSONBoardState;

    // Set tutorial state and move
    function initState() {
      move = tutorials[tutItemIndex].move;
      boardState = tutorials[tutItemIndex].state;
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
        if (tutItemIndex + 1 === tutorials.length) {
          tutItemIndex = 0;
        }
        // If it wasn't the last tutorial, play the next tutorial
        else {
          tutItemIndex++;
        }
        // Reset move and state
        initState();
      },
    ];

    // Play each sequence after a 2 sec delay
    const intervalId = window.setInterval(() => {
      simulatePlaySequences[sequenceIndex]();
    }, 2000);

    // Clean up
    return () => {
      setSelectTile(null);
      window.clearInterval(intervalId);
    };
  }, [selectedTutPiece]);

  /**
   *
   */
  function onPiceClick(pieceName: PieceName) {
    setSelectedTutPiece(pieceName);
  }

  let pieces: JSX.Element[] = [];
  for (let pieceName in tutTypes) {
    let width = 50;
    if (pieceName === selectedTutPiece) width = 60;
    pieces.push(
      <Piece
        name={pieceName as PieceName}
        colour={"WHITE"}
        width={width}
        onPieceClick={() => onPiceClick(pieceName as PieceName)}
        key={pieceName}
      />
    );
  }

  return (
    <>
      <button onClick={close}>Close</button>
      <div className="koth-tutorial">How To Play</div>
      <br />
      {pieces}
      <br />
      {selectedTutPiece && (
        <>
          <div>{tutTypes[selectedTutPiece].desc}</div>
          <BoardView
            board={board}
            token={token}
            gameMode="AGAINST_HUMAN"
            playable={false}
            boardMaxWidth={300}
            selectTile={selectTile}
          />
        </>
      )}
    </>
  );
}
