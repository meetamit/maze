define ["models/world", "lib/d3"], (World, d3) ->
  class Brain
    constructor: (fairy) ->
      @fairy = fairy
    head: (direction) ->
      next = @fairy.world.possiblyDue(direction).from @fairy.index
      @fairy.moveTo next if next != @fairy.index

    goto: (index) ->
      # Try to find a path (without making decisions)
      node0 = @fairy.world.maze.nodes[@fairy.index]
      node1 = @fairy.world.maze.nodes[index]
      path = @seek node0, node1
      # console.log 'goto', index, 'via', path
      @fairy.follow path if path

    seek: (node0, node1, decisions = 0, visited = []) ->
      visited.push node0.index
      choices = node0.children
      if node0.parent?
        choices = (choices ? []).concat node0.parent
      choices = choices.filter (choice) -> choice.index not in visited

      # Try to head there in a straight line
      pos0 = @fairy.world.indexToGridPos node0.index
      pos1 = @fairy.world.indexToGridPos node1.index
      if pos0[0] == pos1[0]
        delta = pos1[1] - pos0[1]
        if delta > 0
          direction = World.S
        else if delta < 0
          direction = World.N
      else if pos0[1] == pos1[1]
        delta = pos1[0] - pos0[0]
        if delta > 0
          direction = World.E
        else if delta < 0
          direction = World.W

      if direction? and @fairy.world.cells[node0.index] & direction
        next = @fairy.world.due(direction).from node0.index
        if next? && next != node0.index && next not in visited
          choices = [ @fairy.world.maze.nodes[next] ]

      if node0 == node1
        return []
      else if !choices? or choices.length == 0
        return null
      else if choices.length == 1 or decisions == 0
        for choice in choices
          result = @seek choice, node1, decisions + 1, visited
          if result?
            result.unshift choice.index
            return result



  class Fairy
    constructor: ->
      @maxSpeed = 7#10
      @accel = .8
      @velocity = [0,0]
      @brain = new Brain @
      @dispatch = d3.dispatch("indexChanged")
      d3.rebind @, @dispatch, "on", "off"
    tick: ->
      return @ if !@target
      diff = [
        @target.pixel[0] - @pixel[0]
        @target.pixel[1] - @pixel[1]
      ]
      dist = Math.sqrt diff[0] * diff[0] + diff[1] * diff[1]
      if @index == @target.index && @plan.length > 0 && dist <= @maxSpeed
        oldTarget = @target
        @target = null
        oldTarget.callback()
        return @
      else if dist < 0.1
        @velocity[0] = @velocity[1] = 0
        @pixel[0] = @target.pixel[0]
        @pixel[1] = @target.pixel[1]
        oldTarget = @target
        @target = null
        oldTarget.callback()
        return @

      speed = Math.min @maxSpeed, dist, @accel + Math.sqrt @velocity[0] * @velocity[0] + @velocity[1] * @velocity[1]
      heading = Math.atan2 diff[1], diff[0]
      @velocity = [
        speed * Math.cos heading
        speed * Math.sin heading
      ]
      @pixel[0] += @velocity[0]
      @pixel[1] += @velocity[1]

      previous = @index
      @index = @world.pixelPosToIndex @pixel

      if @index != previous
        @dispatch.indexChanged @index
      @

    enter: (@world) -> @
    wish: -> @brain
    transportTo: (@index) ->
      @pixel = @world.indexToPixelPos @index
      @
    moveTo: (index, callback = ->) ->
      @target =
        index: index
        pixel: @world.indexToPixelPos index
        callback: callback
    follow: (path) ->
      @plan = path
      if @plan.length > 0
        @moveTo @plan.shift(), =>
          @follow @plan
