# maze and tree generetaion code from "Visualizing Algorithms" by Mike Bostock
# see bost.ocks.org/mike/algorithms/ and bl.ocks.org/mbostock/c11d97ee1415d3ac4176
define ["lib/d3"], (d3) ->
  N = 1 << 0
  S = 1 << 1
  W = 1 << 2
  E = 1 << 3

  class Maze
    constructor: (attrs) ->
      { @gridSize, @seed, start } = attrs
      @start = start ? (@gridSize[1] - 1) * @gridSize[0]
    random: ->
      if @seed?
        x = Math.sin(@seed++) * 10000;
        x - Math.floor(x);
      else
        Math.random()
    generate: ->
      @cells = @_generateMaze @gridSize
      { @tree, @nodes, deepest } = @_generateTree()

      # find deepest node
      deepest = @nodes[0]
      for node in @nodes[1..]
        deepest = node if node.depth > deepest.depth
      @end = deepest

      @cells
    neighbor: (index, direction) ->
      switch direction
        when S then index + @gridSize[1]
        when N then index - @gridSize[1]
        when E then index + 1
        when W then index - 1
    _generateTree: ->
      [width, height] = @gridSize
      visited = d3.range(width * height).map (n, i) -> false
      visited[@start] = true
      root = index: @start, children: []
      nodes = [root]
      frontier = [root]
      while (parent = frontier.pop())?
        cell = @cells[parent.index];
        if (cell & E && !visited[childIndex = parent.index + 1])
          visited[childIndex] = true
          child = index: childIndex, children: []
          parent.children.push child
          nodes.push child
          frontier.push child
        if (cell & W && !visited[childIndex = parent.index - 1])
          visited[childIndex] = true
          child = index: childIndex, children: []
          parent.children.push child
          nodes.push child
          frontier.push child
        if (cell & S && !visited[childIndex = parent.index + width])
          visited[childIndex] = true
          child = index: childIndex, children: []
          parent.children.push child
          nodes.push child
          frontier.push child
        if (cell & N && !visited[childIndex = parent.index - width])
          visited[childIndex] = true
          child = index: childIndex, children: []
          parent.children.push child
          nodes.push child
          frontier.push child

      # run a d3 hierarchy layout on the tree, which adds depth info to it
      d3.layout.hierarchy()(root)

      tree: root
      deepest: nodes[nodes.length - 1]
      nodes: nodes.sort (a, b) -> d3.ascending a.index, b.index
    _generateMaze: ->
      [width, height] = @gridSize

      exploreFrontier = ->
        return true if !(edge = frontier.pop())?

        i0 = edge.index
        d0 = edge.direction
        i1 = i0 + if d0 == N then -width else if d0 == S then width else if d0 == W then -1 else +1
        x0 = i0 % width
        y0 = i0 / width | 0
        open = !cells[i1]? # opposite not yet part of the maze

        if      (d0 == N) then x1 = x0; y1 = y0 - 1; d1 = S
        else if (d0 == S) then x1 = x0; y1 = y0 + 1; d1 = N
        else if (d0 == W) then x1 = x0 - 1; y1 = y0; d1 = E
        else                   x1 = x0 + 1; y1 = y0; d1 = W

        if open
          cells[i0] |= d0; cells[i1] |= d1

          m = 0
          if (y1 > 0 && !cells[i1 - width]?)
            frontier.push index: i1, direction: N
            ++m
          if (y1 < height - 1 && !cells[i1 + width]?)
            frontier.push index: i1, direction: S
            ++m
          if (x1 > 0 && !cells[i1 - 1]?)
            frontier.push index: i1, direction: W
            ++m
          if (x1 < width - 1 && !cells[i1 + 1]?)
            frontier.push index: i1, direction: E
            ++m
          shuffle(frontier, frontier.length - m, frontier.length)
          return false

      shuffle = (array, i0, i1) =>
        m = i1 - i0; t = i = j = null
        while (m)
          i = @random() * m-- | 0
          t = array[m + i0]; array[m + i0] = array[i + i0]; array[i + i0] = t
        array

      cells = new Array(width * height) # each cell’s edge bits
      frontier = []

      cells[@start] = 0
      frontier.push index: @start, direction: N
      frontier.push index: @start, direction: E
      shuffle frontier, 0, 2
      null while !exploreFrontier()
      cells
