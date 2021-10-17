import { Board } from "../board/board";
import { Colour } from "../piece";
import { getPossibleMovesWithDetails, PossibleMove } from "../possible-moves";
import { evaluatePosition, EvaluatorPlugin } from "./score-evaluator";

/**
 * Depth means many moves ahead should the AI look into when calculating.
 * 4 seems to be the sweet spot. Takes on average
 * between 300 to 2500 mili-seconds to complete.
 */
const maxDepth = 4;

/**
 *
 */
export function getMoveCandidates(
  board: Board,
  plugins: EvaluatorPlugin[] = []
): [string, string] | null {
  //console.time("Best Move");
  const originalBoardJSONState = board.state.getJSONState();

  const boardCopyConfig = {
    x: board.yAxis.length,
    y: board.xAxis.length,
    hills: board.hills.map((h) => h.key),
  };

  // Make a copy of the active board so not mess with state
  const boardCopy = new Board(boardCopyConfig);
  boardCopy.state.setStateFromJSON(originalBoardJSONState);

  const moveTree = minimax(boardCopy, board.state.player, 0, true, -10000, 10000, plugins);

  // Measure
  //console.timeEnd("Best Move");

  return moveTree[1] ? moveTree[1] : null;
}

/**
 * Using 'Minimax' algorithm
 * https://en.wikipedia.org/wiki/Minimax
 * With 'Alpha–beta pruning'
 * https://en.wikipedia.org/wiki/Alpha-beta_pruning
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
    const { BLACK, WHITE } = evaluatePosition(board, plugins);
    const value = player === "BLACK" ? BLACK - WHITE : WHITE - BLACK;
    return [value, null];
  }

  let bestMove: [string, string] | null = null;
  let bestVal = isMaximizingPlayer ? -10000 : 10000;
  const possibleMoves = getMoves(board);

  for (let i = 0; i < possibleMoves.length; i++) {
    const move = possibleMoves[i];
    const moveFrom = move.tileFrom.key;
    const moveTo = move.tileTo.key;
    let value = null;
    board.move(moveFrom, moveTo);
    const { status } = board.state;

    if (status === "DRAW") {
      value = 0;
    } else if (status === "ACTIVE") {
      const result = minimax(board, player, depth + 1, !isMaximizingPlayer, alpha, beta, plugins);
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
 * Gets all possible moves from a given position
 * Also Sorts the moves by the most 'forcing' moves
 */
function getMoves(board: Board): PossibleMove[] {
  const moves: PossibleMove[] = [];
  const player = board.state.player;
  const stateArray = Array.from(board.state.getActivePieces());
  const pieces = stateArray.filter(([key, piece]) => piece.colour === player);

  for (const [key] of pieces) {
    const possibleMoves = getPossibleMovesWithDetails(key, board);
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
