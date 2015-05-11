(function() {
  requirejs(["models/game", "views/renderer", "views/tree_renderer", "lib/director"], function(Game, Renderer, TreeRenderer, Director) {
    var isTicking, loadRandomGame, startGame, tick;
    this.game = new Game().on("gameStarted.render", (function(_this) {
      return function() {
        return _this.updateResets("restart");
      };
    })(this)).on("gameWon", (function(_this) {
      return function() {
        return _this.renderer.showWin();
      };
    })(this));
    this.game.fairy.on("indexChanged.render", (function(_this) {
      return function(index, previous) {
        _this.treeView.updateFairy();
        _this.renderer.updateCell(previous);
        return _this.renderer.updateCell(index);
      };
    })(this));
    this.renderer = new Renderer({
      world: this.game.world,
      fairy: this.game.fairy
    }).on("arrowPressed", (function(_this) {
      return function(direction) {
        return _this.game.fairy.wish().head(direction);
      };
    })(this)).on("cellSelected", (function(_this) {
      return function(index) {
        return _this.game.fairy.wish().goto(index);
      };
    })(this)).on("treeToggled", (function(_this) {
      return function() {
        return _this.treeView.toggle();
      };
    })(this)).on("heightChanged", (function(_this) {
      return function(height) {
        if (height < _this.game.world.size[1]) {
          return;
        }
        if (!_this.game.started) {
          _this.game.updateSize();
          startGame(_this.game.seed);
          return window.scroll(0, 200);
        }
      };
    })(this)).on("realFairyClicked", function() {
      return loadRandomGame();
    });
    this.treeView = new TreeRenderer({
      world: this.game.world,
      fairy: this.game.fairy
    });
    this.resets = d3.select("#resets");
    this.resets.select("#restart").on("click", (function(_this) {
      return function() {
        return startGame(_this.game.seed);
      };
    })(this));
    this.resets.select("#random").on("click", loadRandomGame = (function(_this) {
      return function() {
        var seed;
        seed = Math.floor(Math.random() * 100);
        history.replaceState({}, "Maze", "/#/game/" + seed);
        return startGame(seed);
      };
    })(this));
    this.density = d3.select("#density").attr("max", window.innerWidth / 15).on("change", (function(_this) {
      return function() {
        _this.game.setDensity(Number(_this.density.property("value")));
        return startGame(_this.game.seed);
      };
    })(this));
    this.trail = d3.select("#trail").classed("checked", this.game.showTrail).on("click", (function(_this) {
      return function() {
        _this.game.toggleTrail();
        _this.trail.classed("checked", _this.game.showTrail);
        return _this.renderer.showTrail(_this.game.showTrail);
      };
    })(this));
    isTicking = false;
    tick = function() {
      isTicking = true;
      this.game.tick();
      this.renderer.tick();
      return window.requestAnimationFrame(tick.bind(this));
    };
    startGame = (function(_this) {
      return function(seed) {
        _this.updateResets("random");
        _this.density.property("value", _this.game.density);
        _this.game.build(seed);
        _this.renderer.showTrail(_this.game.showTrail).paint();
        _this.treeView.paint();
        _this.renderer.updateCell(_this.game.world.maze.start);
        if (!isTicking) {
          return tick();
        }
      };
    })(this);
    this.updateResets = function(id) {
      return this.resets.selectAll(".round-button").style("display", function() {
        if (d3.select(this).attr("id") === id) {
          return "";
        } else {
          return "none";
        }
      });
    };
    this.router = Router({
      "/game/:seed": startGame,
      "/": function() {
        return this.setRoute("/game/1");
      }
    });
    return this.router.init("/");
  });

}).call(this);
