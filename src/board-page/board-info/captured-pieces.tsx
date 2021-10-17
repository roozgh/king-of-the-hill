import { Board } from "../../board-logic/board/board";
import { Piece } from "../../components/piece/piece";

interface CapturedPiecesProp {
  board: Board;
  colour: "WHITE" | "BLACK";
}

/**
 *
 */
export function CapturedPieces(props: CapturedPiecesProp) {
  const { board, colour } = props;
  const capturedPieces = board.state.getCapturedPieces();
  const pieces = capturedPieces
    .filter((piece) => colour === piece.colour)
    .map((piece) => <Piece name={piece.name} colour={colour} key={piece.id} width={45} />);

  return <div className="koth-captured-pieces">{pieces}</div>;
}
