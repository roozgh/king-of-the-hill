import { Piece } from "./piece";
import { Colour, PieceName } from "../board-logic/piece";

interface TileProps {
  tileKey: string;
  colour: string;
  width: number;
  isHill: boolean;
  turn: string;
  isPossibleMove: boolean;
  isMovingPiece: boolean;
  isPrevMove: boolean;
  onTileClick: any;
  onPieceDrag: any;
  edgeScore?: any;
  onPieceDrop: any;
  onPieceClick: any;
  distanceFromPiece?: number | null;
  piece: { name: PieceName; colour: Colour } | null;
}

export default function Tile(opt: TileProps) {
  let {
    isHill,
    colour,
    width,
    isPossibleMove,
    isMovingPiece,
    turn,
    piece,
    tileKey,
    onTileClick,
    isPrevMove,
    distanceFromPiece,
    onPieceDrag,
    onPieceDrop,
    onPieceClick,
  } = opt;

  /**
   *
   */
  function _onPieceClick(e: any) {
    e.stopPropagation();
    onPieceClick(tileKey);
  }

  /**
   *
   */
  function _onPieceDrag(e: any) {
    onPieceDrag(tileKey);
  }

  /**
   *
   */
  function onMouseUp(e: any) {
    e.stopPropagation();
    onPieceDrop(tileKey);
  }

  /**
   *
   */
  function onClick(e: any) {
    onTileClick(tileKey);
  }

  let classes = ["tile"];
  if (isPrevMove) classes.push("prev-move");

  if (turn === "BLACK") classes.push("red-turn");
  else classes.push("blue-turn");

  if (isMovingPiece) classes.push("moving-piece");
  if (isHill) classes.push("hill");

  if (colour === "DARK") classes.push("dark");
  else classes.push("light");

  let tileStyle = { width, height: width };

  let highlightHtml = null;
  if (isPossibleMove || isPrevMove) {
    let style: any = {};
    if (distanceFromPiece) {
      style.animationDelay = (distanceFromPiece - 1) / 15 + "s";
    }
    highlightHtml = (
      <>
        <div className="highlight-corner highlight-top-right" style={style}></div>
        <div className="highlight-corner highlight-top-left" style={style}></div>
        <div className="highlight-corner highlight-bottom-left" style={style}></div>
        <div className="highlight-corner highlight-bottom-right" style={style}></div>
      </>
    );
  }

  let pieceElement = null;
  if (piece) {
    pieceElement = (
      <Piece
        name={piece.name}
        colour={piece.colour}
        isHill={isHill}
        onPieceDrag={_onPieceDrag}
        onPieceClick={_onPieceClick}
      />
    );
  }

  return (
    <div onMouseUp={onMouseUp} onClick={onClick} className={classes.join(" ")} style={tileStyle}>
      <div className="tile-inner">
        {pieceElement}
        {highlightHtml}
      </div>
    </div>
  );
}
