(function() {
  define(["models/maze"], function(Maze) {
    var World;
    return World = (function() {
      World.prototype.klass = World;

      World.N = 1 << 0;

      World.S = 1 << 1;

      World.W = 1 << 2;

      World.E = 1 << 3;

      World.OCCUPIED = 1 << 4;

      World.VISITED = 1 << 5;

      World.REVISITED = 1 << 6;

      function World(width, height, cellSize, cellSpacing) {
        this.cellSize = cellSize != null ? cellSize : 26;
        this.cellSpacing = cellSpacing != null ? cellSpacing : 2;
        this.size = [width, height];
      }

      World.prototype.build = function(seed, density) {
        if (seed == null) {
          seed = Math.random();
        }
        if (density == null) {
          density = 12;
        }
        this.cellSize = -this.cellSpacing + Math.floor((this.size[0] - this.cellSpacing) / density);
        this.gridSize = [Math.floor((this.size[0] - this.cellSpacing) / (this.cellSize + this.cellSpacing)), Math.floor((this.size[1] - this.cellSpacing) / (this.cellSize + this.cellSpacing))];
        this.requiredSize = [this.gridSize[0] * (this.cellSize + this.cellSpacing) + this.cellSpacing, this.gridSize[1] * (this.cellSize + this.cellSpacing) + this.cellSpacing];
        this.maze = new Maze({
          gridSize: this.gridSize,
          seed: seed,
          start: 0
        });
        return this.cells = this.maze.generate();
      };

      World.prototype.indexToGridPos = function(index) {
        return [index % this.gridSize[0], Math.floor(index / this.gridSize[0])];
      };

      World.prototype.gridToPixelPos = function(gridPos) {
        return [gridPos[0] * (this.cellSize + this.cellSpacing) + (this.cellSpacing + this.cellSize / 2), gridPos[1] * (this.cellSize + this.cellSpacing) + (this.cellSpacing + this.cellSize / 2)];
      };

      World.prototype.indexToPixelPos = function(index) {
        return this.gridToPixelPos(this.indexToGridPos(index));
      };

      World.prototype.pixelPosToIndex = function(pixel) {
        return this.gridPosToIndex([Math.floor(pixel[0] / (this.cellSize + this.cellSpacing)), Math.floor(pixel[1] / (this.cellSize + this.cellSpacing))]);
      };

      World.prototype.gridPosToIndex = function(gridPos) {
        return gridPos[0] + gridPos[1] * this.gridSize[0];
      };

      World.prototype.getGridSize = function() {
        return this.gridSize;
      };

      World.prototype.dues = [];

      World.prototype.due = function(direction) {
        var base;
        return (base = this.dues)[direction] || (base[direction] = {
          world: this,
          direction: direction,
          from: (function() {
            switch (direction) {
              case World.N:
                return function(position) {
                  return position - this.world.gridSize[0];
                };
              case World.S:
                return function(position) {
                  return position + this.world.gridSize[0];
                };
              case World.E:
                return function(position) {
                  return position + 1;
                };
              case World.W:
                return function(position) {
                  return position - 1;
                };
            }
          })()
        });
      };

      World.prototype.possiblyDues = [];

      World.prototype.possiblyDue = function(direction) {
        var base;
        return (base = this.possiblyDues)[direction] || (base[direction] = {
          world: this,
          direction: direction,
          from: function(position) {
            if (this.check(position)) {
              return this.world.due(direction).from(position);
            } else {
              return position;
            }
          },
          check: function(position) {
            return this.world.cells[position] & direction;
          }
        });
      };

      return World;

    })();
  });

}).call(this);
