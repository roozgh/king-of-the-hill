import { useContext, CSSProperties, MouseEvent } from "react";
import { BoardViewContext } from "./board-view-reducer";
import { Piece } from "./piece";
import { Colour, PieceName } from "../board-logic/piece";

interface TileProps {
  playerTurn: Colour;
  tileKey: string;
  colour: string;
  isHill: boolean;
  isPossibleMove: boolean;
  isMovingPiece: boolean;
  isPrevMove: boolean;
  edgeScore?: any;
  distanceFromPiece?: number | null;
  piece: { name: PieceName; colour: Colour } | null;
  playable: boolean;
  onPieceMove?: (from: string, to: string) => void;
}

export default function Tile(opt: TileProps) {
  //console.log("TILE RENDER");
  const {
    playerTurn,
    isHill,
    colour,
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
  const { board, draggedPiece, selectedTile, possibleMoves, gameMode, tileWidth, boardWidth } =
    state;
  if (!board) throw Error("Board not defined");

  const status = board.state.status;

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
      if (onPieceMove) onPieceMove(selectedTile, tileKey);
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
    if (!playable) return;
    if (status !== "ACTIVE") return;
    if (selectedTile) {
      if (!possibleMoves) throw Error("'possibleMove' Array not set");
      // Check if move is legal
      let moveIsLegal = possibleMoves.includes(tileKey);
      // If move not legal, clear board
      if (!moveIsLegal) {
        dispatch({ type: "NO_TILE_SELECTED" });
      } else {
        if (onPieceMove) onPieceMove(selectedTile, tileKey);
      }
    } else {
      dispatch({ type: "TILE_SELECT", tile: tileKey });
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
      if (onPieceMove) onPieceMove(selectedTile, tileKey);
    }
  }

  /**
   * STYLE & CLASSES
   */
  let classes = ["tile"];

  if (playerTurn === "BLACK") classes.push("black-turn");
  else classes.push("white-turn");

  if (isMovingPiece) classes.push("moving-piece");
  if (isHill) classes.push("hill");

  if (colour === "DARK") classes.push("dark");
  else classes.push("light");

  if (boardWidth < 400) classes.push("sm");

  let tileStyle = { width: tileWidth, height: tileWidth };

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
    // Piece size always 85% of Tile size
    let pieceWidth = Math.floor((tileWidth * 80) / 100);
    // If piece is selected, increase its size
    if (selectedTile === tileKey) {
      pieceWidth += 5;
    }

    let movable = false;
    if (status === "ACTIVE" && playable) {
      if (gameMode === "AGAINST_CPU") {
        // Can only move WHITE pieces & can only do it on WHITE's turn
        if (playerTurn === "WHITE" && piece.colour === "WHITE") {
          movable = true;
        }
      } else if (gameMode === "AGAINST_HUMAN") {
        // Can only move your pieces when your turn
        if (playerTurn === piece.colour) {
          movable = true;
        }
      }
    }

    let isGolden = false;
    if (status !== "ACTIVE" && isHill && piece.name === "KING") {
      isGolden = true;
    }

    pieceElement = (
      <Piece
        name={piece.name}
        colour={piece.colour}
        movable={movable}
        width={pieceWidth}
        isGolden={isGolden}
        onPieceDrag={onPieceDrag}
        onPieceClick={onPieceClick}
      />
    );
  }

  return (
    <div onMouseUp={onMouseUp} onClick={onClick} className={classes.join(" ")} style={tileStyle}>
      {pieceElement}
      {highlightHtml}
    </div>
  );
}
