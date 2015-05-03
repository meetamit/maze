var mazeCanvas = d3.select("canvas.maze");
var mazeCtx = mazeCanvas.node().getContext("2d");
var uiCanvas   = d3.select("canvas.ui");
var uiCtx   = uiCanvas.node().getContext("2d");
var ctx = mazeCtx;

var N = 1 << 0,
    S = 1 << 1,
    W = 1 << 2,
    E = 1 << 3;

var interation = 'mousedown';//'touchstart'

var sizeParam = window.location.toString().match(/size\=(\d*)/)
if(sizeParam) sizeParam = Number(sizeParam[1]);

var margin = {top: 20, right: 20, bottom: 20, left: 20},
		height = Math.min(800, window.innerHeight),
		width = window.innerWidth,
		cellSize = sizeParam || 16,//24,
    cellSpacing = 2,
    cellWidth = Math.floor((width - cellSpacing) / (cellSize + cellSpacing)),
    cellHeight = Math.floor((height - cellSpacing) / (cellSize + cellSpacing));
    cells = generateMaze(cellWidth, cellHeight),
		root = generateTree(cellWidth, cellHeight, cells);

var target = deepest(root);

console.log(cells);
console.log(root);
console.log(target);

// Prepare the maze
mazeCanvas
  .attr({
    width: width,
    height: height
  })
mazeCtx.fillStyle = "white";
mazeCtx.fillRect(
  0, 0, 
  (cellSize + cellSpacing) * cellWidth + cellSpacing, 
  (cellSize + cellSpacing) * cellHeight + cellSpacing
)
// Draw the maze
mazeCtx.fillStyle = "black";
for(var i = 0, len = cells.length, cell; i < len; i++) {
  cell = cells[i];
  fillCell(i);
  if (cell & S) fillSouth(i);
  if (cell & E) fillEast(i);
}

// Prepare the ui
uiCanvas
  .attr({
    width: width,
    height: height
  })
  .on('mousemove', function() {
    var mouse = d3.mouse(this),
        cellX = Math.floor((mouse[0] - cellSpacing) / (cellSize + cellSpacing)),
        cellY = Math.floor((mouse[1] - cellSpacing) / (cellSize + cellSpacing)),
        index = cellX + cellY * cellWidth;
    highlightNode(index);
  })
  .on(interation, function() {
    var mouse = d3.mouse(this),
        mouseCellPos = [
          Math.floor((mouse[0] - cellSpacing) / (cellSize + cellSpacing)),
          Math.floor((mouse[1] - cellSpacing) / (cellSize + cellSpacing))
        ],
        mouseIndex = mouseCellPos[0] + mouseCellPos[1] * cellWidth, 
        markerCellPos = [
          markerIndex % cellWidth,
          Math.floor(markerIndex / cellWidth)
        ],
        prevIndex = markerIndex;
    var direction = null;
    if      (mouseCellPos[0] == markerCellPos[0]) {
      if      (mouseCellPos[1] > markerCellPos[1]) direction = S;
      else if (mouseCellPos[1] < markerCellPos[1]) direction = N;
    }
    else if (mouseCellPos[1] == markerCellPos[1]) {
      if      (mouseCellPos[0] > markerCellPos[0]) direction = E;
      else if (mouseCellPos[0] < markerCellPos[0]) direction = W;
    }
    while(direction && (cells[markerIndex] & direction) && markerIndex != mouseIndex) {
      switch(direction) {
        case S: markerIndex += cellWidth; break;
        case N: markerIndex -= cellWidth; break;
        case E: markerIndex += 1; break;
        case W: markerIndex -= 1; break;
      }
    }
    if(markerIndex != prevIndex) {
      updateMarker();
    }
    // else if (mouseCellPos[1] == markerCellPos[1])
  });


var marker = d3.select('.game .marker'),
    markerSize = cellSize * .8,
    markerIndex = root.index,
    markerPos = [null, null],
    markerNode = null
    potential = []
    tau = 2 * Math.PI;
marker
  .style({
    width: markerSize + 'px',
    height: markerSize + 'px'
  })
  .call(
    d3.behavior.drag()
      .on('dragstart', function() {
        d3.event.sourceEvent.preventDefault();
      })
      .on('drag', function() {
        var mouse = d3.mouse(this.parentNode),
            vector = [mouse[0] - markerPos[0], mouse[1] - markerPos[1]],
            magnitude = Math.sqrt( Math.pow(vector[0], 2) + Math.pow(vector[1], 2) ),
            angle = Math.atan2.apply(null, vector),
            heading = null,
            prevIndex = markerIndex;
        if(magnitude < cellSize * .75) return;
        angle = (tau / 8) * Math.round(angle / (tau / 8));
        if     (cells[markerIndex] & S && angle == 0)                 markerIndex += cellWidth;
        else if(cells[markerIndex] & N && Math.abs(angle) == tau / 2) markerIndex -= cellWidth;
        else if(cells[markerIndex] & E && angle == tau / 4) markerIndex += 1;
        else if(cells[markerIndex] & W && angle == -tau / 4) markerIndex -= 1;
        if(prevIndex != markerIndex) updateMarker();
      })
  )
  .call(updateMarker)

function updateMarker() {
  markerPos[0] = (cellSpacing + cellSize / 2) + (cellSize + cellSpacing) * (markerIndex % cellWidth)
  markerPos[1] = (cellSpacing + cellSize / 2) + (cellSize + cellSpacing) * Math.floor(markerIndex / cellWidth)
  marker
    .transition()
    .duration(100)
    .style({
      left: markerPos[0] - (markerSize / 2) + 'px',
      top:  markerPos[1] - (markerSize / 2) + 'px'
    });

  // markerNode = nodeAtIndex(markerIndex)
  // potential = []
  // for(var i = 0, child = null; i < markerNode.children.length; i++) {
  //   child = markerNode.children[i];
  //   while(true) {
  //     potential.push(child.index);
  //     if(!child.children || child.children.length == 0) break;
  //     else if(child.children.length > 1) {
  //       child.children.forEach(function(grandchild) {
  //         potential.push(grandchild.index)
  //       })
  //       break;
  //     }
  //     else if(child.children.length == 1) child = child.children[0];
  //   }
  // }

  // ctx = uiCtx;
  // ctx.fillStyle = "#222";
  // ctx.clearRect(0, 0, width, height);
  // console.log(potential)
  // potential.forEach(function(index) {
  //   fillCell(index);
  //   if (cells[index] & S) fillSouth(index);
  //   if (cells[index] & E) fillEast(index);

  // });
}

d3.select('body')
  .on('keydown.player', function() {
    switch(d3.event.keyCode) {
      case 38: // up
        if(cells[markerIndex] & N) {
          markerIndex -= cellWidth;
        }
        break;
      case 40: // down
        if(cells[markerIndex] & S) {
          markerIndex += cellWidth;
        }
        break;
      case 37: // left
        if(cells[markerIndex] & W) {
          markerIndex -= 1;
        }
        break;
      case 39: // right
        if(cells[markerIndex] & E) {
          markerIndex += 1;
        }
        break;
    }
    updateMarker();
    // console.log(d3.event.keyCode)
  })



var tree = d3.layout.tree()
    .size([
      height - margin.left - margin.right, 
      width - margin.left - margin.right
    ]);
var nodes = tree.nodes(root),
    links = tree.links(nodes);
var svg = d3.select("body").select("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.selectAll(".link")
    .data(links)
  .enter().append("path")
    .attr("class", "link")
    .attr("d", function(d) { return "M" + d.source.y + "," + d.source.x + "L" + d.target.y + "," + d.target.x; });

function nodeAtIndex(index) {
  var node = find(root, function(node) { return node.index == index; });
  return node;
  return nodes.filter(
    function(n) { return n.index == index; }
  )[0]
}
function highlightNode(index) {
  var node = nodeAtIndex(index);
  var mark = svg.selectAll('.mark')
  	.data(node ? [node] : [])
  mark.enter()
  	.append('circle')
  	.attr({
      "class": 'mark',
  		fill: 'orange',
      r: cellSize / 3
    });
  
 	mark
  	.transition()
  	.duration(150)
  	.attr({
      cx: function(d) { return d.y; },
      cy: function(d) { return d.x; },
    })
      
}

function find(node, fn) {
  if(fn(node))
    return node;
 	else if(node.children) {
    for(var i = 0, found = null; i < node.children.length; i++) {
      found = find(node.children[i], fn)
      if(found) return found;
    }
  }
  return null
}
function deepest(node) {
  debugger
  if(node.children && node.children.length > 0) {
    var deepestFound = null
    for(var i = 0, nd = null; i < node.children.length; i++) {
      if(node.children[i].depth != null) {
        nd = deepest(node.children[i])
        if(!deepestFound || (nd.depth > deepestFound.depth)) deepestFound = nd;
      }
    }
    return deepestFound;
  }
  else return node;
}
//maze generetaion code from "Visualizing Algorithms" by Mike Bostock
//see bost.ocks.org/mike/algorithms/ and bl.ocks.org/mbostock/c11d97ee1415d3ac4176
function fillCell(index) {
  var i = index % cellWidth, j = index / cellWidth | 0;
  ctx.fillRect(i * cellSize + (i + 1) * cellSpacing, j * cellSize + (j + 1) * cellSpacing, cellSize, cellSize);
}
function fillEast(index) {
  var i = index % cellWidth, j = index / cellWidth | 0;
  ctx.fillRect((i + 1) * (cellSize + cellSpacing), j * cellSize + (j + 1) * cellSpacing, cellSpacing, cellSize);
}
function fillSouth(index) {
  var i = index % cellWidth, j = index / cellWidth | 0;
  ctx.fillRect(i * cellSize + (i + 1) * cellSpacing, (j + 1) * (cellSize + cellSpacing), cellSize, cellSpacing);
}
function generateTree(width, height, _cells) {
  var cells = _cells || generateMaze(width, height), // each cell’s edge bits
      visited = d3.range(width * height).map(function() { return false; }),
      root = {index: cells.length - 1, children: []},
      frontier = [root],
      parent,
      child,
      childIndex,
      cell;

  while ((parent = frontier.pop()) != null) {
    cell = cells[parent.index];
    if (cell & E && !visited[childIndex = parent.index + 1]) visited[childIndex] = true, child = {index: childIndex, children: []}, parent.children.push(child), frontier.push(child);
    if (cell & W && !visited[childIndex = parent.index - 1]) visited[childIndex] = true, child = {index: childIndex, children: []}, parent.children.push(child), frontier.push(child);
    if (cell & S && !visited[childIndex = parent.index + width]) visited[childIndex] = true, child = {index: childIndex, children: []}, parent.children.push(child), frontier.push(child);
    if (cell & N && !visited[childIndex = parent.index - width]) visited[childIndex] = true, child = {index: childIndex, children: []}, parent.children.push(child), frontier.push(child);
  }

  return root;
}

function generateMaze(width, height) {
  var cells = new Array(width * height), // each cell’s edge bits
      frontier = [];

  var start = (height - 1) * width;
  cells[start] = 0;
  frontier.push({index: start, direction: N});
  frontier.push({index: start, direction: E});
  shuffle(frontier, 0, 2);
  while (!exploreFrontier()) { null };
  return cells;

  function exploreFrontier() {
    if ((edge = frontier.pop()) == null) return true;

    var edge,
        i0 = edge.index,
        d0 = edge.direction,
        i1 = i0 + (d0 === N ? -width : d0 === S ? width : d0 === W ? -1 : +1),
        x0 = i0 % width,
        y0 = i0 / width | 0,
        x1,
        y1,
        d1,
        open = cells[i1] == null; // opposite not yet part of the maze

    if (d0 === N) x1 = x0, y1 = y0 - 1, d1 = S;
    else if (d0 === S) x1 = x0, y1 = y0 + 1, d1 = N;
    else if (d0 === W) x1 = x0 - 1, y1 = y0, d1 = E;
    else x1 = x0 + 1, y1 = y0, d1 = W;

    if (open) {
      cells[i0] |= d0, cells[i1] |= d1;

      var m = 0;
      if (y1 > 0 && cells[i1 - width] == null) frontier.push({index: i1, direction: N}), ++m;
      if (y1 < height - 1 && cells[i1 + width] == null) frontier.push({index: i1, direction: S}), ++m;
      if (x1 > 0 && cells[i1 - 1] == null) frontier.push({index: i1, direction: W}), ++m;
      if (x1 < width - 1 && cells[i1 + 1] == null) frontier.push({index: i1, direction: E}), ++m;
      shuffle(frontier, frontier.length - m, frontier.length);
    }
  }

  function shuffle(array, i0, i1) {
    var m = i1 - i0, t, i, j;
    while (m) {
      i = Math.random() * m-- | 0;
      t = array[m + i0], array[m + i0] = array[i + i0], array[i + i0] = t;
    }
    return array;
  }
}