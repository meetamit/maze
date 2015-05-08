define ["models/maze"], (Maze) ->
  class World
    klass: @ # debug

    @N: 1 << 0
    @S: 1 << 1
    @W: 1 << 2
    @E: 1 << 3

    @OCCUPIED:  1 << 4
    @VISITED:   1 << 5
    @REVISITED: 1 << 6

    constructor: (width, height, @cellSize = 24, @cellSpacing = 2) ->
      @size = [width, height]
      @gridSize = [
        Math.floor (@size[0] - @cellSpacing) / (@cellSize + @cellSpacing)
        Math.floor (@size[1] - @cellSpacing) / (@cellSize + @cellSpacing)
      ]

      @maze = new Maze
        gridSize: @gridSize
        seed: 2
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
    pixelPosToIndex: (pixel) ->
      @gridPosToIndex [
        Math.floor pixel[0] / (@cellSize + @cellSpacing)
        Math.floor pixel[1] / (@cellSize + @cellSpacing)
      ]
    gridPosToIndex: (gridPos) ->
      gridPos[0] + gridPos[1] * @gridSize[0]

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
