window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  login_main: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ed829T2RKRClqALQlTMSK6K", "login_main");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AbstractView_1 = require("../../../../../fromework/abstract/mvvm/AbstractView");
    var login_view_model_1 = require("../../../scripts/login_view_model");
    var AbstractView_2 = require("../../../../../fromework/abstract/mvvm/AbstractView");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var login_main = function(_super) {
      __extends(login_main, _super);
      function login_main() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      login_main = __decorate([ ccclass, AbstractView_1.ViewModel("login", login_view_model_1.default, true) ], login_main);
      return login_main;
    }(AbstractView_2.default);
    exports.default = login_main;
    cc._RF.pop();
  }, {
    "../../../../../fromework/abstract/mvvm/AbstractView": void 0,
    "../../../scripts/login_view_model": "login_view_model"
  } ],
  login_model: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "3fd63ae0khAdogSHdguipDo", "login_model");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AbstractModel_1 = require("../../../fromework/abstract/mvvm/AbstractModel");
    var login_model = function(_super) {
      __extends(login_model, _super);
      function login_model() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      login_model.prototype.loaded = function() {};
      login_model.prototype.unload = function() {};
      return login_model;
    }(AbstractModel_1.default);
    exports.default = login_model;
    cc._RF.pop();
  }, {
    "../../../fromework/abstract/mvvm/AbstractModel": void 0
  } ],
  login_view_model: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "509f2P2al5MW5u8PTdzTx57", "login_view_model");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AbstractViewModel_1 = require("../../../fromework/abstract/mvvm/AbstractViewModel");
    var login_model_1 = require("./login_model");
    var login_view_model = function(_super) {
      __extends(login_view_model, _super);
      function login_view_model() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      login_view_model.prototype.loaded = function() {};
      login_view_model.prototype.unload = function() {};
      login_view_model.prototype.goLobby = function(event) {
        this.module.notify.emitModule("lobby", "scene", "enter");
      };
      __decorate([ AbstractViewModel_1.Command ], login_view_model.prototype, "goLobby", null);
      login_view_model = __decorate([ AbstractViewModel_1.Model(login_model_1.default) ], login_view_model);
      return login_view_model;
    }(AbstractViewModel_1.AbstractViewModel);
    exports.default = login_view_model;
    cc._RF.pop();
  }, {
    "../../../fromework/abstract/mvvm/AbstractViewModel": void 0,
    "./login_model": "login_model"
  } ],
  login: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e5300P0ynFKYLxe1rMzCi91", "login");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AbstractModule_1 = require("../../../fromework/abstract/mvvm/AbstractModule");
    var SceneManager_1 = require("../../../fromework/singles/SceneManager");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var login = function(_super) {
      __extends(login, _super);
      function login() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      login.prototype.clear = function() {};
      login.prototype.onLoad = function() {
        this.notify.on("scene", "enter", this.enter, this);
      };
      login.prototype.enter = function() {
        SceneManager_1.default.instance.loadScene(this.name, this.name);
      };
      login = __decorate([ AbstractModule_1.Module("login"), ccclass ], login);
      return login;
    }(AbstractModule_1.default);
    exports.default = login;
    cc._RF.pop();
  }, {
    "../../../fromework/abstract/mvvm/AbstractModule": void 0,
    "../../../fromework/singles/SceneManager": void 0
  } ]
}, {}, [ "login_main", "login", "login_model", "login_view_model" ]);