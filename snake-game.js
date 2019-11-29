const _ = require('lodash');

const MOVES = ['up', 'right', 'down', 'left'];
const OPPOSITES = {
  'up': 'down',
  'down': 'up',
  'right': 'left',
  'left': 'right'
};
const newLocs = {
  up: (loc) => {
    return { x: loc.x, y: loc.y - 1 };
  },
  down: (loc) => {
    return { x: loc.x, y: loc.y + 1 };
  },
  right: (loc) => {
    return { x: loc.x + 1, y: loc.y };
  },
  left: (loc) => {
    return { x: loc.x - 1, y: loc.y };
  }
};

/*
{
  "game": {
    "id": "game-id-string"
  },
  "turn": 1,
  "board": {
    "height": 11,
    "width": 11,
    "food": [{
      "x": 1,
      "y": 3
    }],
    "snakes": [{
      "id": "snake-id-string",
      "name": "Sneky Snek",
      "health": 100,
      "body": [{
        "x": 1,
        "y": 3
      }]
    }]
  },
  "you": {
    "id": "snake-id-string",
    "name": "Sneky Snek",
    "health": 100,
    "body": [{
      "x": 1,
      "y": 3
    }]
  }
}
*/

class SnakeGame {
  constructor(gameState) {
    this.board = gameState.board;
    this.prevLoc = gameState.you.body[0];
    this.prevMove = null;
  }

  nextMove(gameState) {
    const me = gameState.you;
    const currentLoc = me.body[0];

    const grid = [];
    const snakes = gameState.board.snakes;
    const food = gameState.board.food;

    for (let x = 0; x < this.board.width; x++) {
      grid[x] = [];
      for (let y = 0; y < this.board.height; y++) {
        grid[x][y] = 0;
      }
    }

    _.flatMap(snakes, s => s.body).forEach(body => {
      grid[body.y][body.x] = 1;
    });

    let moves = this.filterForwardOnly(this.prevMove, MOVES);
    moves = this.filterWalls(currentLoc, moves);
    moves = this.filterSnakes(currentLoc, grid, moves);

    food.forEach(f => {
      grid[f.y][f.x] = 2;
    });

    console.log(grid);

    const scores = _.sortBy(this.scoreMoves(moves, currentLoc, grid), ['score']);
    console.log(scores);
    console.log('MOVES', moves);

    // const move = moves[Math.floor(Math.random() * moves.length)];

    const move = this.randomByScore(scores);

    this.prevLoc = currentLoc;
    this.prevMove = move;

    console.log(currentLoc, move, me.health, gameState.turn);

    return move;
  }

  filterSnakes(currentLoc, snakeLocs, moves) {
    return _.filter(moves, m => {
      const potentialLoc = newLocs[m](currentLoc);
      return snakeLocs[potentialLoc.y][potentialLoc.x] === 0;
    });
  }

  filterForwardOnly(prevMove, moves) {
    return _.filter(moves, x => x !== OPPOSITES[prevMove]);
  }

  filterWalls(currentLoc, moves) {
    const crashMoves = [];
    if (currentLoc.x === (this.board.width - 1)) {
      crashMoves.push('right');
    }
    if (currentLoc.y === (this.board.height - 1)) {
      crashMoves.push('down');
    }
    if (currentLoc.x === 0) {
      crashMoves.push('left');
    }
    if (currentLoc.y === 0) {
      crashMoves.push('up');
    }

    return _.difference(moves, crashMoves);
  }

  scoreMoves(moves, currentLoc, grid) {
    return moves.map(m => {
      let gridPredicate;
      if (m === 'up') {
        gridPredicate = (x, y) => {
          return y < currentLoc.y && x < (currentLoc.x + 4) && x > (currentLoc.x - 4);
        };
      } else if (m === 'down') {
        gridPredicate = (x, y) => {
          return y > currentLoc.y && x < (currentLoc.x + 4) && x > (currentLoc.x - 4);
        };
      } else if (m == 'right') {
        gridPredicate = (x, y) => {
          return x > currentLoc.x && y < (currentLoc.y + 4) && y > (currentLoc.y - 4);
        };
      } else { // left
        gridPredicate = (x, y) => {
          return x < currentLoc.x && y < (currentLoc.y + 4) && y > (currentLoc.y - 4);
        };
      }

      let score = 0;

      for (let y = 0; y < grid.length; y++) {
        let row = grid[y];
        for (let x = 0; x < row.length; x++) {
          if (!gridPredicate(x, y)) {
            continue;
          }

          if (grid[y][x] === 0) {
            score++;
          }

          if (grid[y][x] === 2) {
            score = score + 100;
          }
        }
      }

      return { move: m, score: score };
    });
  }

  randomByScore(scores) {
    const totalScore = _.sum(scores.map(s => s.score));
    const rand = Math.random();
    let sum = 0;

    for (const s of scores) {
      const chance = s.score / totalScore;
      sum += chance;
      if (rand <= sum) {
        return s.move;
      }
    }

    return scores[scores.length - 1].move;
  }
}

module.exports = SnakeGame;
