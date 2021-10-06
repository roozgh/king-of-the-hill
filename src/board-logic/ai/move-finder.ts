import { Board } from "../board/board";
import { Colour } from "../piece";
import { getPossibleMovesWithDetails, PossibleMove } from "../possible-moves";
import { evaluatePosition, EvaluatorPlugin } from "./score-evaluator";

const maxDepth = 4;
let count = 0;

/**
 *
 */
export function getMoveCandidates(
  board: Board,
  plugins: EvaluatorPlugin[] = []
): [string, string] | null {
  count = 0;
  console.time("Best Moves");
  let originalBoardState = board.getState();

  let boardCopyConfig = {
    x: board.yAxis.length,
    y: board.xAxis.length,
    hills: board.hills.map((h) => h.key),
  };

  let boardCopy = new Board(boardCopyConfig);
  boardCopy.setState(originalBoardState);

  let moveTree = minimax(boardCopy, board.state.player, 0, true, -10000, 10000, plugins);

  console.timeEnd("Best Moves");
  console.log("Count: ", count);
  console.log(moveTree);

  return moveTree[1] ? moveTree[1] : null;
}
/**
 *
 */
function minimax(
  board: Board,
  player: Colour,
  depth: number,
  isMaximizingPlayer: boolean,
  alpha: number,
  beta: number,
  plugins: EvaluatorPlugin[]
): [number, [string, string] | null] {
  if (depth === maxDepth) {
    count++;
    let { BLACK, WHITE } = evaluatePosition(board, plugins);
    let value = player === "BLACK" ? BLACK - WHITE : WHITE - BLACK;
    return [value, null];
  }

  let bestMove: [string, string] | null = null;
  let bestVal = isMaximizingPlayer ? -10000 : 10000;
  let possibleMoves = getMoves(board);

  for (let i = 0; i < possibleMoves.length; i++) {
    let move = possibleMoves[i];
    let moveFrom = move.tileFrom.key;
    let moveTo = move.tileTo.key;
    let value = null;
    board.move(moveFrom, moveTo);
    let { status } = board.state;

    if (status === "DRAW") {
      value = 0;
    } else if (status === "ACTIVE") {
      let result = minimax(board, player, depth + 1, !isMaximizingPlayer, alpha, beta, plugins);
      value = result[0];
    } else {
      if (status === player) value = 1000;
      else value = -1000;
    }

    if (isMaximizingPlayer) {
      if (value > bestVal) {
        bestVal = value;
        bestMove = [moveFrom, moveTo];
      }
      alpha = Math.max(alpha, value);
    } else {
      if (value < bestVal) {
        bestVal = value;
        bestMove = [moveFrom, moveTo];
      }
      beta = Math.min(beta, value);
    }

    board.state.undo();

    if (beta <= alpha) {
      break;
    }
  }

  return [bestVal, bestMove];
}

/**
 *
 */
function getMoves(board: Board): PossibleMove[] {
  let moves: PossibleMove[] = [];
  let player = board.state.player;
  let stateArray = Array.from(board.state.getState());
  let pieces = stateArray.filter(([key, piece]) => piece.colour === player);

  for (let [key] of pieces) {
    let possibleMoves = getPossibleMovesWithDetails(key, board);
    moves.push(...possibleMoves);
  }

  // Sort by moves that result in piece captures.
  // This helps the algorithm analyse forcing moves first,
  // making it find the best moves faster
  moves.sort((a, b) => {
    return a.capturing ? -1 : 1;
  });

  return moves;
}
