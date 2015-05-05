(function() {
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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

      Brain.prototype.goto = function(index) {
        var node0, node1, path;
        node0 = this.fairy.world.maze.nodes[this.fairy.index];
        node1 = this.fairy.world.maze.nodes[index];
        path = this.seek(node0, node1);
        if (path) {
          return this.fairy.follow(path);
        }
      };

      Brain.prototype.seek = function(node0, node1, decisions, visited) {
        var choice, choices, delta, direction, i, len, next, pos0, pos1, result;
        if (decisions == null) {
          decisions = 0;
        }
        if (visited == null) {
          visited = [];
        }
        visited.push(node0.index);
        choices = node0.children;
        if (node0.parent != null) {
          choices = (choices != null ? choices : []).concat(node0.parent);
        }
        choices = choices.filter(function(choice) {
          var ref;
          return ref = choice.index, indexOf.call(visited, ref) < 0;
        });
        pos0 = this.fairy.world.indexToGridPos(node0.index);
        pos1 = this.fairy.world.indexToGridPos(node1.index);
        if (pos0[0] === pos1[0]) {
          delta = pos1[1] - pos0[1];
          if (delta > 0) {
            direction = World.S;
          } else if (delta < 0) {
            direction = World.N;
          }
        } else if (pos0[1] === pos1[1]) {
          delta = pos1[0] - pos0[0];
          if (delta > 0) {
            direction = World.E;
          } else if (delta < 0) {
            direction = World.W;
          }
        }
        if ((direction != null) && this.fairy.world.cells[node0.index] & direction) {
          next = this.fairy.world.due(direction).from(node0.index);
          if ((next != null) && next !== node0.index && indexOf.call(visited, next) < 0) {
            choices = [this.fairy.world.maze.nodes[next]];
          }
        }
        if (node0 === node1) {
          return [];
        } else if ((choices == null) || choices.length === 0) {
          return null;
        } else if (choices.length === 1 || decisions === 0) {
          for (i = 0, len = choices.length; i < len; i++) {
            choice = choices[i];
            result = this.seek(choice, node1, decisions + 1, visited);
            if (result != null) {
              result.unshift(choice.index);
              return result;
            }
          }
        }
      };

      return Brain;

    })();
    return Fairy = (function() {
      function Fairy() {
        this.maxSpeed = 7;
        this.accel = .8;
        this.velocity = [0, 0];
        this.brain = new Brain(this);
        this.dispatch = d3.dispatch("indexChanged");
        d3.rebind(this, this.dispatch, "on", "off");
      }

      Fairy.prototype.tick = function() {
        var diff, dist, heading, oldTarget, previous, speed;
        if (!this.target) {
          return this;
        }
        diff = [this.target.pixel[0] - this.pixel[0], this.target.pixel[1] - this.pixel[1]];
        dist = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);
        if (this.index === this.target.index && this.plan.length > 0 && dist <= this.maxSpeed) {
          oldTarget = this.target;
          this.target = null;
          oldTarget.callback();
          return this;
        } else if (dist < 0.1) {
          this.velocity[0] = this.velocity[1] = 0;
          this.pixel[0] = this.target.pixel[0];
          this.pixel[1] = this.target.pixel[1];
          oldTarget = this.target;
          this.target = null;
          oldTarget.callback();
          return this;
        }
        speed = Math.min(this.maxSpeed, dist, this.accel + Math.sqrt(this.velocity[0] * this.velocity[0] + this.velocity[1] * this.velocity[1]));
        heading = Math.atan2(diff[1], diff[0]);
        this.velocity = [speed * Math.cos(heading), speed * Math.sin(heading)];
        this.pixel[0] += this.velocity[0];
        this.pixel[1] += this.velocity[1];
        previous = this.index;
        this.index = this.world.pixelPosToIndex(this.pixel);
        if (this.index !== previous) {
          this.dispatch.indexChanged(this.index);
        }
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
          pixel: this.world.indexToPixelPos(index),
          callback: callback
        };
      };

      Fairy.prototype.follow = function(path) {
        this.plan = path;
        if (this.plan.length > 0) {
          return this.moveTo(this.plan.shift(), (function(_this) {
            return function() {
              return _this.follow(_this.plan);
            };
          })(this));
        }
      };

      return Fairy;

    })();
  });

}).call(this);
