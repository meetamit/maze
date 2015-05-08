define ["models/world", "lib/d3"], (World, d3) ->
  class Renderer
    constructor: (attrs) ->
      { @world, @fairy, @parent } = attrs

      @dispatch = d3.dispatch("arrowPressed", "cellSelected", "treeToggled")
      d3.rebind @, @dispatch, "on", "off"

      @body = d3.select("body")
        .on "keydown.player", =>
          key = d3.event.keyCode
          direction = if key is 38 then World.N # up
          else        if key is 40 then World.S # down
          else        if key is 37 then World.W # left
          else        if key is 39 then World.E # right
          @dispatch.arrowPressed direction if direction?

          if key is 84 then @dispatch.treeToggled() # T key
        .on "touchstart.player", =>
          mouse = d3.mouse @wallsCanvas.node()
          cell = @world.pixelPosToIndex mouse
          @dispatch.cellSelected cell


      @parent ||= @body
      @sel = @parent.append "div"
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

      endPt = @world.indexToPixelPos @world.maze.end.index
      @endSel = @sel.selectAll(".end")
        .data [null]
      @endSel.enter()
        .append "div"
        .attr
          class: "end"
      @endSel
        .style
          left: endPt[0] + "px"
          top:  endPt[1] + "px"

      @tick()

    tick: ->
      @fairySel
        .style
          left: @fairy.pixel[0] + "px"
          top:  @fairy.pixel[1] + "px"

    updateCell: (index) ->
      cell = @world.cells[index]

      @wallsCtx.fillStyle =
        if      cell & World.REVISITED then "#311"
        else if cell & World.OCCUPIED  then "#226"
        else if cell & World.VISITED   then "#131"
        else "black"

      @_fillCell index
      if cell & World.S then @_fillSouth index
      if cell & World.E then @_fillEast index

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
        @updateCell i
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
