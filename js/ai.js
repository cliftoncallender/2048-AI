function moveName(move) {
 return {
    0: 'up',
    1: 'right',
    2: 'down',
    3: 'left'
  }[move];
}

// performs a search and returns the best move
function AI_getBest(grid, debug) {
  Player = Snake
  p = new Player();
  playerMove = p.move(grid)
  // console.log(playerMove)
  return {move: playerMove};
}

class Snake {
  constructor() {
    this.weights = this.makeSnakeWeights();
  }

  makeSnakeWeights() {
    var snake = [[0, 7, 8, 15], [1, 6, 9, 14], [2, 5, 10, 13], [3, 4, 11, 12]];
    var  weights = new Array(4);
    for (var i = 0; i < weights.length; i++){
      weights[i] = new Array(4);
    }
    for (x = 0; x < 4; x++) {
      for (y = 0; y < 4; y++) {
        weights[x][y] = 0.25 ** snake[x][y];
      }
    }
    return weights;
  }

  move(grid) {
    var legalMoves = grid.getLegalMoves();
    var bestMove = -1;
    var bestScore = 0;

    for (var i = 0; i < legalMoves.length; i++) {
      var g = grid.clone();
      g.move(legalMoves[i]);
      var score = this.expectimax(g)

      if (score >= bestScore) {
        bestScore = score;
        bestMove = legalMoves[i];
      }
    }
    return bestMove;
  }

  dotProduct(grid) {
    var total = 0;
    for (var x = 0; x < 4; x++) {
      for (var y = 0; y < 4; y++) {
        if (grid.cells[x][y]) {
          total += grid.cells[x][y].value * this.weights[x][y];
          // console.log(grid.cells[x][y].value, this.weights[x][y], grid.cells[x][y].value * this.weights[x][y], total)
        }
      }
    }
    return total;
  }

  fitness(grid) {
    return this.dotProduct(grid, this.weights);
  }

  expectimax(grid, depth = 5, playerMove = false) {
    // console.log("grid: ", grid, "depth: ", depth)
    var alpha = this.fitness(grid);
    // console.log("alpha: ", alpha)
    // if (playerMove && grid.legalMoves().length == 0) {
    //   return -1000000
    // }
    // console.log("depth is 0: ", depth == 0)
    // console.log("player move: ", playerMove)
    if (depth == 0) return alpha;
    if (depth < 0) fail;

    if (playerMove) {
      var legalMoves = grid.getLegalMoves();

      for (var i = 0, n = legalMoves.length; i < n; i++) {
        var currentMove = legalMoves[i];
        g = grid.clone()
        g.move(currentMove)
        alpha = Math.max(alpha, this.expectimax(g, depth - 1));
      }

    } else {
      alpha = 0;
      var emptyCells = grid.availableCells();
      var numEmptyCells = emptyCells.length

      for (var i = 0; i < numEmptyCells; i++) {
        var possSpawns = [{value: 2, prob: 1}]; // [{value: 2, prob: 0.9}, {value: 4, prob: 0.1}];
        for (var j = 0; j < possSpawns.length; j++) {
          var tile = new Tile(emptyCells[i], possSpawns[j].value);
          g = grid.clone()
          g.cells[emptyCells[i].x][emptyCells[i].y] = tile;
          alpha += this.expectimax(g, depth - 1, playerMove = true) * possSpawns[j].prob / numEmptyCells;
        }
      }
    }
    return alpha
  }
}

// class Random {
//   move(grid) {
//     var legalMoves = grid.getLegalMoves();
//     var randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
//     return randomMove;
//   }
// }
//
// class MoveHierarchy {
//   constructor() {
//     this.moveHierarchy = [0, 3, 1, 2];
//   }
//
//   move(grid) {
//     for (var i = 0, n = this.moveHierarchy.length; i < n; i++) {
//       var currentMove = this.moveHierarchy[i];
//       if (grid.isLegalMove(currentMove)) {
//         return currentMove;
//       }
//     }
//   }
// }
