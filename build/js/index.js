(function() {
  requirejs(["models/world", "models/fairy", "views/renderer"], function(World, Fairy, Renderer) {
    var fairy, renderer, world;
    world = window.world = new World(window.innerWidth, window.innerHeight);
    fairy = window.fairy = new Fairy();
    fairy.enter(world).transportTo(world.maze.start).on("change", function(to, from) {
      return renderer.update();
    });
    return renderer = new Renderer({
      world: world,
      fairy: fairy
    });
  });

}).call(this);
