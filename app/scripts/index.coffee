requirejs [
  "models/world"
  "models/fairy"
  "views/renderer"
  "views/tree_renderer"
  "lib/director"
], (World, Fairy, Renderer, TreeRenderer, Director) ->
  # Create objects
  @world = new World(window.innerWidth, window.innerHeight)
  @fairy = new Fairy()

  # Start the game
  @fairy
    .enter @world
    .on "indexChanged", (index, previous) =>
      @treeView.updateFairy()

      # Game logic
      prevCell = @world.cells[previous]
      prevCell &= ~World.OCCUPIED

      newCell = @world.cells[index]
      newCell |= World.OCCUPIED

      if not (newCell & World.VISITED)
        newCell |= World.VISITED
      else
        newCell |= World.REVISITED
        prevCell |= World.REVISITED

      @world.cells[previous] = prevCell
      @world.cells[index] = newCell
      @renderer.updateCell previous
      @renderer.updateCell index

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
    @running = true
    @fairy.tick()
    @renderer.tick()
    window.requestAnimationFrame tick.bind(@)

  @router = Router
    "/": ->
      this.setRoute "/game/1"
    "/game/:seed": (seed) =>
      @world.build seed
      @fairy
        .transportTo world.maze.start

      # Game logic
      @world.cells[@fairy.index] |= World.OCCUPIED | World.VISITED

      @renderer.paint()
      @treeView.paint()
      @renderer.updateCell @fairy.index
      tick() unless @running


  router.init "/"
