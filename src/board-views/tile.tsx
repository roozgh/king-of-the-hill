import { useContext } from "react";
import { BoardViewContext } from "./board-view-reducer";
import { Piece } from "./piece";
import { Colour, PieceName } from "../board-logic/piece";

interface TileProps {
  tileKey: string;
  colour: string;
  width: number;
  isHill: boolean;
  isPossibleMove: boolean;
  isMovingPiece: boolean;
  isPrevMove: boolean;
  edgeScore?: any;
  distanceFromPiece?: number | null;
  piece: { name: PieceName; colour: Colour } | null;
  playable: boolean;
  onPieceMove: (from: string, to: string) => void;
}

export default function Tile(opt: TileProps) {
  const {
    isHill,
    colour,
    width,
    isPossibleMove,
    isMovingPiece,
    piece,
    tileKey,
    isPrevMove,
    distanceFromPiece,
    playable,
    onPieceMove,
  } = opt;

  const [state, dispatch] = useContext(BoardViewContext);
  if (!state.board) throw Error("Board not defined");

  /**
   * For detecting piece drops on tile
   */
  function onMouseUp(e: any) {
    e.stopPropagation();
    if (!state.draging) return;
    if (!state.selectedTile) return;
    if (!state.possibleMoves) throw Error("possibleMove Array not set");
    // Check if move is legal
    let moveIsLegal = state.possibleMoves.includes(tileKey);
    // If move not legal, clear board
    if (!moveIsLegal) {
      dispatch({ type: "NO_TILE_SELECTED" });
    }
    // Else make move
    else {
      console.log("dropped");
      onPieceMove(state.selectedTile, tileKey);
    }
  }

  /**
   *
   */
  function onClick(e: any) {
    e.stopPropagation();
    if (!playable || !state.selectedTile) return;
    if (!state.possibleMoves) throw Error("possibleMove Array not set");
    // Check if move is legal
    let moveIsLegal = state.possibleMoves.includes(tileKey);
    // If move not legal, clear board
    if (!moveIsLegal) {
      dispatch({ type: "NO_TILE_SELECTED" });
    }
    // Else make move
    else {
      onPieceMove(state.selectedTile, tileKey);
    }
  }

  let classes = ["tile"];
  if (isPrevMove) classes.push("prev-move");

  if (state.board.state.player === "BLACK") classes.push("red-turn");
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
        tile={tileKey}
        isHill={isHill}
        playable={playable}
        onPieceMove={onPieceMove}
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
