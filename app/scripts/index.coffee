requirejs [
  "models/game"
  "views/renderer"
  "views/tree_renderer"
  "lib/director"
], (Game, Renderer, TreeRenderer, Director) ->
  # Create objects
  @game = new Game()
    .on "gameStarted.render", =>
      @updateResets "restart"

  # Start the game
  @game.fairy
    .on "indexChanged.render", (index, previous) =>
      @treeView.updateFairy()
      @renderer.updateCell previous
      @renderer.updateCell index

  # Initialize the renderer
  @renderer = new Renderer
    world: @game.world
    fairy: @game.fairy
  .showTrail @game.showTrail
  .on "arrowPressed", (direction) =>
    @game.fairy.wish().head direction
  .on "cellSelected", (index) =>
    @game.fairy.wish().goto index
  .on "treeToggled", =>
    @treeView.toggle()
  .on "heightChanged", (height) =>
    return if height < @game.world.size[1]
    if !@game.started
      # @game.world.size = [window.innerWidth, window.innerHeight]
      @game.updateSize()
      startGame @game.seed
      window.scroll 0, 200

  @treeView = new TreeRenderer
    world: @game.world
    fairy: @game.fairy

  @resets = d3.select "#resets"
  @resets.select("#restart")
    .on "click", =>
      startGame @game.seed
  @resets.select("#random")
    .on "click", =>
      @router.setRoute "/game/" + Math.floor(Math.random() * 100)

  @density = d3.select "#density"
    .attr "max", window.innerWidth / 15
    .on "change", =>
      @game.setDensity Number @density.property "value"
      startGame @game.seed
  @trail = d3.select "#trail"
    .classed "checked", @game.showTrail
    .on "click", =>
      @game.toggleTrail()
      @trail.classed "checked", @game.showTrail
      @renderer.showTrail @game.showTrail

  isTicking = false
  tick = ->
    isTicking = true
    @game.tick()
    @renderer.tick()
    window.requestAnimationFrame tick.bind(@)

  startGame = (seed) =>
    @updateResets("random")
    @density.property("value", @game.density)
    @game.build seed
    @renderer.paint()
    @treeView.paint()
    @renderer.updateCell @game.world.maze.start
    tick() unless isTicking

  @updateResets = (id) ->
    @resets.selectAll ".round-button"
      .style "display", ->
        if d3.select(@).attr("id") == id then "" else "none"


  @router = Router
    "/game/:seed": startGame
    "/": -> @setRoute "/game/1"


  @router.init "/"
