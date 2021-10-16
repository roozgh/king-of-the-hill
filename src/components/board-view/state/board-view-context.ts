import { createContext, Dispatch } from "react";
import { BoardViewAction } from "./board-view-reducer";
import { BoardViewState, boardViewInitialState } from "./board-view-state";

type BoardViewContextType = {
  state: BoardViewState;
  dispatch: Dispatch<BoardViewAction>;
};

export const BoardViewContext = createContext<BoardViewContextType>({
  state: boardViewInitialState,
  dispatch: () => {},
});
