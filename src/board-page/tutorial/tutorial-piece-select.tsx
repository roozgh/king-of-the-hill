import { PieceName } from "../../board-logic/piece";
import { pieceTutorials } from "./piece-tutorials";
import { Piece } from "../../components/piece/piece";

interface TutorialPieceSelectProps {
  selectedPiece: PieceName | null;
  pieceWidth: number;
  onPieceClick: (name: PieceName) => void;
}

/**
 *
 */
export function TutorialPieceSelect(props: TutorialPieceSelectProps) {
  const { selectedPiece, pieceWidth, onPieceClick } = props;
  let pieces: JSX.Element[] = [];
  for (let pieceName in pieceTutorials) {
    let wrapperDivClass = "";
    if (pieceName === selectedPiece) wrapperDivClass = "selected";
    pieces.push(
      <div
        key={pieceName}
        className={wrapperDivClass}
        title={pieceName}
        onClick={() => onPieceClick(pieceName as PieceName)}
      >
        <Piece name={pieceName as PieceName} colour={"WHITE"} width={pieceWidth} />
      </div>
    );
  }
  return <div className="koth-tutorial-top">{pieces}</div>;
}
