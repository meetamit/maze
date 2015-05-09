(function() {
  requirejs(["models/world", "models/fairy", "views/renderer", "views/tree_renderer"], function(World, Fairy, Renderer, TreeRenderer) {
    var tick;
    this.world = new World(window.innerWidth, window.innerHeight);
    this.fairy = new Fairy();
    this.fairy.enter(this.world).transportTo(world.maze.start).on("indexChanged", (function(_this) {
      return function(index, previous) {
        var newCell, prevCell;
        _this.treeView.updateFairy();
        prevCell = _this.world.cells[previous];
        prevCell &= ~World.OCCUPIED;
        newCell = _this.world.cells[index];
        newCell |= World.OCCUPIED;
        if (!(newCell & World.VISITED)) {
          newCell |= World.VISITED;
        } else {
          newCell |= World.REVISITED;
          prevCell |= World.REVISITED;
        }
        _this.world.cells[previous] = prevCell;
        _this.world.cells[index] = newCell;
        _this.renderer.updateCell(previous);
        return _this.renderer.updateCell(index);
      };
    })(this));
    this.renderer = new Renderer({
      world: world,
      fairy: this.fairy
    }).on("arrowPressed", (function(_this) {
      return function(direction) {
        return _this.fairy.wish().head(direction);
      };
    })(this)).on("treeToggled", (function(_this) {
      return function() {
        return _this.treeView.toggle();
      };
    })(this)).on("cellSelected", (function(_this) {
      return function(index) {
        return _this.fairy.wish().goto(index);
      };
    })(this));
    this.treeView = new TreeRenderer({
      world: world,
      fairy: this.fairy
    });
    tick = function() {
      this.fairy.tick();
      this.renderer.tick();
      return window.requestAnimationFrame(tick.bind(this));
    };
    this.world.cells[this.fairy.index] |= World.OCCUPIED | World.VISITED;
    this.renderer.updateCell(this.fairy.index);
    return tick();
  });

}).call(this);
