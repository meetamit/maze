define ["models/world", "lib/d3"], (World, d3) ->
  class Renderer
    constructor: (attrs) ->
      { @world, @fairy } = attrs
      @sel = d3.select("body")
        .append "div"
        .attr "class", "world"
      @wallsCanvas = @sel.append "canvas"
      @wallsCtx = @wallsCanvas.node().getContext "2d"
      @_renderWalls()

      @fairySel = @sel.selectAll(".fairy")
        .data [null]
      @fairySel.enter()
        .append "div"
        .attr
          class: "fairy"

      @update()
    update: ->
      @fairySel
        .style
          left: @fairy.pixel[0] + "px"
          top:  @fairy.pixel[1] + "px"
    _renderWalls: ->
      @wallsCanvas.attr
        width:  @world.size[0]
        height: @world.size[1]
      # Clear the canvas
      @wallsCtx.fillStyle = "white"
      @wallsCtx.fillRect(
        0, 0,
        (@world.cellSize + @world.cellSpacing) * @world.gridSize[0] + @world.cellSpacing,
        (@world.cellSize + @world.cellSpacing) * @world.gridSize[1] + @world.cellSpacing
      )
      # Fill the walls
      @wallsCtx.fillStyle = "black"
      for cell, i in @world.cells
        @_fillCell i
        if cell & World.S then @_fillSouth i
        if cell & World.E then @_fillEast i
    _fillCell: (index) ->
      i = index % @world.gridSize[0]
      j = index / @world.gridSize[0] | 0;
      @wallsCtx.fillRect(
        i * @world.cellSize + (i + 1) * @world.cellSpacing,
        j * @world.cellSize + (j + 1) * @world.cellSpacing,
        @world.cellSize, @world.cellSize
      )
    _fillEast: (index) ->
      i = index % @world.gridSize[0]
      j = index / @world.gridSize[0] | 0;
      @wallsCtx.fillRect(
        (i + 1) * (@world.cellSize + @world.cellSpacing),
        j * @world.cellSize + (j + 1) * @world.cellSpacing,
        @world.cellSpacing, @world.cellSize
      )
    _fillSouth: (index) ->
      i = index % @world.gridSize[0]
      j = index / @world.gridSize[0] | 0;
      @wallsCtx.fillRect(
        i * @world.cellSize + (i + 1) * @world.cellSpacing,
        (j + 1) * (@world.cellSize + @world.cellSpacing),
        @world.cellSize, @world.cellSpacing
      )
