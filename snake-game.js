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

    let moves = this.filterForwardOnly(this.prevMove, MOVES);
    moves = this.filterWalls(currentLoc, moves);
    moves = this.filterSnakes(currentLoc, gameState.board.snakes, moves);

    console.log('MOVES', moves);

    const move = moves[Math.floor(Math.random() * moves.length)];

    this.prevLoc = currentLoc;
    this.prevMove = move;

    console.log(this.prevLoc, this.prevMove, me.health);

    return move;
  }

  filterSnakes(currentLoc, snakes, moves) {
    const snakeLocs = [];

    for (let x = 0; x < this.board.width; x++) {
      snakeLocs[x] = [];
      for (let y = 0; y < this.board.height; y++) {
        snakeLocs[x][y] = 0;
      }
    }

    _.flatMap(snakes, s => s.body).forEach(body => {
      snakeLocs[body.y][body.x] = 1;
    });
    console.log(snakeLocs);

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

  scoreMove(move, currentLoc, grid) {
    
  }
}

module.exports = SnakeGame;
