(function() {
  requirejs(["models/world", "models/fairy", "views/renderer", "views/tree_renderer", "lib/director"], function(World, Fairy, Renderer, TreeRenderer, Director) {
    var tick;
    this.world = new World(window.innerWidth, window.innerHeight);
    this.fairy = new Fairy();
    this.fairy.enter(this.world).on("indexChanged", (function(_this) {
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
      this.running = true;
      this.fairy.tick();
      this.renderer.tick();
      return window.requestAnimationFrame(tick.bind(this));
    };
    this.router = Router({
      "/": function() {
        return this.setRoute("/game/1");
      },
      "/game/:seed": (function(_this) {
        return function(seed) {
          _this.world.build(seed);
          _this.fairy.transportTo(world.maze.start);
          _this.world.cells[_this.fairy.index] |= World.OCCUPIED | World.VISITED;
          _this.renderer.paint();
          _this.treeView.paint();
          _this.renderer.updateCell(_this.fairy.index);
          if (!_this.running) {
            return tick();
          }
        };
      })(this)
    });
    return router.init("/");
  });

}).call(this);
