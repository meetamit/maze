(function() {
  requirejs(["models/world", "models/fairy", "views/renderer", "views/tree_renderer"], function(World, Fairy, Renderer, TreeRenderer) {
    var tick;
    this.world = new World(window.innerWidth, window.innerHeight);
    this.fairy = new Fairy();
    this.fairy.enter(world).transportTo(world.maze.start).on("indexChanged", (function(_this) {
      return function(index) {
        return _this.treeView.updateFairy();
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
      this.renderer.update();
      return setTimeout(tick, 30);
    };
    return tick();
  });

}).call(this);
