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
  lobby_main: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "38beankRy5MY55+TkpXB976", "lobby_main");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AbstractView_1 = require("../../../../../fromework/abstract/mvvm/AbstractView");
    var lobby_view_model_1 = require("../../../scripts/lobby_view_model");
    var AbstractView_2 = require("../../../../../fromework/abstract/mvvm/AbstractView");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var lobby_main = function(_super) {
      __extends(lobby_main, _super);
      function lobby_main() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.varLabel = null;
        _this.showLabel = null;
        _this.refreshLabel = null;
        return _this;
      }
      lobby_main.prototype.onLoad = function() {
        this.on("onClick", function() {
          cc.log("onClick \u88ab\u70b9\u51fb");
        });
        this.bind("__testVar", function(value) {
          cc.log("__testVar \u88ab\u6539\u53d8", value);
        });
      };
      lobby_main.prototype.__testVar = function(value) {
        this.varLabel.string = value;
      };
      lobby_main.prototype.__inputValue = function(value) {
        this.showLabel.string = value;
      };
      lobby_main.prototype.__common_refresh = function(value) {
        this.refreshLabel.string = "\u6765\u81ea\u6ce8\u5165model\u7684\u901a\u77e5 \u503c\uff1a" + value;
      };
      __decorate([ property(cc.Label) ], lobby_main.prototype, "varLabel", void 0);
      __decorate([ property(cc.Label) ], lobby_main.prototype, "showLabel", void 0);
      __decorate([ property(cc.Label) ], lobby_main.prototype, "refreshLabel", void 0);
      __decorate([ AbstractView_1.Binding ], lobby_main.prototype, "__testVar", null);
      __decorate([ AbstractView_1.Binding ], lobby_main.prototype, "__inputValue", null);
      __decorate([ AbstractView_1.Binding ], lobby_main.prototype, "__common_refresh", null);
      lobby_main = __decorate([ ccclass, AbstractView_1.ViewModel("lobby", lobby_view_model_1.default, true) ], lobby_main);
      return lobby_main;
    }(AbstractView_2.default);
    exports.default = lobby_main;
    cc._RF.pop();
  }, {
    "../../../../../fromework/abstract/mvvm/AbstractView": void 0,
    "../../../scripts/lobby_view_model": "lobby_view_model"
  } ],
  lobby_model: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cff0edNcHVNq4lkbBVwqOhX", "lobby_model");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AbstractModel_1 = require("../../../fromework/abstract/mvvm/AbstractModel");
    var lobby_model = function(_super) {
      __extends(lobby_model, _super);
      function lobby_model() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.__testVar = "\u6211\u662f\u9ed8\u8ba4\u503c";
        return _this;
      }
      lobby_model.prototype.loaded = function() {};
      lobby_model.prototype.unload = function() {};
      lobby_model.prototype.change = function() {
        var _this = this;
        cc.log(this.__testVar);
        setTimeout(function() {
          _this.__testVar = "\u53d8\u91cf\u7531model\u4fee\u6539";
        }, 1e3);
      };
      __decorate([ AbstractModel_1.Mutable ], lobby_model.prototype, "__testVar", void 0);
      return lobby_model;
    }(AbstractModel_1.default);
    exports.default = lobby_model;
    cc._RF.pop();
  }, {
    "../../../fromework/abstract/mvvm/AbstractModel": void 0
  } ],
  lobby_view_model: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c8cadyfhK5FYa7Y9P1ByxqK", "lobby_view_model");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AbstractViewModel_1 = require("../../../fromework/abstract/mvvm/AbstractViewModel");
    var lobby_model_1 = require("./lobby_model");
    var i18n_1 = require("../../../languages/i18n");
    var common_model_1 = require("../../../mainModules/common/scripts/common_model");
    var lobby_view_model = function(_super) {
      __extends(lobby_view_model, _super);
      function lobby_view_model() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.__inputValue = "";
        return _this;
      }
      lobby_view_model.prototype.loaded = function() {};
      lobby_view_model.prototype.unload = function() {};
      lobby_view_model.prototype.onClick = function() {
        this.__testVar = "__testVar \u88ab viewModel \u4fee\u6539";
        this.model.change();
      };
      lobby_view_model.prototype.onChangeInput = function(event) {
        this.__inputValue = event;
      };
      lobby_view_model.prototype.onTabEn = function() {
        i18n_1.i18n.language = i18n_1.Languages.en;
      };
      lobby_view_model.prototype.onTabCn = function() {
        i18n_1.i18n.language = i18n_1.Languages.zh_cn;
      };
      __decorate([ AbstractViewModel_1.InjectBind ], lobby_view_model.prototype, "__common_refresh", void 0);
      __decorate([ AbstractViewModel_1.Bindable ], lobby_view_model.prototype, "__testVar", void 0);
      __decorate([ AbstractViewModel_1.Command ], lobby_view_model.prototype, "onClick", null);
      __decorate([ AbstractViewModel_1.Command ], lobby_view_model.prototype, "onChangeInput", null);
      __decorate([ AbstractViewModel_1.Command ], lobby_view_model.prototype, "onTabEn", null);
      __decorate([ AbstractViewModel_1.Command ], lobby_view_model.prototype, "onTabCn", null);
      lobby_view_model = __decorate([ AbstractViewModel_1.Model(lobby_model_1.default), AbstractViewModel_1.Inject("common", common_model_1.default) ], lobby_view_model);
      return lobby_view_model;
    }(AbstractViewModel_1.AbstractViewModel);
    exports.default = lobby_view_model;
    cc._RF.pop();
  }, {
    "../../../fromework/abstract/mvvm/AbstractViewModel": void 0,
    "../../../languages/i18n": void 0,
    "../../../mainModules/common/scripts/common_model": void 0,
    "./lobby_model": "lobby_model"
  } ],
  lobby: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "75ea42t281G8JbC4atyRc5z", "lobby");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var AbstractModule_1 = require("../../../fromework/abstract/mvvm/AbstractModule");
    var SceneManager_1 = require("../../../fromework/singles/SceneManager");
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var lobby = function(_super) {
      __extends(lobby, _super);
      function lobby() {
        return null !== _super && _super.apply(this, arguments) || this;
      }
      lobby.prototype.clear = function() {};
      lobby.prototype.onLoad = function() {
        this.notify.on("scene", "enter", this.enter, this);
      };
      lobby.prototype.enter = function() {
        SceneManager_1.default.instance.loadScene(this.name, this.name);
      };
      lobby = __decorate([ AbstractModule_1.Module("lobby"), ccclass ], lobby);
      return lobby;
    }(AbstractModule_1.default);
    exports.default = lobby;
    cc._RF.pop();
  }, {
    "../../../fromework/abstract/mvvm/AbstractModule": void 0,
    "../../../fromework/singles/SceneManager": void 0
  } ]
}, {}, [ "lobby_main", "lobby", "lobby_model", "lobby_view_model" ]);