define ["models/world", "models/fairy"], (World, Fairy) ->
  class Game
    constructor: ->
      @dispatch = d3.dispatch("gameStarted")
      d3.rebind @, @dispatch, "on", "off"

      @world = new World window.innerWidth, window.innerHeight
      @fairy = new Fairy

      @fairy
        .enter @world
        .on "indexChanged.game", (index, previous) =>
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

          if not @started
            @started = true
            @dispatch.gameStarted()

    build: (@seed) ->
      @started = false
      @world.build @seed
      @fairy.transportTo @world.maze.start
      @world.cells[@fairy.index] |= World.OCCUPIED | World.VISITED

    tick: ->
      @fairy.tick()
