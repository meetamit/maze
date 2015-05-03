(function() {
  define(["models/world", "lib/d3"], function(World, d3) {
    var Brain, Fairy;
    Brain = (function() {
      function Brain(fairy) {
        this.fairy = fairy;
      }

      Brain.prototype.head = function(direction) {
        var next;
        next = this.fairy.world.possiblyDue(direction).from(this.fairy.index);
        if (next !== this.fairy.index) {
          return this.fairy.moveTo(next);
        }
      };

      return Brain;

    })();
    return Fairy = (function() {
      function Fairy() {
        this.velocity = [0, 0];
        this.brain = new Brain(this);
        this.dispatch = d3.dispatch("change");
        d3.rebind(this, this.dispatch, "on", "off");
      }

      Fairy.prototype.tick = function() {
        var diff, dist, heading, speed;
        if (!this.target) {
          return this;
        }
        diff = [this.target.pixel[0] - this.pixel[0], this.target.pixel[1] - this.pixel[1]];
        dist = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
        if (dist < 0.1) {
          this.velocity[0] = this.velocity[1] = 0;
          this.pixel[0] = this.target.pixel[0];
          this.pixel[1] = this.target.pixel[1];
          this.target = null;
          return this;
        }
        speed = Math.min(5, dist, 1 + Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[1] * this.velocity[1]));
        heading = Math.atan2(diff[1], diff[0]);
        this.velocity = [speed * Math.cos(heading), speed * Math.sin(heading)];
        this.pixel[0] += this.velocity[0];
        this.pixel[1] += this.velocity[1];
        this.index = this.world.pixelPosToIndex(this.pixel);
        return this;
      };

      Fairy.prototype.enter = function(world) {
        this.world = world;
        return this;
      };

      Fairy.prototype.wish = function() {
        return this.brain;
      };

      Fairy.prototype.transportTo = function(index1) {
        this.index = index1;
        this.pixel = this.world.indexToPixelPos(this.index);
        return this;
      };

      Fairy.prototype.moveTo = function(index, callback) {
        if (callback == null) {
          callback = function() {};
        }
        return this.target = {
          index: index,
          pixel: this.world.indexToPixelPos(index)
        };
      };

      return Fairy;

    })();
  });

}).call(this);
