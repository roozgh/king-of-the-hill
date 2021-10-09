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
  const { board, draggedPiece, selectedTile, possibleMoves, gameMode } = state;
  if (!board) throw Error("Board not defined");

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
    if (!draggedPiece) return;
    if (!selectedTile) return;
    if (!possibleMoves) throw Error("'possibleMove' Array not set");
    // Check if move is legal
    let moveIsLegal = possibleMoves.includes(tileKey);
    // If move not legal, clear board
    if (!moveIsLegal) {
      dispatch({ type: "NO_TILE_SELECTED" });
    }
    // Else make move
    else {
      makeMove(selectedTile, tileKey);
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
    if (selectedTile) {
      if (!possibleMoves) throw Error("'possibleMove' Array not set");
      // Check if move is legal
      let moveIsLegal = possibleMoves.includes(tileKey);
      // If move not legal, clear board
      if (!moveIsLegal) {
        dispatch({ type: "NO_TILE_SELECTED" });
      } else {
        makeMove(selectedTile, tileKey);
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
    if (!playable || !selectedTile) return;
    if (!possibleMoves) throw Error("possibleMove Array not set");
    // Check if move is legal
    let moveIsLegal = possibleMoves.includes(tileKey);
    // If move not legal, clear board
    if (!moveIsLegal) {
      dispatch({ type: "NO_TILE_SELECTED" });
    }
    // Else make move
    else {
      makeMove(selectedTile, tileKey);
    }
  }

  /**
   * STYLE & CLASSES
   */
  let classes = ["tile"];

  if (board.state.player === "BLACK") classes.push("red-turn");
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
      style.animationDelay = (distanceFromPiece - 1) / 20 + "s";
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

  /**
   * PIECE PROPS
   */
  let pieceElement = null;
  if (piece) {
    let pieceWidth = width - 20;
    // If piece is selected, increase its size
    if (selectedTile === tileKey) {
      pieceWidth = width - 10;
    }

    let movable = false;
    if (board.state.status === "ACTIVE" && playable) {
      if (gameMode === "AGAINST_CPU") {
        // Can only move WHITE pieces & can only do it on WHITE's turn
        if (board.state.player === "WHITE" && piece.colour === "WHITE") {
          movable = true;
        }
      } else if (gameMode === "AGAINST_HUMAN") {
        // Can only move your pieces when your turn
        if (board.state.player === piece.colour) {
          movable = true;
        }
      }
    }

    pieceElement = (
      <Piece
        name={piece.name}
        colour={piece.colour}
        movable={movable}
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
