requirejs [
  "models/world"
  "models/fairy"
  "views/renderer"], (World, Fairy, Renderer) ->
  # Create objects
  world = window.world = new World(window.innerWidth, window.innerHeight)
  fairy = window.fairy = new Fairy()

  # Start the game
  fairy
    .enter world
    .transportTo world.maze.start

  # Initialize the renderer
  renderer = new Renderer
    world: world
    fairy: fairy

  tick = ->
    fairy.tick()
    renderer.update()
    setTimeout tick, 30
    # window.requestAnimationFrame tick

  tick()

  # class Judge
  #   constructor: (@fairy) ->
  #     @fairy.on "change_cell", (to, from) ->
  #   setWorld: (@maze) ->
  #     @tree = @_generateTree @maze
