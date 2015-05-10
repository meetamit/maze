(function() {
  define(["models/world", "models/fairy"], function(World, Fairy) {
    var Game, LocalStorageManager;
    Game = (function() {
      function Game() {
        this.dispatch = d3.dispatch("gameStarted");
        this.storage = new LocalStorageManager;
        d3.rebind(this, this.dispatch, "on", "off");
        this.density = Number(this.storage.getItem("density"));
        if (this.density == null) {
          this.setDensity(12);
        }
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
        this.world.build(this.seed, this.density);
        this.fairy.transportTo(this.world.maze.start);
        return this.world.cells[this.fairy.index] |= World.OCCUPIED | World.VISITED;
      };

      Game.prototype.setDensity = function(density) {
        if (density == null) {
          density = this.density;
        }
        this.density = density;
        return this.storage.setItem("density", this.density);
      };

      Game.prototype.tick = function() {
        return this.fairy.tick();
      };

      return Game;

    })();
    window.fakeStorage = {
      _data: {},
      setItem: function(id, val) {
        return this._data[id] = String(val);
      },
      getItem: function(id) {
        if (this._data.hasOwnProperty(id)) {
          return this._data[id];
        } else {
          return void 0;
        }
      },
      removeItem: function(id) {
        return delete this._data[id];
      },
      clear: function() {
        return this._data = {};
      }
    };
    LocalStorageManager = (function() {
      function LocalStorageManager() {
        var supported;
        this.bestScoreKey = "bestScore";
        this.gameStateKey = "gameState";
        supported = this.localStorageSupported();
        this.storage = supported ? window.localStorage : window.fakeStorage;
        return this.storage;
      }

      LocalStorageManager.prototype.localStorageSupported = function() {
        var storage, testKey;
        testKey = "test";
        storage = window.localStorage;
        try {
          storage.setItem(testKey, "1");
          storage.removeItem(testKey);
          return true;
        } catch (_error) {
          return false;
        }
      };

      return LocalStorageManager;

    })();
    return Game;
  });

}).call(this);
