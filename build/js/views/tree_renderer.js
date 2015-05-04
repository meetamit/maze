(function() {
  define(['lib/d3'], function(d3) {
    var TreeRenderer;
    return TreeRenderer = (function() {
      TreeRenderer.prototype.margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      };

      function TreeRenderer(attrs) {
        this.world = attrs.world, this.fairy = attrs.fairy, this.parent = attrs.parent;
        this.parent || (this.parent = d3.select("body"));
        this.sel = this.parent.append("div").attr("class", "tree").style("display", "none");
        this.layout = d3.layout.tree();
        this.update();
        d3.select(window).on("resize", (function(_this) {
          return function() {
            return _this.update();
          };
        })(this));
      }

      TreeRenderer.prototype.toggle = function() {
        this.isVisible = !this.isVisible;
        return this.sel.style("display", this.isVisible ? "" : "none");
      };

      TreeRenderer.prototype.update = function() {
        var g, link, links;
        this.size = [this.parent.node().offsetWidth, this.parent.node().offsetHeight];
        this.inner = [this.size[0] - this.margin.left - this.margin.right, this.size[1] - this.margin.top - this.margin.bottom];
        this.transpose = this.inner[0] > this.inner[1];
        this.svg = this.sel.selectAll("svg").data([null]);
        this.svg.enter().append("svg");
        this.svg.attr({
          width: this.size[0],
          height: this.size[1]
        });
        this.layout = d3.layout.tree();
        this.layout.size(this.transpose ? this.inner.concat().reverse() : this.inner);
        this.nodes = this.layout.nodes(this.world.maze.tree);
        links = this.layout.links(this.nodes);
        g = this.svg.selectAll("g.links").data([null]);
        g.enter().append("g").attr("class", "links").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        link = g.selectAll(".link").data(links);
        link.enter().append("path").attr("class", "link");
        link.transition().attr({
          d: this.transpose ? function(d) {
            return "M" + d.source.y + "," + d.source.x + "L" + d.target.y + "," + d.target.x;
          } : function(d) {
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
          }
        });
        return this.updateFairy();
      };

      TreeRenderer.prototype.updateFairy = function() {
        var g, mark, node;
        g = this.svg.selectAll("g.marks").data([null]);
        g.enter().append("g").attr("class", "marks").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        node = this.world.maze.nodes[this.fairy.index];
        mark = g.selectAll("circle").data([this.fairy]);
        mark.enter().append("circle").attr({
          fill: "orange",
          r: 10
        });
        return mark.attr({
          cx: this.transpose ? node.y : node.x,
          cy: this.transpose ? node.x : node.y
        });
      };

      return TreeRenderer;

    })();
  });

}).call(this);
