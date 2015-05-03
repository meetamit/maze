define ["models/maze"], (Maze) ->
  class World
    @N: 1 << 0
    @S: 1 << 1
    @W: 1 << 2
    @E: 1 << 3

    constructor: (width, height, @cellSize = 24, @cellSpacing = 2) ->
      @size = [width, height]
      @gridSize = [
        Math.floor (@size[0] - @cellSpacing) / (@cellSize + @cellSpacing)
        Math.floor (@size[1] - @cellSpacing) / (@cellSize + @cellSpacing)
      ]

      @maze = new Maze @gridSize
      @cells = @maze.generate()

    indexToGridPos: (index) ->
      [
        index % @gridSize[0]
        Math.floor index / @gridSize[0]
      ]
    gridToPixelPos: (gridPos) ->
      [
        gridPos[0] * (@cellSize + @cellSpacing) + (@cellSpacing + @cellSize / 2)
        gridPos[1] * (@cellSize + @cellSpacing) + (@cellSpacing + @cellSize / 2)
      ]
    indexToPixelPos: (index) ->
      @gridToPixelPos @indexToGridPos index

    getGridSize: -> @gridSize

    dues: []
    due: (direction) ->
      @dues[direction] ||=
        world: @
        direction: direction
        from: switch direction
          when World.N then (position) -> position - @world.gridSize[0]
          when World.S then (position) -> position + @world.gridSize[0]
          when World.E then (position) -> position + 1
          when World.W then (position) -> position - 1

    possiblyDues: []
    possiblyDue: (direction) ->
      @possiblyDues[direction] ||=
        world: @
        direction: direction
        from: (position) ->
          if @check position
            @world.due(direction).from position
          else position
        check: (position) ->
          @world.cells[position] & direction
