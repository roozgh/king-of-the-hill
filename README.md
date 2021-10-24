# King Of The Hill

An original strategy board game similar to Chess. Created using React, Typescript and Sass.
[Click here](https://roozgh.github.io/king-of-the-hill) to play against the computer.

## Code Explanation

This project is divided into two parts. One is 'board-logic' which is pure Typescript and contains the board rules, state and AI. This part is independent of React and can coupled with any view engine. It can even be used on a server running NodeJs.

The second part is 'board-views' which contains the view layer for the game. Board-views is written with modern React using React Hooks.

## The AI

The game's AI is based on [MiniMax Algorithm] + [Alpha-Beta Pruning] for optimisation. By default the AI calculates 4 moves ahead. This can be changed in code but increasing the depth significantly increases the thinking time.

## Development

Make sure you have NodeJS installed. Download or clone project. Open Command Line in project directory. Run `npm i` followed by `npm start` in Command Line.

## How To Play

King Of The Hill is a turn based strategy game similar to Chess. There are 2 ways to win:

1. Capture the opponent King.
2. Move your King to the Hill Tile Uncontested. Uncontested means it cannot be captured or moved by the opponent on next turn.

Like Chess, each piece has a unique set of moves. Some pieces have special moves and properties. Piece movements are explained in detail [in game](https://roozgh.github.io/king-of-the-hill). You can learn more by clicking the question mark icon in game.

[minimax algorithm]: https://en.wikipedia.org/wiki/Minimax
[alpha-beta pruning]: https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning
