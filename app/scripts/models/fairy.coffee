define ["models/world", "lib/d3"], (World, d3) ->
  class Brain
    constructor: (fairy) ->
      @fairy = fairy

  d3.select "body"
    .on "keydown.player", =>
      key = d3.event.keyCode
      if      key is 38 then direction = World.N # up
      else if key is 40 then direction = World.S # down
      else if key is 37 then direction = World.W # left
      else if key is 39 then direction = World.E # right

      next = @fairy.world.possiblyDue(direction).from @fairy.position
      @fairy.moveTo next if next != @fairy.position

  class Fairy
    constructor: ->
      @brain = new Brain @
      @dispatch = d3.dispatch("change")
      d3.rebind @, @dispatch, "on", "off"
    enter: (@world) -> @
    transportTo: (@position) ->
      @pixel = @world.indexToPixelPos @position
      @
    moveTo: (index, callback = ->) ->
      # animate move, then ->
        previous = @position
        @position = index
        @dispatch.change @position, previous
        callback()
    moveTowards: (index) ->
      @target = index
      @plan = @_getMoves()
      @_executeNextStep()
    _executeNextStep: ->
      nextMove = @plan.shift()
      if nextMove
        @next = @world.neighbour @position, nextMove
        @moveTo nextMove, @_executeNextStep.bind @
      else if @position == @target
        @target = null
        @plan = null
      else throw new Error "Done moving, but didn't reach target"
