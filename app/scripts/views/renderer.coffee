define ["models/world", "lib/d3"], (World, d3) ->
  class Renderer
    pink: d3.rgb "#f4a"
    black: "#000"
    constructor: (attrs) ->
      { @world, @fairy, @parent } = attrs

      @dispatch = d3.dispatch "arrowPressed", "cellSelected", "treeToggled", "heightChanged", "realFairyClicked"
      d3.rebind @, @dispatch, "on", "off"

      d3.select(window)
        .on "scroll", =>
          if window.innerHeight != @world.size[1]
            @dispatch.heightChanged window.innerHeight
          @sel.classed "suspended", (window.scrollY + @world.cellSize < @sel.node().offsetTop)

      @body = d3.select("body")
        .on "keydown.player", =>
          key = d3.event.keyCode
          direction = if key is 38 then World.N # up
          else        if key is 40 then World.S # down
          else        if key is 37 then World.W # left
          else        if key is 39 then World.E # right
          if direction?
            d3.event.preventDefault()
            @dispatch.arrowPressed direction

          if key is 84 then @dispatch.treeToggled() # T key

      @parent ||= @body
      @sel = @parent.append "div"
        .attr "class", "world suspended"
        .on "touchstart.player", =>
          # d3.event.preventDefault()
          @_scrollAtStart = window.scrollY
        .on "touchend.player", =>
          return if window.scrollY != @_scrollAtStart
          mouse = d3.mouse @wallsCanvas.node()
          cell = @world.pixelPosToIndex mouse
          @dispatch.cellSelected cell


      @wallsCanvas = @sel.append "canvas"
      @wallsCtx = @wallsCanvas.node().getContext "2d"

      @fairySel = @sel.selectAll(".fairy")
        .data [null]
      @fairySel.enter()
        .append "div"
        .attr
          class: "fairy"
        .style "background", String @pink

      @endSel = @sel.selectAll(".end")
        .data [null]
      @endSel.enter()
        .append "div"
        .attr
          class: "end"

      @realFairySel = @sel.selectAll(".real-fairy")
        .data [null]
      @realFairySel.enter()
        .append "div"
        .attr
          class: "real-fairy"
        .on "click", =>
          @dispatch.realFairyClicked()
      # @realFairySel
      #   .append "img"
      #   .attr "src", "img/fairy.gif"


    tick: ->
      sz = Math.max 11, @world.cellSize - 18
      @fairySel
        .style
          left: @fairy.pixel[0] + "px"
          top:  @fairy.pixel[1] + "px"
          width:  sz + "px"
          height: sz + "px"
          margin: -sz/2 + "px"

    showTrail: (@_showTrail) ->
      @paint() if @world.requiredSize?[0]
      @

    showWin: ->
      @showTrail true
      @sel.classed "winner", true

    updateCell: (index, forceFull = false) ->
      cell = @world.cells[index]

      fill =
        if !@_showTrail then @black
        else if cell & World.REVISITED then "#393939"
        else if cell & World.OCCUPIED  then String @pink.darker(2)
        else if cell & World.VISITED   then String @pink.darker(3)
        else @black
      if forceFull then fill = @black

      if (cell >> 4) and !forceFull then gap = 6

      @wallsCtx.fillStyle = fill
      @_fillCell index, gap

      allowSouth = forceFull or (@world.cells[ @world.due(World.S).from(index) ] & World.VISITED)
      allowEast  = forceFull or (@world.cells[ @world.due(World.E).from(index) ] & World.VISITED)
      if (cell & World.S) and allowSouth then @_fillSouth index, gap
      if (cell & World.E) and allowEast  then @_fillEast  index, gap

    paint: ->
      @wallsCanvas.attr
        width:  @world.requiredSize[0]
        height: Math.max @world.requiredSize[1], @world.size[1] - 10
      # Clear the canvas
      @wallsCtx.fillStyle = String @pink
      @wallsCtx.fillRect(
        0, 0,
        (@world.cellSize + @world.cellSpacing) * @world.gridSize[0] + @world.cellSpacing,
        (@world.cellSize + @world.cellSpacing) * @world.gridSize[1] + @world.cellSpacing
      )
      @updateCell i, true for cell, i in @world.cells
      @updateCell i, false for cell, i in @world.cells

      endPt = @world.indexToPixelPos @world.maze.end.index
      @endSel
        .style
          left: endPt[0] + "px"
          top:  endPt[1] + "px"

      @realFairySel
        .style
          left: endPt[0] + "px"
          top:  endPt[1] + "px"
      @sel.classed "winner", false

    _fillCell: (index, gap = 0) ->
      i = index % @world.gridSize[0]
      j = index / @world.gridSize[0] | 0;
      @wallsCtx.fillRect(
        i * @world.cellSize + (i + 1) * @world.cellSpacing + gap,
        j * @world.cellSize + (j + 1) * @world.cellSpacing + gap,
        @world.cellSize - gap * 2, @world.cellSize - gap * 2
      )
    _fillEast: (index, gap = 0) ->
      i = index % @world.gridSize[0]
      j = index / @world.gridSize[0] | 0;
      @wallsCtx.fillRect(
        (i + 1) * (@world.cellSize + @world.cellSpacing) - gap,
        j * @world.cellSize + (j + 1) * @world.cellSpacing + gap,
        @world.cellSpacing + gap * 2, @world.cellSize - gap * 2
      )
    _fillSouth: (index, gap = 0) ->
      i = index % @world.gridSize[0]
      j = index / @world.gridSize[0] | 0;
      @wallsCtx.fillRect(
        i * @world.cellSize + (i + 1) * @world.cellSpacing + gap,
        (j + 1) * (@world.cellSize + @world.cellSpacing) - gap,
        @world.cellSize - gap * 2, @world.cellSpacing + gap * 2
      )
