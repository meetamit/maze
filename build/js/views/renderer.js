(function() {
  define(["models/world", "lib/d3"], function(World, d3) {
    var Renderer;
    return Renderer = (function() {
      function Renderer(attrs) {
        var endPt;
        this.world = attrs.world, this.fairy = attrs.fairy, this.parent = attrs.parent;
        this.dispatch = d3.dispatch("arrowPressed", "cellSelected", "treeToggled");
        d3.rebind(this, this.dispatch, "on", "off");
        this.body = d3.select("body").on("keydown.player", (function(_this) {
          return function() {
            var direction, key;
            key = d3.event.keyCode;
            direction = key === 38 ? World.N : key === 40 ? World.S : key === 37 ? World.W : key === 39 ? World.E : void 0;
            if (direction != null) {
              _this.dispatch.arrowPressed(direction);
            }
            if (key === 84) {
              return _this.dispatch.treeToggled();
            }
          };
        })(this)).on("touchstart.player", (function(_this) {
          return function() {
            var cell, mouse;
            mouse = d3.mouse(_this.wallsCanvas.node());
            cell = _this.world.pixelPosToIndex(mouse);
            return _this.dispatch.cellSelected(cell);
          };
        })(this));
        this.parent || (this.parent = this.body);
        this.sel = this.parent.append("div").attr("class", "world");
        this.wallsCanvas = this.sel.append("canvas");
        this.wallsCtx = this.wallsCanvas.node().getContext("2d");
        this._renderWalls();
        this.fairySel = this.sel.selectAll(".fairy").data([null]);
        this.fairySel.enter().append("div").attr({
          "class": "fairy"
        });
        endPt = this.world.indexToPixelPos(this.world.maze.end.index);
        this.endSel = this.sel.selectAll(".end").data([null]);
        this.endSel.enter().append("div").attr({
          "class": "end"
        });
        this.endSel.style({
          left: endPt[0] + "px",
          top: endPt[1] + "px"
        });
        this.tick();
      }

      Renderer.prototype.tick = function() {
        return this.fairySel.style({
          left: this.fairy.pixel[0] + "px",
          top: this.fairy.pixel[1] + "px"
        });
      };

      Renderer.prototype.updateCell = function(index) {
        var cell;
        cell = this.world.cells[index];
        this.wallsCtx.fillStyle = cell & World.REVISITED ? "#311" : cell & World.OCCUPIED ? "#226" : cell & World.VISITED ? "#131" : "black";
        this._fillCell(index);
        if (cell & World.S) {
          this._fillSouth(index);
        }
        if (cell & World.E) {
          return this._fillEast(index);
        }
      };

      Renderer.prototype._renderWalls = function() {
        var cell, i, k, len, ref, results;
        this.wallsCanvas.attr({
          width: this.world.size[0],
          height: this.world.size[1]
        });
        this.wallsCtx.fillStyle = "white";
        this.wallsCtx.fillRect(0, 0, (this.world.cellSize + this.world.cellSpacing) * this.world.gridSize[0] + this.world.cellSpacing, (this.world.cellSize + this.world.cellSpacing) * this.world.gridSize[1] + this.world.cellSpacing);
        this.wallsCtx.fillStyle = "black";
        ref = this.world.cells;
        results = [];
        for (i = k = 0, len = ref.length; k < len; i = ++k) {
          cell = ref[i];
          results.push(this.updateCell(i));
        }
        return results;
      };

      Renderer.prototype._fillCell = function(index) {
        var i, j;
        i = index % this.world.gridSize[0];
        j = index / this.world.gridSize[0] | 0;
        return this.wallsCtx.fillRect(i * this.world.cellSize + (i + 1) * this.world.cellSpacing, j * this.world.cellSize + (j + 1) * this.world.cellSpacing, this.world.cellSize, this.world.cellSize);
      };

      Renderer.prototype._fillEast = function(index) {
        var i, j;
        i = index % this.world.gridSize[0];
        j = index / this.world.gridSize[0] | 0;
        return this.wallsCtx.fillRect((i + 1) * (this.world.cellSize + this.world.cellSpacing), j * this.world.cellSize + (j + 1) * this.world.cellSpacing, this.world.cellSpacing, this.world.cellSize);
      };

      Renderer.prototype._fillSouth = function(index) {
        var i, j;
        i = index % this.world.gridSize[0];
        j = index / this.world.gridSize[0] | 0;
        return this.wallsCtx.fillRect(i * this.world.cellSize + (i + 1) * this.world.cellSpacing, (j + 1) * (this.world.cellSize + this.world.cellSpacing), this.world.cellSize, this.world.cellSpacing);
      };

      return Renderer;

    })();
  });

}).call(this);
