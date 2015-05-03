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

      next = @fairy.world.possiblyDue(direction).from @fairy.index
      @fairy.moveTo next if next != @fairy.index

  class Fairy
    constructor: ->
      @brain = new Brain @
      @dispatch = d3.dispatch("change")
      @velocity = [0,0]
      d3.rebind @, @dispatch, "on", "off"
    tick: ->
      return @ if !@target
      diff = [
        @target.pixel[0] - @pixel[0]
        @target.pixel[1] - @pixel[1]
      ]
      dist = Math.sqrt diff[0] * diff[0] + diff[1] * diff[1]
      if dist < 0.1
        @velocity[0] = @velocity[1] = 0
        @pixel[0] = @target.pixel[0]
        @pixel[1] = @target.pixel[1]
        @target = null
        return @

      speed = Math.min 5, dist, 1 + Math.sqrt @velocity[0] * @velocity[0] + @velocity[1] * @velocity[1]
      heading = Math.atan2 diff[1], diff[0]
      @velocity = [
        speed * Math.cos heading
        speed * Math.sin heading
      ]
      @pixel[0] += @velocity[0]
      @pixel[1] += @velocity[1]
      @index = @world.pixelPosToIndex @pixel
      @

    enter: (@world) -> @
    transportTo: (@index) ->
      @pixel = @world.indexToPixelPos @index
      @
    moveTo: (index, callback = ->) ->
      @target =
        index: index
        pixel: @world.indexToPixelPos index
