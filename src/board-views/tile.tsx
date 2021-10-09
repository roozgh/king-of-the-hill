import { useContext, CSSProperties, MouseEvent } from "react";
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
  //console.log("TILE RENDER");
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
   *
   */
  function makeMove(from: string, to: string) {
    dispatch({ type: "MOVE", from, to });
    onPieceMove(from, to);
  }

  /**
   * For detecting piece drops on tile
   */
  function onMouseUp(e: MouseEvent) {
    e.stopPropagation();
    if (!state.draggedPiece) return;
    if (!state.selectedTile) return;
    if (!state.possibleMoves) throw Error("'possibleMove' Array not set");
    // Check if move is legal
    let moveIsLegal = state.possibleMoves.includes(tileKey);
    // If move not legal, clear board
    if (!moveIsLegal) {
      dispatch({ type: "NO_TILE_SELECTED" });
    }
    // Else make move
    else {
      makeMove(state.selectedTile, tileKey);
    }
  }

  /**
   *
   */
  function onPieceDrag() {
    if (!piece) return;
    const { name, colour } = piece;
    dispatch({ type: "PIECE_DRAG", name, colour, tile: tileKey });
  }

  /**
   *
   */
  function onPieceClick() {
    if (!piece) return;
    if (state.selectedTile) {
      if (!state.possibleMoves) throw Error("'possibleMove' Array not set");
      // Check if move is legal
      let moveIsLegal = state.possibleMoves.includes(tileKey);
      // If move not legal, clear board
      if (!moveIsLegal) {
        dispatch({ type: "NO_TILE_SELECTED" });
      } else {
        makeMove(state.selectedTile, tileKey);
      }
    } else {
      dispatch({ type: "PIECE_CLICK", tile: tileKey });
    }
  }

  /**
   *
   */
  function onClick(e: MouseEvent) {
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
      makeMove(state.selectedTile, tileKey);
    }
  }

  let classes = ["tile"];

  if (state.board.state.player === "BLACK") classes.push("red-turn");
  else classes.push("blue-turn");

  if (isMovingPiece) classes.push("moving-piece");
  if (isHill) classes.push("hill");

  if (colour === "DARK") classes.push("dark");
  else classes.push("light");

  let tileStyle = { width, height: width };

  let highlightHtml = null;
  if (isPossibleMove || isPrevMove) {
    // Only show 'previous move' when tile is no a 'possible move'
    if (isPrevMove && !isPossibleMove) classes.push("prev-move");

    let style: CSSProperties = {};
    if (distanceFromPiece) {
      style.animationDelay = (distanceFromPiece - 1) / 10 + "s";
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

  let pieceWidth = width - 20;
  if (state.selectedTile === tileKey) {
    pieceWidth = width - 10;
  }

  let pieceElement = null;
  if (piece) {
    pieceElement = (
      <Piece
        name={piece.name}
        colour={piece.colour}
        playable={playable}
        width={pieceWidth}
        onPieceDrag={onPieceDrag}
        onPieceClick={onPieceClick}
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
