!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Pico=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

var Pico = _interopRequire(require("./pico"));

var WebAudioPlayer = _interopRequire(require("./player/web-audio-player"));

var FlashFallbackPlayer = _interopRequire(require("./player/flash-fallback-player"));

if (WebAudioPlayer.isEnabled) {
  Pico.bind(WebAudioPlayer);
} else {
  FlashFallbackPlayer.fallback(Pico);
}

module.exports = Pico;
},{"./pico":2,"./player/flash-fallback-player":3,"./player/web-audio-player":5}],2:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

var Processor = _interopRequire(require("./processor"));

var processor = new Processor();

module.exports = new ((function () {
  function Pico() {}

  _prototypeProperties(Pico, null, {
    bind: {
      value: function bind(klass) {
        processor.bind(klass);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    play: {
      value: function play(audioprocess) {
        processor.play(audioprocess);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    pause: {
      value: function pause() {
        processor.pause();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    env: {
      get: function () {
        return processor.env;
      },
      enumerable: true,
      configurable: true
    },
    sampleRate: {
      get: function () {
        return processor.sampleRate;
      },
      enumerable: true,
      configurable: true
    },
    bufferSize: {
      get: function () {
        return processor.bufferSize;
      },
      enumerable: true,
      configurable: true
    },
    isPlaying: {
      get: function () {
        return processor.isPlaying;
      },
      enumerable: true,
      configurable: true
    }
  });

  return Pico;
})())();
},{"./processor":6}],3:[function(require,module,exports){
(function (global){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _get = function get(object, property, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var _inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

var Player = _interopRequire(require("./player"));

var FlashFallbackPlayer = (function (Player) {
  function FlashFallbackPlayer(processor) {
    _get(Object.getPrototypeOf(FlashFallbackPlayer.prototype), "constructor", this).call(this, processor, 44100, 2048, "flashfallback");

    this._out = new Array(this.streamSize * 2);
    this._writtenIncr = this.streamSize / this.sampleRate * 1000;
    this._written = 0;
    this._start = 0;
    this._timerId = 0;
  }

  _inherits(FlashFallbackPlayer, Player);

  _prototypeProperties(FlashFallbackPlayer, null, {
    play: {
      value: function play() {
        var _this = this;
        if (FlashFallbackPlayer.swf && this._timerId === 0) {
          this._written = 0;
          this._start = Date.now();
          this._timerId = setInterval(function () {
            _this.onaudioprocess(_this.streamSize);
          }, 25);
          FlashFallbackPlayer.swf.play();
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    pause: {
      value: function pause() {
        if (FlashFallbackPlayer.swf && this._timerId !== 0) {
          clearInterval(this._timerId);
          this._timerId = 0;
          FlashFallbackPlayer.swf.pause();
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    onaudioprocess: {
      value: function onaudioprocess(streamSize) {
        if (this._written < Date.now() - this._start) {
          var x;
          var streamL = this.processor.streams[0];
          var streamR = this.processor.streams[1];
          var out = this._out;

          this.processor.process(streamSize);

          for (var i = 0, j = 0; i < streamSize; i++) {
            x = streamL[i] * 16384 + 32768 | 0;
            x = Math.max(16384, Math.min(x, 49152));
            out[j++] = String.fromCharCode(x);

            x = streamR[i] * 16384 + 32768 | 0;
            x = Math.max(16384, Math.min(x, 49152));
            out[j++] = String.fromCharCode(x);
          }

          FlashFallbackPlayer.swf.write(out.join(""));

          this._written += this._writtenIncr;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return FlashFallbackPlayer;
})(Player);

var swfId = "PicoFlashFallbackPlayer" + Date.now();

var getPicoSwfUrl = function () {
  var scripts = global.document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    var matched = scripts[i].src.match(/^(.*\/)pico(?:\.min)?\.js$/);
    if (matched) {
      return matched[1] + "pico.swf";
    }
  }
  return "pico.swf";
};

var createFlashContainer = function () {
  var container = global.document.createElement("div");
  var object = global.document.createElement("object");
  var param = global.document.createElement("param");

  param.setAttribute("name", "allowScriptAccess");
  param.setAttribute("value", "always");

  object.id = swfId;
  object.classid = "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";
  object.width = 1;
  object.height = 1;
  object.setAttribute("data", "" + getPicoSwfUrl() + "?" + Date.now());
  object.setAttribute("type", "application/x-shockwave-flash");

  container.style.position = "fixed";
  container.style.left = 0;
  container.style.top = 0;
  container.style.width = "1px";
  container.style.height = "1px";

  object.appendChild(param);
  container.appendChild(object);

  return container;
};

FlashFallbackPlayer.fallback = function (Pico) {
  global.picojs$flashfallback = function () {
    Pico.bind(FlashFallbackPlayer);
    delete global.picojs$flashfallback;
  };

  global.window.addEventListener("load", function () {
    global.document.body.appendChild(createFlashContainer());
    FlashFallbackPlayer.swf = global.document.getElementById(swfId);
  });
};

module.exports = FlashFallbackPlayer;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./player":4}],4:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var Player = (function () {
  function Player(processor) {
    var sampleRate = arguments[1] === undefined ? 0 : arguments[1];
    var streamSize = arguments[2] === undefined ? 0 : arguments[2];
    var env = arguments[3] === undefined ? "" : arguments[3];
    this.processor = processor;
    this.sampleRate = sampleRate;
    this.streamSize = streamSize;
    this.env = env;
  }

  _prototypeProperties(Player, null, {
    play: {
      value: function play() {},
      writable: true,
      enumerable: true,
      configurable: true
    },
    pause: {
      value: function pause() {},
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Player;
})();

module.exports = Player;
},{}],5:[function(require,module,exports){
(function (global){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _get = function get(object, property, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var _inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

var Player = _interopRequire(require("./player"));

var AudioContext = global.AudioContext || global.webkitAudioContext;

var WebAudioPlayer = (function (Player) {
  function WebAudioPlayer(processor) {
    _get(Object.getPrototypeOf(WebAudioPlayer.prototype), "constructor", this).call(this, processor, 44100, 2048, "webaudio");

    this._context = new AudioContext();
    this._bufSrc = null;
    this._jsNode = null;

    this.sampleRate = this._context.sampleRate;
  }

  _inherits(WebAudioPlayer, Player);

  _prototypeProperties(WebAudioPlayer, null, {
    play: {
      value: function play() {
        var _this = this;
        this._jsNode = this._context.createScriptProcessor(this.streamSize, 1, 2);
        this._jsNode.onaudioprocess = function (e) {
          _this.processor.process(_this.streamSize);
          e.outputBuffer.getChannelData(0).set(_this.processor.streams[0]);
          e.outputBuffer.getChannelData(1).set(_this.processor.streams[1]);
        };
        this._jsNode.connect(this._context.destination);

        this._bufSrc = this._context.createBufferSource();
        this._bufSrc.start(0);
        this._bufSrc.connect(this._jsNode);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    pause: {
      value: function pause() {
        this._bufSrc.stop(0);
        this._bufSrc.disconnect();
        this._jsNode.disconnect();
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return WebAudioPlayer;
})(Player);

WebAudioPlayer.isEnabled = !!AudioContext;

module.exports = WebAudioPlayer;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./player":4}],6:[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _interopRequire = function (obj) {
  return obj && (obj["default"] || obj);
};

var Player = _interopRequire(require("./player/player"));

var BUFFER_SIZE = 64;

var Processor = (function () {
  function Processor() {
    this.player = new Player(this);
    this.audioprocess = null;
    this.isPlaying = false;
    this.streams = null;
    this.buffers = null;
  }

  _prototypeProperties(Processor, null, {
    env: {
      get: function () {
        return this.player.env;
      },
      enumerable: true,
      configurable: true
    },
    sampleRate: {
      get: function () {
        return this.player.sampleRate;
      },
      enumerable: true,
      configurable: true
    },
    bufferSize: {
      get: function () {
        return BUFFER_SIZE;
      },
      enumerable: true,
      configurable: true
    },
    bind: {
      value: function bind(klass) {
        this.player = new klass(this);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    play: {
      value: function play(audioprocess) {
        if (!this.isPlaying) {
          this.isPlaying = true;
          this.streams = [new Float32Array(this.player.streamSize), new Float32Array(this.player.streamSize)];
          this.buffers = [new Float32Array(BUFFER_SIZE), new Float32Array(BUFFER_SIZE)];
          this.audioprocess = audioprocess;
          this.player.play();
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    pause: {
      value: function pause() {
        if (this.isPlaying) {
          this.isPlaying = false;
          this.player.pause();
          this.streams = null;
          this.buffers = null;
          this.audioprocess = null;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    process: {
      value: function process(streamSize) {
        var audioprocess = this.audioprocess;
        var streamL = this.streams[0];
        var streamR = this.streams[1];
        var buffers = this.buffers;
        var bufferL = buffers[0];
        var bufferR = buffers[1];
        var n = streamSize / BUFFER_SIZE;

        for (var i = 0; i < n; i++) {
          audioprocess({
            bufferSize: BUFFER_SIZE,
            buffers: buffers });
          streamL.set(bufferL, i * BUFFER_SIZE);
          streamR.set(bufferR, i * BUFFER_SIZE);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Processor;
})();

module.exports = Processor;
},{"./player/player":4}]},{},[1])(1)
});