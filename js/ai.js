// performs a search and returns the best move
function AI_getBest(grid, debug) {
  Player = Snake
  p = new Player();
  playerMove = p.move(grid)
  // console.log(playerMove)
  return {move: playerMove};
}

// AI based on expectimax and snake-pattern weight function.
class Snake {
  constructor() {
    this.size = 4;
    this.snake = [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12];
    this.weights = this.makeWeights();
    this.allWeights = this.makeAllWeights(this.makeSnake(this.snake, this.weights))
    this.depth = 5;
  }

  makeSnake(snakePattern, weights) {
    // create empty square matrix
    var matrix = new Array(this.size);
    for (var x = 0; x < this.size; x++) {
      matrix[x] = new Array(this.size);
    }

    // insert weight into matrix in the cell indicated by snakePattern
    for (var i = 0; i < weights.length; i++) {
      var x = snakePattern[i] % this.size;
      var y = Math.floor(snakePattern[i] / this.size);
      matrix[x][y] = weights[i]
    }

    return matrix
  }

  makeWeights() {
    const ratio = 0.5 // Constant ratio of descending weights.
    var weights = []
    for (var i = 0; i < this.size ** 2; i++) {
      weights[i] = ratio ** i
    }
    return weights
  }

  makeAllWeights(matrix) {
    // accumulator for all weight matrices
    var allWeights = [];
    // matrix and its inversion
    var flipWeights = [matrix, this.flip(matrix)];

    // add matrix, its inversion, and their rotations to allWeights
    for (var i = 0; i < flipWeights.length; i++) {
      for (var j = 0; j < 4; j++) {
        allWeights.push(this.rotate(flipWeights[i], j))
      }
    }

    return allWeights;
  }

  rotate(grid, k) {
    // create clone of grid
    var newGrid = new Array(4);
    for (var x = 0; x < grid.length; x++){
      newGrid[x] = new Array(4);
      for (var y = 0; y < grid[x].length; y++) {
        newGrid[x][y] = grid[x][y]
      }
    }

    // rotate the grid by 90 * k degrees
    for (var i = 0; i < k; i++) {
      newGrid = this.rotate90(newGrid)
    }

    return newGrid
  }

  rotate90(grid) {
    // rotate grid by 90 degress
    var xLength = grid.length;
    var yLength = grid[0].length;
    var newGrid = new Array();

    for (var x = 0; x < xLength; x++) {
      newGrid.push([])
      for (var y = 0; y < yLength; y++) {
        var newX = y
        var newY = xLength - x - 1
        newGrid[x].push(grid[newX][newY])
      }
    }

    return newGrid
  }

  flip(grid) {
    // flip grid along its NW/SE diagonal
    var xLength = grid.length;
    var yLength = grid[0].length;
    var newGrid = new Array();

    for (var x = 0; x < xLength; x++) {
      newGrid.push([])
      for (var y = 0; y < yLength; y++) {
        var newX = y
        var newY = x
        newGrid[x].push(grid[newX][newY])
      }
    }

    return newGrid
  }

  move(grid) {
    var legalMoves = grid.getLegalMoves();
    var bestMove = -1;
    var bestScore = 0;

    const numEmptyCells = grid.availableCells().length;

    var depth

    if (numEmptyCells > 4) depth = this.depth;
    else if (numEmptyCells > 2) depth = this.depth + 2;
    else depth = this.depth + 4;

    for (var i = 0; i < legalMoves.length; i++) {
      var g = grid.clone();
      g.move(legalMoves[i]);
      var score = this.expectimax(g, depth)

      if (score >= bestScore) {
        bestScore = score;
        bestMove = legalMoves[i];
      }
    }
    return bestMove;
  }

  fitness(grid) {
    var total = 0;

    for (var i = 0; i < this.allWeights.length; i++) {
      var tempTotal = 0

      // dot product of grid with each matrix in this.allWeights
      for (var x = 0; x < this.size; x++) {
        for (var y = 0; y < this.size; y++) {
          if (grid.cells[x][y]) {
            tempTotal += grid.cells[x][y].value * this.allWeights[i][x][y];
          }
        }
      }
      if (tempTotal > total) total = tempTotal;
    }

    return total;
  }

  expectimax(grid, depth = 5, playerMove = false) {
    var alpha = this.fitness(grid);
    if (depth == 0) return alpha;

    if (playerMove) {
      var legalMoves = grid.getLegalMoves();

      for (var i = 0, n = legalMoves.length; i < n; i++) {
        var currentMove = legalMoves[i];
        g = grid.clone()
        g.move(currentMove)
        alpha = Math.max(alpha, this.expectimax(g, depth - 1));
      }

    } else {
      var alpha = 0;
      var emptyCells = grid.availableCells();
      const numEmptyCells = emptyCells.length

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
