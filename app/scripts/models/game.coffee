define ["models/world", "models/fairy"], (World, Fairy) ->
  class Game
    constructor: ->
      @dispatch = d3.dispatch("gameStarted", "gameWon")
      @storage = new LocalStorageManager
      d3.rebind @, @dispatch, "on", "off"

      @density = @storage.getItem "density"
      if !@density? then @setDensity 12
      else @density = Number @density

      @showTrail = @storage.getItem "showTrail"
      if !@showTrail? then @toggleTrail false
      else @showTrail = @showTrail == "true"

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

          if index == @world.maze.end.index
            setTimeout =>
              @dispatch.gameWon()
            , 500

    updateSize: () ->
      @world.size = [window.innerWidth, window.innerHeight]

    build: (@seed) ->
      @started = false
      @world.build @seed, @density
      @fairy.transportTo @world.maze.start
      @world.cells[@fairy.index] |= World.OCCUPIED | World.VISITED

    setDensity: (density = @density) ->
      @density = density
      @storage.setItem "density", @density
    toggleTrail: (force) ->
      @showTrail = force ? not @showTrail
      @storage.setItem "showTrail", String @showTrail

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
