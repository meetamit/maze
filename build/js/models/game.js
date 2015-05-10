(function() {
  define(["models/world", "models/fairy"], function(World, Fairy) {
    var Game;
    return Game = (function() {
      function Game() {
        this.dispatch = d3.dispatch("gameStarted");
        d3.rebind(this, this.dispatch, "on", "off");
        this.world = new World(window.innerWidth, window.innerHeight);
        this.fairy = new Fairy;
        this.fairy.enter(this.world).on("indexChanged.game", (function(_this) {
          return function(index, previous) {
            var newCell, prevCell;
            prevCell = _this.world.cells[previous];
            prevCell &= ~World.OCCUPIED;
            newCell = _this.world.cells[index];
            newCell |= World.OCCUPIED;
            if (!(newCell & World.VISITED)) {
              newCell |= World.VISITED;
            } else {
              newCell |= World.REVISITED;
              prevCell |= World.REVISITED;
            }
            _this.world.cells[previous] = prevCell;
            _this.world.cells[index] = newCell;
            if (!_this.started) {
              _this.started = true;
              return _this.dispatch.gameStarted();
            }
          };
        })(this));
      }

      Game.prototype.build = function(seed) {
        this.seed = seed;
        this.started = false;
        this.world.build(this.seed);
        this.fairy.transportTo(this.world.maze.start);
        return this.world.cells[this.fairy.index] |= World.OCCUPIED | World.VISITED;
      };

      Game.prototype.tick = function() {
        return this.fairy.tick();
      };

      return Game;

    })();
  });

}).call(this);
