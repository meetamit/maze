(function() {
  define(["models/world", "lib/d3"], function(World, d3) {
    var Renderer;
    return Renderer = (function() {
      function Renderer(attrs) {
        this.world = attrs.world, this.fairy = attrs.fairy;
        this.sel = d3.select("body").append("div").attr("class", "world");
        this.wallsCanvas = this.sel.append("canvas");
        this.wallsCtx = this.wallsCanvas.node().getContext("2d");
        this._renderWalls();
        this.update();
      }

      Renderer.prototype.update = function() {
        var fairyPos, fairySel;
        fairyPos = this.world.indexToPixelPos(this.fairy.position);
        fairySel = this.sel.selectAll(".fairy").data([null]);
        fairySel.enter().append("div").attr({
          "class": "fairy"
        });
        return fairySel.style({
          left: fairyPos[0] + "px",
          top: fairyPos[1] + "px"
        });
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
          this._fillCell(i);
          if (cell & World.S) {
            this._fillSouth(i);
          }
          if (cell & World.E) {
            results.push(this._fillEast(i));
          } else {
            results.push(void 0);
          }
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
