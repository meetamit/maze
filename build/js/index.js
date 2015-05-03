(function() {
  requirejs(["models/world", "models/fairy", "views/renderer"], function(World, Fairy, Renderer) {
    var fairy, renderer, tick, world;
    world = window.world = new World(window.innerWidth, window.innerHeight);
    fairy = window.fairy = new Fairy();
    fairy.enter(world).transportTo(world.maze.start);
    renderer = new Renderer({
      world: world,
      fairy: fairy
    }).on("arrowPressed", (function(_this) {
      return function(direction) {
        return fairy.wish().head(direction);
      };
    })(this)).on("cellSelected", (function(_this) {
      return function(index) {
        return fairy.wish().goto(index);
      };
    })(this));
    tick = function() {
      fairy.tick();
      renderer.update();
      return setTimeout(tick, 30);
    };
    return tick();
  });

}).call(this);
