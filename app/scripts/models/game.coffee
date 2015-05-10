define ["models/world", "models/fairy"], (World, Fairy) ->
  class Game
    constructor: ->
      @dispatch = d3.dispatch("gameStarted")
      @storage = new LocalStorageManager
      d3.rebind @, @dispatch, "on", "off"

      @density = Number @storage.getItem "density"
      if !@density? then @setDensity 12

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
      @world.build @seed, @density
      @fairy.transportTo @world.maze.start
      @world.cells[@fairy.index] |= World.OCCUPIED | World.VISITED

    setDensity: (density = @density) ->
      @density = density
      @storage.setItem "density", @density

    tick: ->
      @fairy.tick()



  window.fakeStorage =
    _data: {}

    setItem: (id, val) ->
      @_data[id] = String(val)

    getItem: (id) ->
      if @_data.hasOwnProperty(id) then @_data[id] else undefined

    removeItem: (id) ->
      delete @_data[id]

    clear: () ->
      @_data = {}

  class LocalStorageManager
    constructor: ->
      @bestScoreKey     = "bestScore";
      @gameStateKey     = "gameState";

      supported = @localStorageSupported();
      @storage = if supported then window.localStorage else window.fakeStorage;
      return @storage

    localStorageSupported: ->
      testKey = "test"
      storage = window.localStorage
      try
        storage.setItem(testKey, "1")
        storage.removeItem(testKey)
        return true
      catch
        return false

  return Game
