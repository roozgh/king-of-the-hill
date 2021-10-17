import { useRef, memo, useEffect } from "react";

interface GameStatusProps {
  status: string;
  turn: number;
  totalTurns: number;
}

/**
 * Display game status
 */
export const GameStatus = memo((props: GameStatusProps) => {
  const { status, turn, totalTurns } = props;
  const statusElm = useRef<HTMLDivElement | null>(null);

  /**
   * Do a little bouncing animation when game ends
   */
  useEffect(() => {
    if (status !== "ACTIVE") {
      const elm = statusElm.current;
      if (!elm) return;
      elm.classList.remove("bounce");
      // JS trick to force browser to animate
      void elm.offsetWidth;
      elm.classList.add("bounce");
    }
  }, [status]);

  let txt = "";
  switch (status) {
    case "ACTIVE":
      txt = `TURN: ${turn} / ${totalTurns}`;
      break;
    case "DRAW":
      txt = "Game Drawn";
      break;
    case "WHITE":
      txt = "Blue Won!";
      break;
    case "BLACK":
      txt = "Red Won!";
      break;
    default:
      throw Error(`Invalid board Status: ${status}`);
  }

  return (
    <div ref={statusElm} className="koth-game-status">
      {txt}
    </div>
  );
});
