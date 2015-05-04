(function() {
  define(["lib/d3"], function(d3) {
    var E, Maze, N, S, W;
    N = 1 << 0;
    S = 1 << 1;
    W = 1 << 2;
    E = 1 << 3;
    return Maze = (function() {
      function Maze(attrs) {
        var start;
        this.gridSize = attrs.gridSize, this.seed = attrs.seed, start = attrs.start;
        this.start = start != null ? start : (this.gridSize[1] - 1) * this.gridSize[0];
      }

      Maze.prototype.random = function() {
        var x;
        if (this.seed != null) {
          x = Math.sin(this.seed++) * 10000;
          return x - Math.floor(x);
        } else {
          return Math.random();
        }
      };

      Maze.prototype.generate = function() {
        var deepest, k, len, node, ref, ref1;
        this.cells = this._generateMaze(this.gridSize);
        ref = this._generateTree(), this.tree = ref.tree, this.nodes = ref.nodes, deepest = ref.deepest;
        deepest = this.nodes[0];
        ref1 = this.nodes.slice(1);
        for (k = 0, len = ref1.length; k < len; k++) {
          node = ref1[k];
          if (node.depth > deepest.depth) {
            deepest = node;
          }
        }
        this.end = deepest;
        return this.cells;
      };

      Maze.prototype.neighbor = function(index, direction) {
        switch (direction) {
          case S:
            return index + this.gridSize[1];
          case N:
            return index - this.gridSize[1];
          case E:
            return index + 1;
          case W:
            return index - 1;
        }
      };

      Maze.prototype._generateTree = function() {
        var cell, child, childIndex, frontier, height, nodes, parent, ref, root, visited, width;
        ref = this.gridSize, width = ref[0], height = ref[1];
        visited = d3.range(width * height).map(function(n, i) {
          return false;
        });
        visited[this.start] = true;
        root = {
          index: this.start,
          children: []
        };
        nodes = [root];
        frontier = [root];
        while ((parent = frontier.pop()) != null) {
          cell = this.cells[parent.index];
          if (cell & E && !visited[childIndex = parent.index + 1]) {
            visited[childIndex] = true;
            child = {
              index: childIndex,
              children: []
            };
            parent.children.push(child);
            nodes.push(child);
            frontier.push(child);
          }
          if (cell & W && !visited[childIndex = parent.index - 1]) {
            visited[childIndex] = true;
            child = {
              index: childIndex,
              children: []
            };
            parent.children.push(child);
            nodes.push(child);
            frontier.push(child);
          }
          if (cell & S && !visited[childIndex = parent.index + width]) {
            visited[childIndex] = true;
            child = {
              index: childIndex,
              children: []
            };
            parent.children.push(child);
            nodes.push(child);
            frontier.push(child);
          }
          if (cell & N && !visited[childIndex = parent.index - width]) {
            visited[childIndex] = true;
            child = {
              index: childIndex,
              children: []
            };
            parent.children.push(child);
            nodes.push(child);
            frontier.push(child);
          }
        }
        d3.layout.hierarchy()(root);
        return {
          tree: root,
          deepest: nodes[nodes.length - 1],
          nodes: nodes.sort(function(a, b) {
            return d3.ascending(a.index, b.index);
          })
        };
      };

      Maze.prototype._generateMaze = function() {
        var cells, exploreFrontier, frontier, height, ref, shuffle, width;
        ref = this.gridSize, width = ref[0], height = ref[1];
        exploreFrontier = function() {
          var d0, d1, edge, i0, i1, m, open, x0, x1, y0, y1;
          if ((edge = frontier.pop()) == null) {
            return true;
          }
          i0 = edge.index;
          d0 = edge.direction;
          i1 = i0 + (d0 === N ? -width : d0 === S ? width : d0 === W ? -1 : +1);
          x0 = i0 % width;
          y0 = i0 / width | 0;
          open = cells[i1] == null;
          if (d0 === N) {
            x1 = x0;
            y1 = y0 - 1;
            d1 = S;
          } else if (d0 === S) {
            x1 = x0;
            y1 = y0 + 1;
            d1 = N;
          } else if (d0 === W) {
            x1 = x0 - 1;
            y1 = y0;
            d1 = E;
          } else {
            x1 = x0 + 1;
            y1 = y0;
            d1 = W;
          }
          if (open) {
            cells[i0] |= d0;
            cells[i1] |= d1;
            m = 0;
            if (y1 > 0 && (cells[i1 - width] == null)) {
              frontier.push({
                index: i1,
                direction: N
              });
              ++m;
            }
            if (y1 < height - 1 && (cells[i1 + width] == null)) {
              frontier.push({
                index: i1,
                direction: S
              });
              ++m;
            }
            if (x1 > 0 && (cells[i1 - 1] == null)) {
              frontier.push({
                index: i1,
                direction: W
              });
              ++m;
            }
            if (x1 < width - 1 && (cells[i1 + 1] == null)) {
              frontier.push({
                index: i1,
                direction: E
              });
              ++m;
            }
            shuffle(frontier, frontier.length - m, frontier.length);
            return false;
          }
        };
        shuffle = (function(_this) {
          return function(array, i0, i1) {
            var i, j, m, t;
            m = i1 - i0;
            t = i = j = null;
            while (m) {
              i = _this.random() * m-- | 0;
              t = array[m + i0];
              array[m + i0] = array[i + i0];
              array[i + i0] = t;
            }
            return array;
          };
        })(this);
        cells = new Array(width * height);
        frontier = [];
        cells[this.start] = 0;
        frontier.push({
          index: this.start,
          direction: N
        });
        frontier.push({
          index: this.start,
          direction: E
        });
        shuffle(frontier, 0, 2);
        while (!exploreFrontier()) {
          null;
        }
        return cells;
      };

      return Maze;

    })();
  });

}).call(this);
