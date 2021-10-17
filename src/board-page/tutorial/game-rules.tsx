/**
 *
 */
export function GameRules(props: { totalTurns: number }) {
  return (
    <div className="koth-tutorial-rules">
      King Of The Hill is a turn based strategy game similar to Chess. There are 2 ways to win:
      <br />
      <ol>
        <li>
          <u title="Take an opponent piece with your piece">Capture</u> the opponent King.
        </li>
        <li>
          Move your King to the{" "}
          <u title="Hill is the golden coloured Tile in the middle of the board">Hill</u> Tile&nbsp;
          <u title="Cannot be captured or moved on next turn">Uncontested</u>. Uncontested means it
          cannot be captured or moved by the opponent on next turn.
        </li>
      </ol>
      Each game lasts {props.totalTurns} turns. Like Chess, each piece has a unique set of moves.
      Some pieces have special moves and properties. You can learn about piece movement by clickng
      on piece icons above.
    </div>
  );
}
