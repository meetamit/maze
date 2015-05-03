(function() {
  requirejs(["models/world", "models/fairy", "views/renderer"], function(World, Fairy, Renderer) {
    var fairy, renderer, tick, world;
    world = window.world = new World(window.innerWidth, window.innerHeight);
    fairy = window.fairy = new Fairy();
    fairy.enter(world).transportTo(world.maze.start);
    renderer = new Renderer({
      world: world,
      fairy: fairy
    });
    tick = function() {
      fairy.tick();
      renderer.update();
      return setTimeout(tick, 30);
    };
    return tick();
  });

}).call(this);
