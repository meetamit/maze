(function() {
  define(["models/world", "lib/d3"], function(World, d3) {
    var Brain, Fairy;
    Brain = (function() {
      function Brain(fairy) {
        this.fairy = fairy;
      }

      return Brain;

    })();
    d3.select("body").on("keydown.player", (function(_this) {
      return function() {
        var direction, key, next;
        key = d3.event.keyCode;
        if (key === 38) {
          direction = World.N;
        } else if (key === 40) {
          direction = World.S;
        } else if (key === 37) {
          direction = World.W;
        } else if (key === 39) {
          direction = World.E;
        }
        next = _this.fairy.world.possiblyDue(direction).from(_this.fairy.position);
        if (next !== _this.fairy.position) {
          return _this.fairy.moveTo(next);
        }
      };
    })(this));
    return Fairy = (function() {
      function Fairy() {
        this.brain = new Brain(this);
        this.dispatch = d3.dispatch("change");
        d3.rebind(this, this.dispatch, "on", "off");
      }

      Fairy.prototype.enter = function(world) {
        this.world = world;
        return this;
      };

      Fairy.prototype.transportTo = function(position) {
        this.position = position;
        this.pixel = this.world.indexToPixelPos(this.position);
        return this;
      };

      Fairy.prototype.moveTo = function(index, callback) {
        var previous;
        if (callback == null) {
          callback = function() {};
        }
        previous = this.position;
        this.position = index;
        this.dispatch.change(this.position, previous);
        return callback();
      };

      Fairy.prototype.moveTowards = function(index) {
        this.target = index;
        this.plan = this._getMoves();
        return this._executeNextStep();
      };

      Fairy.prototype._executeNextStep = function() {
        var nextMove;
        nextMove = this.plan.shift();
        if (nextMove) {
          this.next = this.world.neighbour(this.position, nextMove);
          return this.moveTo(nextMove, this._executeNextStep.bind(this));
        } else if (this.position === this.target) {
          this.target = null;
          return this.plan = null;
        } else {
          throw new Error("Done moving, but didn't reach target");
        }
      };

      return Fairy;

    })();
  });

}).call(this);
