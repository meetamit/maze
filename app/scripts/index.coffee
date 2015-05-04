requirejs [
  "models/world"
  "models/fairy"
  "views/renderer"
  "views/tree_renderer"], (World, Fairy, Renderer, TreeRenderer) ->
  # Create objects
  @world = new World(window.innerWidth, window.innerHeight)
  @fairy = new Fairy()

  # Start the game
  @fairy
    .enter world
    .transportTo world.maze.start
    .on "indexChanged", (index) =>
      @treeView.updateFairy()

  # Initialize the renderer
  @renderer = new Renderer
    world: world
    fairy: @fairy
  .on "arrowPressed", (direction) =>
    @fairy.wish().head direction
  .on "treeToggled", =>
    @treeView.toggle()
  .on "cellSelected", (index) =>
    @fairy.wish().goto index

  @treeView = new TreeRenderer
    world: world
    fairy: @fairy

  tick = ->
    @fairy.tick()
    @renderer.update()
    setTimeout tick, 30
    # window.requestAnimationFrame tick

  tick()

  # class Judge
  #   constructor: (@fairy) ->
  #     @fairy.on "change_cell", (to, from) ->
  #   setWorld: (@maze) ->
  #     @tree = @_generateTree @maze
