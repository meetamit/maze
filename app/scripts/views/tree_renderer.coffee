define ['lib/d3'], (d3) ->
  class TreeRenderer
    margin:
      top:    20
      right:  20
      bottom: 20
      left:   20

    constructor: (attrs) ->
      { @world, @fairy, @parent } = attrs

      @parent ||= d3.select "body"
      @sel = @parent.append "div"
        .attr "class", "tree"
        .style "display", "none"

      @layout = d3.layout.tree()
      @update()

      d3.select(window)
        .on "resize", =>
          @update()

    toggle: ->
      @isVisible = not @isVisible
      @sel.style "display", if @isVisible then "" else "none"

    update: ->
      @size = [
        @parent.node().offsetWidth
        @parent.node().offsetHeight
      ]
      @inner = [
        @size[0] - @margin.left - @margin.right
        @size[1] - @margin.top  - @margin.bottom
      ]
      @transpose = @inner[0] > @inner[1]
      @svg = @sel.selectAll("svg")
        .data([null])
      @svg.enter()
        .append "svg"
      @svg
        .attr
          width:  @size[0]
          height: @size[1]

      @layout = d3.layout.tree()
      @layout.size if @transpose then @inner.concat().reverse() else @inner

      @nodes = @layout.nodes(@world.maze.tree).sort (a, b) -> d3.ascending a.index, b.index
      links = @layout.links @nodes

      g = @svg.selectAll("g.links")
        .data [null]
      g.enter()
        .append "g"
        .attr "class", "links"
        .attr "transform", "translate(#{@margin.left},#{@margin.top})"

      link = g.selectAll ".link"
        .data links
      link.enter()
        .append "path"
        .attr "class", "link"
      link
        .transition()
        .attr
          d:  if @transpose
                (d) -> "M" + d.source.y + "," + d.source.x + "L" + d.target.y + "," + d.target.x
              else
                (d) -> "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y

      @updateFairy()

    updateFairy: ->
      g = @svg.selectAll("g.marks")
        .data [null]
      g.enter()
        .append "g"
        .attr "class", "marks"
        .attr "transform", "translate(#{@margin.left},#{@margin.top})"

      node = @nodes[@fairy.index]
      mark = g.selectAll "circle"
        .data [@fairy]
      mark.enter()
        .append "circle"
        .attr
          fill: "orange"
          r: 10
      mark
        .attr
          cx: if @transpose then node.y else node.x
          cy: if @transpose then node.x else node.y

