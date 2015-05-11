(function() {
  define(["models/world", "lib/d3"], function(World, d3) {
    var Renderer;
    return Renderer = (function() {
      Renderer.prototype.pink = d3.rgb("#f4a");

      Renderer.prototype.black = "#000";

      function Renderer(attrs) {
        this.world = attrs.world, this.fairy = attrs.fairy, this.parent = attrs.parent;
        this.dispatch = d3.dispatch("arrowPressed", "cellSelected", "treeToggled", "heightChanged");
        d3.rebind(this, this.dispatch, "on", "off");
        d3.select(window).on("scroll", (function(_this) {
          return function() {
            if (window.innerHeight !== _this.world.size[1]) {
              _this.dispatch.heightChanged(window.innerHeight);
            }
            return _this.sel.classed("suspended", window.scrollY + _this.world.cellSize < _this.sel.node().offsetTop);
          };
        })(this));
        this.body = d3.select("body").on("keydown.player", (function(_this) {
          return function() {
            var direction, key;
            key = d3.event.keyCode;
            direction = key === 38 ? World.N : key === 40 ? World.S : key === 37 ? World.W : key === 39 ? World.E : void 0;
            if (direction != null) {
              d3.event.preventDefault();
              _this.dispatch.arrowPressed(direction);
            }
            if (key === 84) {
              return _this.dispatch.treeToggled();
            }
          };
        })(this));
        this.parent || (this.parent = this.body);
        this.sel = this.parent.append("div").attr("class", "world suspended").on("touchstart.player", (function(_this) {
          return function() {
            return _this._scrollAtStart = window.scrollY;
          };
        })(this)).on("touchend.player", (function(_this) {
          return function() {
            var cell, mouse;
            if (window.scrollY !== _this._scrollAtStart) {
              return;
            }
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
        var sz;
        sz = Math.max(11, this.world.cellSize - 18);
        return this.fairySel.style({
          left: this.fairy.pixel[0] + "px",
          top: this.fairy.pixel[1] + "px",
          width: sz + "px",
          height: sz + "px",
          margin: -sz / 2 + "px"
        });
      };

      Renderer.prototype.showTrail = function(_showTrail) {
        var ref;
        this._showTrail = _showTrail;
        if ((ref = this.world.requiredSize) != null ? ref[0] : void 0) {
          this.paint();
        }
        return this;
      };

      Renderer.prototype.updateCell = function(index, forceFull) {
        var allowEast, allowSouth, cell, fill, gap;
        if (forceFull == null) {
          forceFull = false;
        }
        cell = this.world.cells[index];
        fill = !this._showTrail ? this.black : cell & World.REVISITED ? "#393939" : cell & World.OCCUPIED ? String(this.pink.darker(2)) : cell & World.VISITED ? String(this.pink.darker(3)) : this.black;
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
        var cell, endPt, i, k, l, len, len1, ref, ref1;
        this.wallsCanvas.attr({
          width: this.world.requiredSize[0],
          height: Math.max(this.world.requiredSize[1], this.world.size[1] - 10)
        });
        this.wallsCtx.fillStyle = String(this.pink);
        this.wallsCtx.fillRect(0, 0, (this.world.cellSize + this.world.cellSpacing) * this.world.gridSize[0] + this.world.cellSpacing, (this.world.cellSize + this.world.cellSpacing) * this.world.gridSize[1] + this.world.cellSpacing);
        ref = this.world.cells;
        for (i = k = 0, len = ref.length; k < len; i = ++k) {
          cell = ref[i];
          this.updateCell(i, true);
        }
        ref1 = this.world.cells;
        for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
          cell = ref1[i];
          this.updateCell(i, false);
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
