(function() {
  define(["models/world", "lib/d3"], function(World, d3) {
    var Renderer;
    return Renderer = (function() {
      Renderer.prototype.pink = d3.rgb("#f4a");

      Renderer.prototype.black = "#000";

      function Renderer(attrs) {
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
        })(this));
        this.parent || (this.parent = this.body);
        this.sel = this.parent.append("div").attr("class", "world").on("touchstart.player", (function(_this) {
          return function() {
            return d3.event.preventDefault();
          };
        })(this)).on("touchend.player", (function(_this) {
          return function() {
            var cell, mouse;
            mouse = d3.mouse(_this.wallsCanvas.node());
            cell = _this.world.pixelPosToIndex(mouse);
            return _this.dispatch.cellSelected(cell);
          };
        })(this));
        this.wallsCanvas = this.sel.append("canvas");
        this.wallsCtx = this.wallsCanvas.node().getContext("2d");
        this.fairySel = this.sel.selectAll(".fairy").data([null]);
        this.fairySel.enter().append("div").attr({
          "class": "fairy"
        }).style("background", String(this.pink));
        this.endSel = this.sel.selectAll(".end").data([null]);
        this.endSel.enter().append("div").attr({
          "class": "end"
        });
      }

      Renderer.prototype.tick = function() {
        return this.fairySel.style({
          left: this.fairy.pixel[0] + "px",
          top: this.fairy.pixel[1] + "px"
        });
      };

      Renderer.prototype.updateCell = function(index, forceFull) {
        var allowEast, allowSouth, cell, fill, gap;
        if (forceFull == null) {
          forceFull = false;
        }
        cell = this.world.cells[index];
        fill = cell & World.REVISITED ? "#393939" : cell & World.OCCUPIED ? String(this.pink.darker(3)) : cell & World.VISITED ? String(this.pink.darker(3)) : this.black;
        if (forceFull) {
          fill = this.black;
        }
        if ((cell >> 4) && !forceFull) {
          gap = 6;
        }
        this.wallsCtx.fillStyle = fill;
        this._fillCell(index, gap);
        allowSouth = forceFull || (this.world.cells[this.world.due(World.S).from(index)] & World.VISITED);
        allowEast = forceFull || (this.world.cells[this.world.due(World.E).from(index)] & World.VISITED);
        if ((cell & World.S) && allowSouth) {
          this._fillSouth(index, gap);
        }
        if ((cell & World.E) && allowEast) {
          return this._fillEast(index, gap);
        }
      };

      Renderer.prototype.paint = function() {
        var cell, endPt, i, k, len, ref;
        this.wallsCanvas.attr({
          width: this.world.requiredSize[0],
          height: this.world.requiredSize[1]
        });
        this.wallsCtx.fillStyle = String(this.pink);
        this.wallsCtx.fillRect(0, 0, (this.world.cellSize + this.world.cellSpacing) * this.world.gridSize[0] + this.world.cellSpacing, (this.world.cellSize + this.world.cellSpacing) * this.world.gridSize[1] + this.world.cellSpacing);
        ref = this.world.cells;
        for (i = k = 0, len = ref.length; k < len; i = ++k) {
          cell = ref[i];
          this.updateCell(i, true);
        }
        endPt = this.world.indexToPixelPos(this.world.maze.end.index);
        return this.endSel.style({
          left: endPt[0] + "px",
          top: endPt[1] + "px"
        });
      };

      Renderer.prototype._fillCell = function(index, gap) {
        var i, j;
        if (gap == null) {
          gap = 0;
        }
        i = index % this.world.gridSize[0];
        j = index / this.world.gridSize[0] | 0;
        return this.wallsCtx.fillRect(i * this.world.cellSize + (i + 1) * this.world.cellSpacing + gap, j * this.world.cellSize + (j + 1) * this.world.cellSpacing + gap, this.world.cellSize - gap * 2, this.world.cellSize - gap * 2);
      };

      Renderer.prototype._fillEast = function(index, gap) {
        var i, j;
        if (gap == null) {
          gap = 0;
        }
        i = index % this.world.gridSize[0];
        j = index / this.world.gridSize[0] | 0;
        return this.wallsCtx.fillRect((i + 1) * (this.world.cellSize + this.world.cellSpacing) - gap, j * this.world.cellSize + (j + 1) * this.world.cellSpacing + gap, this.world.cellSpacing + gap * 2, this.world.cellSize - gap * 2);
      };

      Renderer.prototype._fillSouth = function(index, gap) {
        var i, j;
        if (gap == null) {
          gap = 0;
        }
        i = index % this.world.gridSize[0];
        j = index / this.world.gridSize[0] | 0;
        return this.wallsCtx.fillRect(i * this.world.cellSize + (i + 1) * this.world.cellSpacing + gap, (j + 1) * (this.world.cellSize + this.world.cellSpacing) - gap, this.world.cellSize - gap * 2, this.world.cellSpacing + gap * 2);
      };

      return Renderer;

    })();
  });

}).call(this);
