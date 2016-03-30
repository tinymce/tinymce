(function () {

var defs = {}; // id -> {dependencies, definition, instance (possibly undefined)}

// Used when there is no 'main' module.
// The name is probably (hopefully) unique so minification removes for releases.
var register_3795 = function (id) {
  var module = dem(id);
  var fragments = id.split('.');
  var target = Function('return this;')();
  for (var i = 0; i < fragments.length - 1; ++i) {
    if (target[fragments[i]] === undefined)
      target[fragments[i]] = {};
    target = target[fragments[i]];
  }
  target[fragments[fragments.length - 1]] = module;
};

var instantiate = function (id) {
  var actual = defs[id];
  var dependencies = actual.deps;
  var definition = actual.defn;
  var len = dependencies.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances[i] = dem(dependencies[i]);
  var defResult = definition.apply(null, instances);
  if (defResult === undefined)
     throw 'module [' + id + '] returned undefined';
  actual.instance = defResult;
};

var def = function (id, dependencies, definition) {
  if (typeof id !== 'string')
    throw 'module id must be a string';
  else if (dependencies === undefined)
    throw 'no dependencies for ' + id;
  else if (definition === undefined)
    throw 'no definition function for ' + id;
  defs[id] = {
    deps: dependencies,
    defn: definition,
    instance: undefined
  };
};

var dem = function (id) {
  var actual = defs[id];
  if (actual === undefined)
    throw 'module [' + id + '] was undefined';
  else if (actual.instance === undefined)
    instantiate(id);
  return actual.instance;
};

var req = function (ids, callback) {
  var len = ids.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances.push(dem(ids[i]));
  callback.apply(null, callback);
};

var ephox = {};

ephox.bolt = {
  module: {
    api: {
      define: def,
      require: req,
      demand: dem
    }
  }
};

var define = def;
var require = req;
var demand = dem;
// this helps with minificiation when using a lot of global references
var defineGlobal = function (id, ref) {
  define(id, [], function () { return ref; });
};
/*jsc
["tinymce/imagetoolsplugin/Plugin","global!tinymce.PluginManager","global!tinymce.Env","global!tinymce.util.Promise","global!tinymce.util.URI","global!tinymce.util.Tools","global!tinymce.util.Delay","ephox/imagetools/api/ImageTransformations","ephox/imagetools/api/BlobConversions","tinymce/imagetoolsplugin/Dialog","ephox/imagetools/transformations/Filters","ephox/imagetools/transformations/ImageTools","ephox/imagetools/util/Conversions","global!tinymce.dom.DOMUtils","global!tinymce.ui.Factory","global!tinymce.ui.Form","global!tinymce.ui.Container","tinymce/imagetoolsplugin/ImagePanel","tinymce/imagetoolsplugin/UndoStack","ephox/imagetools/util/Canvas","ephox/imagetools/util/ImageSize","ephox/imagetools/util/Promise","ephox/imagetools/util/Mime","ephox/imagetools/transformations/ColorMatrix","global!tinymce.ui.Control","global!tinymce.ui.DragHelper","global!tinymce.geom.Rect","tinymce/imagetoolsplugin/CropRect","global!tinymce.dom.DomQuery","global!tinymce.util.Observable"]
jsc*/
defineGlobal("global!tinymce.PluginManager", tinymce.PluginManager);
defineGlobal("global!tinymce.Env", tinymce.Env);
defineGlobal("global!tinymce.util.Promise", tinymce.util.Promise);
defineGlobal("global!tinymce.util.URI", tinymce.util.URI);
defineGlobal("global!tinymce.util.Tools", tinymce.util.Tools);
defineGlobal("global!tinymce.util.Delay", tinymce.util.Delay);
/**
 * Canvas.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains various canvas functions.
 */
define("ephox/imagetools/util/Canvas", [], function() {
  function create(width, height) {
    return resize(document.createElement('canvas'), width, height);
  }

  function get2dContext(canvas) {
    return canvas.getContext("2d");
  }

  function resize(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;

    return canvas;
  }

  return {
    create: create,
    resize: resize,
    get2dContext: get2dContext
  };
});
/**
 * ImageSize.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Returns the size of images.
 */
define("ephox/imagetools/util/ImageSize", [], function() {
  function getWidth(image) {
    return image.naturalWidth || image.width;
  }

  function getHeight(image) {
    return image.naturalHeight || image.height;
  }

  return {
    getWidth: getWidth,
    getHeight: getHeight
  };
});
/**
 * Promise.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * Promise polyfill under MIT license: https://github.com/taylorhakes/promise-polyfill
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/* eslint-disable */
/* jshint ignore:start */

/**
 * Modifed to be a feature fill and wrapped as tinymce module.
 */
define("ephox/imagetools/util/Promise", [], function() {
  if (window.Promise) {
    return window.Promise;
  }

  // Use polyfill for setImmediate for performance gains
  var asap = Promise.immediateFn || (typeof setImmediate === 'function' && setImmediate) ||
    function(fn) { setTimeout(fn, 1); };

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function() {
      fn.apply(thisArg, arguments);
    };
  }

  var isArray = Array.isArray || function(value) { return Object.prototype.toString.call(value) === "[object Array]"; };

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = null;
    this._value = null;
    this._deferreds = [];

    doResolve(fn, bind(resolve, this), bind(reject, this));
  }

  function handle(deferred) {
    var me = this;
    if (this._state === null) {
      this._deferreds.push(deferred);
      return;
    }
    asap(function() {
      var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (me._state ? deferred.resolve : deferred.reject)(me._value);
        return;
      }
      var ret;
      try {
        ret = cb(me._value);
      }
      catch (e) {
        deferred.reject(e);
        return;
      }
      deferred.resolve(ret);
    });
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === this) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (typeof then === 'function') {
          doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
          return;
        }
      }
      this._state = true;
      this._value = newValue;
      finale.call(this);
    } catch (e) { reject.call(this, e); }
  }

  function reject(newValue) {
    this._state = false;
    this._value = newValue;
    finale.call(this);
  }

  function finale() {
    for (var i = 0, len = this._deferreds.length; i < len; i++) {
      handle.call(this, this._deferreds[i]);
    }
    this._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, resolve, reject){
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, onFulfilled, onRejected) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        onFulfilled(value);
      }, function (reason) {
        if (done) return;
        done = true;
        onRejected(reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      onRejected(ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function(onFulfilled, onRejected) {
    var me = this;
    return new Promise(function(resolve, reject) {
      handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
    });
  };

  Promise.all = function () {
    var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;
      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) { res(i, val); }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }
      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for(var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  return Promise;
});

/* jshint ignore:end */
/* eslint-enable */
/**
 * Mime.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Returns mime types for uris.
 */
define("ephox/imagetools/util/Mime", [], function() {
  function getUriPathName(uri) {
    var a = document.createElement('a');

    a.href = uri;

    return a.pathname;
  }

  function guessMimeType(uri) {
    var parts = getUriPathName(uri).split('.'),
      ext = parts[parts.length - 1],
      mimes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png'
      };

    if (ext) {
      ext = ext.toLowerCase();
    }

    return mimes[ext];
  }

  return {
    guessMimeType: guessMimeType
  };
});
/**
 * Conversions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Converts blob/uris/images back and forth.
 */
define("ephox/imagetools/util/Conversions", [
  "ephox/imagetools/util/Promise",
  "ephox/imagetools/util/Canvas",
  "ephox/imagetools/util/Mime",
  "ephox/imagetools/util/ImageSize"
], function(Promise, Canvas, Mime, ImageSize) {
  function loadImage(image) {
    return new Promise(function(resolve) {
      function loaded() {
        image.removeEventListener('load', loaded);
        resolve(image);
      }

      if (image.complete) {
        resolve(image);
      } else {
        image.addEventListener('load', loaded);
      }
    });
  }

  function imageToCanvas(image) {
    return loadImage(image).then(function(image) {
      var context, canvas;

      canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image));
      context = Canvas.get2dContext(canvas);
      context.drawImage(image, 0, 0);

      return canvas;
    });
  }

  function imageToBlob(image) {
    return loadImage(image).then(function(image) {
      var src = image.src;

      if (src.indexOf('blob:') === 0) {
        return blobUriToBlob(src);
      }

      if (src.indexOf('data:') === 0) {
        return dataUriToBlob(src);
      }

      return imageToCanvas(image).then(function(canvas) {
        return dataUriToBlob(canvas.toDataURL(Mime.guessMimeType(src)));
      });
    });
  }

  function blobToImage(blob) {
    return new Promise(function(resolve) {
      var image = new Image();

      function loaded() {
        image.removeEventListener('load', loaded);
        resolve(image);
      }

      image.addEventListener('load', loaded);
      image.src = URL.createObjectURL(blob);

      if (image.complete) {
        loaded();
      }
    });
  }

  function blobUriToBlob(url) {
    return new Promise(function(resolve) {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = function() {
        if (this.status == 200) {
          resolve(this.response);
        }
      };

      xhr.send();
    });
  }

  function dataUriToBlob(uri) {
    return new Promise(function(resolve) {
      var str, arr, i, matches, type, blobBuilder;

      uri = uri.split(',');

      matches = /data:([^;]+)/.exec(uri[0]);
      if (matches) {
        type = matches[1];
      }

      str = atob(uri[1]);

      if (window.WebKitBlobBuilder) {
        /*globals WebKitBlobBuilder:false */
        blobBuilder = new WebKitBlobBuilder();

        arr = new ArrayBuffer(str.length);
        for (i = 0; i < arr.length; i++) {
          arr[i] = str.charCodeAt(i);
        }

        blobBuilder.append(arr);

        resolve(blobBuilder.getBlob(type));
        return;
      }

      arr = new Uint8Array(str.length);

      for (i = 0; i < arr.length; i++) {
        arr[i] = str.charCodeAt(i);
      }

      resolve(new Blob([arr], {type: type}));
    });
  }

  function uriToBlob(url) {
    if (url.indexOf('blob:') === 0) {
      return blobUriToBlob(url);
    }

    if (url.indexOf('data:') === 0) {
      return dataUriToBlob(url);
    }

    return null;
  }

  function canvasToBlob(canvas, type) {
    return dataUriToBlob(canvas.toDataURL(type));
  }

  function blobToDataUri(blob) {
    return new Promise(function(resolve) {
      var reader = new FileReader();

      reader.onloadend = function() {
        resolve(reader.result);
      };

      reader.readAsDataURL(blob);
    });
  }

  function blobToBase64(blob) {
    return blobToDataUri(blob).then(function(dataUri) {
      return dataUri.split(',')[1];
    });
  }

  function revokeImageUrl(image) {
    URL.revokeObjectURL(image.src);
  }

  return {
    // used outside
    blobToImage: blobToImage,
    // used outside
    imageToBlob: imageToBlob,
    // used outside
    blobToDataUri: blobToDataUri,
    // used outside
    blobToBase64: blobToBase64,

    // helper method
    imageToCanvas: imageToCanvas,

    // helper method
    canvasToBlob: canvasToBlob,

    // helper method
    revokeImageUrl: revokeImageUrl,

     // helper method
    uriToBlob: uriToBlob

  };
});
/**
 * ImageTools.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 *
 * Some of the matrix calculations and constants are from the EaselJS library released under MIT:
 * https://github.com/CreateJS/EaselJS/blob/master/src/easeljs/filters/ColorMatrix.js
 */

/**
 * Various operations for color matrices.
 */
define("ephox/imagetools/transformations/ColorMatrix", [], function() {
  function clamp(value, min, max) {
    value = parseFloat(value);

    if (value > max) {
      value = max;
    } else if (value < min) {
      value = min;
    }

    return value;
  }

  function identity() {
    return [
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ];
  }

  var DELTA_INDEX = [
    0, 0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1, 0.11,
    0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24,
    0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42,
    0.44, 0.46, 0.48, 0.5, 0.53, 0.56, 0.59, 0.62, 0.65, 0.68,
    0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98,
    1.0, 1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54,
    1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0, 2.12, 2.25,
    2.37, 2.50, 2.62, 2.75, 2.87, 3.0, 3.2, 3.4, 3.6, 3.8,
    4.0, 4.3, 4.7, 4.9, 5.0, 5.5, 6.0, 6.5, 6.8, 7.0,
    7.3, 7.5, 7.8, 8.0, 8.4, 8.7, 9.0, 9.4, 9.6, 9.8,
    10.0
  ];

  function multiply(matrix1, matrix2) {
    var i, j, k, val, col = [], out = new Array(10);

    for (i = 0; i < 5; i++) {
      for (j = 0; j < 5; j++) {
        col[j] = matrix2[j + i * 5];
      }

      for (j = 0; j < 5; j++) {
        val = 0;

        for (k = 0; k < 5; k++) {
          val += matrix1[j + k * 5] * col[k];
        }

        out[j + i * 5] = val;
      }
    }

    return out;
  }

  function adjust(matrix, adjustValue) {
    adjustValue = clamp(adjustValue, 0, 1);

    return matrix.map(function(value, index) {
      if (index % 6 === 0) {
        value = 1.0 - ((1 - value) * adjustValue);
      } else {
        value *= adjustValue;
      }

      return clamp(value, 0, 1);
    });
  }

  function adjustContrast(matrix, value) {
    var x;

    value = clamp(value, -1, 1);
    value *= 100;

    if (value < 0) {
      x = 127 + value / 100 * 127;
    } else {
      x = value % 1;

      if (x === 0) {
        x = DELTA_INDEX[value];
      } else {
        // use linear interpolation for more granularity.
        x = DELTA_INDEX[(Math.floor(value))] * (1 - x) + DELTA_INDEX[(Math.floor(value)) + 1] * x;
      }

      x = x * 127 + 127;
    }

    return multiply(matrix, [
      x / 127, 0, 0, 0, 0.5 * (127 - x),
      0, x / 127, 0, 0, 0.5 * (127 - x),
      0, 0, x / 127, 0, 0.5 * (127 - x),
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ]);
  }

  function adjustSaturation(matrix, value) {
    var x, lumR, lumG, lumB;

    value = clamp(value, -1, 1);
    x = 1 + ((value > 0) ? 3 * value : value);
    lumR = 0.3086;
    lumG = 0.6094;
    lumB = 0.0820;

    return multiply(matrix, [
      lumR * (1 - x) + x, lumG * (1 - x), lumB * (1 - x), 0, 0,
      lumR * (1 - x), lumG * (1 - x) + x, lumB * (1 - x), 0, 0,
      lumR * (1 - x), lumG * (1 - x), lumB * (1 - x) + x, 0, 0,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ]);
  }

  function adjustHue(matrix, angle) {
    var cosVal, sinVal, lumR, lumG, lumB;

    angle = clamp(angle, -180, 180) / 180 * Math.PI;
    cosVal = Math.cos(angle);
    sinVal = Math.sin(angle);
    lumR = 0.213;
    lumG = 0.715;
    lumB = 0.072;

    return multiply(matrix, [
      lumR + cosVal * (1 - lumR) + sinVal * (-lumR), lumG + cosVal * (-lumG) + sinVal * (-lumG),
      lumB + cosVal * (-lumB) + sinVal * (1 - lumB), 0, 0,
      lumR + cosVal * (-lumR) + sinVal * (0.143), lumG + cosVal * (1 - lumG) + sinVal * (0.140),
      lumB + cosVal * (-lumB) + sinVal * (-0.283), 0, 0,
      lumR + cosVal * (-lumR) + sinVal * (-(1 - lumR)), lumG + cosVal * (-lumG) + sinVal * (lumG),
      lumB + cosVal * (1 - lumB) + sinVal * (lumB), 0, 0,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ]);
  }

  function adjustBrightness(matrix, value) {
    value = clamp(255 * value, -255, 255);

    return multiply(matrix, [
      1, 0, 0, 0, value,
      0, 1, 0, 0, value,
      0, 0, 1, 0, value,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ]);
  }

  function adjustColors(matrix, adjustR, adjustG, adjustB) {
    adjustR = clamp(adjustR, 0, 2);
    adjustG = clamp(adjustG, 0, 2);
    adjustB = clamp(adjustB, 0, 2);

    return multiply(matrix, [
      adjustR, 0, 0, 0, 0,
      0, adjustG, 0, 0, 0,
      0, 0, adjustB, 0, 0,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ]);
  }

  function adjustSepia(matrix, value) {
    value = clamp(value, 0, 1);

    return multiply(matrix, adjust([
      0.393, 0.769, 0.189, 0, 0,
      0.349, 0.686, 0.168, 0, 0,
      0.272, 0.534, 0.131, 0, 0,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ], value));
  }

  function adjustGrayscale(matrix, value) {
    value = clamp(value, 0, 1);

    return multiply(matrix, adjust([
      0.33, 0.34, 0.33, 0, 0,
      0.33, 0.34, 0.33, 0, 0,
      0.33, 0.34, 0.33, 0, 0,
      0, 0, 0, 1, 0,
      0, 0, 0, 0, 1
    ], value));
  }

  return {
    identity: identity,
    adjust: adjust,
    multiply: multiply,
    adjustContrast: adjustContrast,
    adjustBrightness: adjustBrightness,
    adjustSaturation: adjustSaturation,
    adjustHue: adjustHue,
    adjustColors: adjustColors,
    adjustSepia: adjustSepia,
    adjustGrayscale: adjustGrayscale
  };
});
/**
 * Filters.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Applies various filters to blobs.
 */
define("ephox/imagetools/transformations/Filters", [
  "ephox/imagetools/util/Canvas",
  "ephox/imagetools/util/ImageSize",
  "ephox/imagetools/util/Conversions",
  "ephox/imagetools/transformations/ColorMatrix"
], function(Canvas, ImageSize, Conversions, ColorMatrix) {
  var revokeImageUrl = Conversions.revokeImageUrl;

  function colorFilter(blob, matrix) {
    return Conversions.blobToImage(blob).then(function(image) {
      var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
        context = Canvas.get2dContext(canvas),
        pixels;

      function applyMatrix(pixels, m) {
        var d = pixels.data, r, g, b, a, i,
          m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4],
          m5 = m[5], m6 = m[6], m7 = m[7], m8 = m[8], m9 = m[9],
          m10 = m[10], m11 = m[11], m12 = m[12], m13 = m[13], m14 = m[14],
          m15 = m[15], m16 = m[16], m17 = m[17], m18 = m[18], m19 = m[19];

        for (i = 0; i < d.length; i += 4) {
          r = d[i];
          g = d[i + 1];
          b = d[i + 2];
          a = d[i + 3];

          d[i] = r * m0 + g * m1 + b * m2 + a * m3 + m4;
          d[i + 1] = r * m5 + g * m6 + b * m7 + a * m8 + m9;
          d[i + 2] = r * m10 + g * m11 + b * m12 + a * m13 + m14;
          d[i + 3] = r * m15 + g * m16 + b * m17 + a * m18 + m19;
        }

        return pixels;
      }

      context.drawImage(image, 0, 0);
      revokeImageUrl(image);
      pixels = applyMatrix(context.getImageData(0, 0, canvas.width, canvas.height), matrix);
      context.putImageData(pixels, 0, 0);

      return Conversions.canvasToBlob(canvas);
    });
  }

  function convoluteFilter(blob, matrix) {
    return Conversions.blobToImage(blob).then(function(image) {
      var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
        context = Canvas.get2dContext(canvas),
        pixelsIn, pixelsOut;

      function applyMatrix(pixelsIn, pixelsOut, matrix) {
        var rgba, drgba, side, halfSide, x, y, r, g, b,
          cx, cy, scx, scy, offset, wt, w, h;

        function clamp(value, min, max) {
          if (value > max) {
            value = max;
          } else if (value < min) {
            value = min;
          }

          return value;
        }

        // Calc side and half side of matrix
        side = Math.round(Math.sqrt(matrix.length));
        halfSide = Math.floor(side / 2);
        rgba = pixelsIn.data;
        drgba = pixelsOut.data;
        w = pixelsIn.width;
        h = pixelsIn.height;

        // Apply convolution matrix to pixels
        for (y = 0; y < h; y++) {
          for (x = 0; x < w; x++) {
            r = g = b = 0;

            for (cy = 0; cy < side; cy++) {
              for (cx = 0; cx < side; cx++) {
                // Calc relative x, y based on matrix
                scx = clamp(x + cx - halfSide, 0, w - 1);
                scy = clamp(y + cy - halfSide, 0, h - 1);

                // Calc r, g, b
                offset = (scy * w + scx) * 4;
                wt = matrix[cy * side + cx];
                r += rgba[offset] * wt;
                g += rgba[offset + 1] * wt;
                b += rgba[offset + 2] * wt;
              }
            }

            // Set new RGB to destination buffer
            offset = (y * w + x) * 4;
            drgba[offset] = clamp(r, 0, 255);
            drgba[offset + 1] = clamp(g, 0, 255);
            drgba[offset + 2] = clamp(b, 0, 255);
          }
        }

        return pixelsOut;
      }

      context.drawImage(image, 0, 0);
      revokeImageUrl(image);
      pixelsIn = context.getImageData(0, 0, canvas.width, canvas.height);
      pixelsOut = context.getImageData(0, 0, canvas.width, canvas.height);
      pixelsOut = applyMatrix(pixelsIn, pixelsOut, matrix);
      context.putImageData(pixelsOut, 0, 0);

      return Conversions.canvasToBlob(canvas);
    });
  }

  function functionColorFilter(colorFn) {
    return function(blob, value) {
      return Conversions.blobToImage(blob).then(function(image) {
        var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
          context = Canvas.get2dContext(canvas),
          pixels, i, lookup = new Array(256);

        function applyLookup(pixels, lookup) {
          var d = pixels.data, i;

          for (i = 0; i < d.length; i += 4) {
            d[i] = lookup[d[i]];
            d[i + 1] = lookup[d[i + 1]];
            d[i + 2] = lookup[d[i + 2]];
          }

          return pixels;
        }

        for (i = 0; i < lookup.length; i++) {
          lookup[i] = colorFn(i, value);
        }

        context.drawImage(image, 0, 0);
        revokeImageUrl(image);
        pixels = applyLookup(context.getImageData(0, 0, canvas.width, canvas.height), lookup);
        context.putImageData(pixels, 0, 0);

        return Conversions.canvasToBlob(canvas);
      });
    };
  }

  function complexAdjustableColorFilter(matrixAdjustFn) {
    return function(blob, adjust) {
      return colorFilter(blob, matrixAdjustFn(ColorMatrix.identity(), adjust));
    };
  }

  function basicColorFilter(matrix) {
    return function(blob) {
      return colorFilter(blob, matrix);
    };
  }

  function basicConvolutionFilter(kernel) {
    return function(blob) {
      return convoluteFilter(blob, kernel);
    };
  }

  return {
    invert: basicColorFilter([
      -1, 0, 0, 0, 255,
      0, -1, 0, 0, 255,
      0, 0, -1, 0, 255,
      0, 0, 0, 1, 0
    ]),

    brightness: complexAdjustableColorFilter(ColorMatrix.adjustBrightness),
    hue: complexAdjustableColorFilter(ColorMatrix.adjustHue),
    saturate: complexAdjustableColorFilter(ColorMatrix.adjustSaturation),
    contrast: complexAdjustableColorFilter(ColorMatrix.adjustContrast),
    grayscale: complexAdjustableColorFilter(ColorMatrix.adjustGrayscale),
    sepia: complexAdjustableColorFilter(ColorMatrix.adjustSepia),
    colorize: function(blob, adjustR, adjustG, adjustB) {
      return colorFilter(blob, ColorMatrix.adjustColors(ColorMatrix.identity(), adjustR, adjustG, adjustB));
    },

    sharpen: basicConvolutionFilter([
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ]),

    emboss: basicConvolutionFilter([
      -2, -1, 0,
      -1, 1, 1,
      0, 1, 2
    ]),

    gamma: functionColorFilter(function(color, value) {
      return Math.pow(color / 255, 1 - value) * 255;
    }),

    exposure: functionColorFilter(function(color, value) {
      return 255 * (1 - Math.exp(-(color / 255) * value));
    }),

    colorFilter: colorFilter,
    convoluteFilter: convoluteFilter
  };
});
/**
 * ImageTools.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Modifies image blobs.
 */
define("ephox/imagetools/transformations/ImageTools", [
  "ephox/imagetools/util/Conversions",
  "ephox/imagetools/util/Canvas",
  "ephox/imagetools/util/ImageSize"
], function(Conversions, Canvas, ImageSize) {
  var revokeImageUrl = Conversions.revokeImageUrl;

  function rotate(blob, angle) {
    return Conversions.blobToImage(blob).then(function(image) {
      var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
        context = Canvas.get2dContext(canvas),
        translateX = 0, translateY = 0;

      angle = angle < 0 ? 360 + angle : angle;

      if (angle == 90 || angle == 270) {
        Canvas.resize(canvas, canvas.height, canvas.width);
      }

      if (angle == 90 || angle == 180) {
        translateX = canvas.width;
      }

      if (angle == 270 || angle == 180) {
        translateY = canvas.height;
      }

      context.translate(translateX, translateY);
      context.rotate(angle * Math.PI / 180);
      context.drawImage(image, 0, 0);
      revokeImageUrl(image);

      return Conversions.canvasToBlob(canvas, blob.type);
    });
  }

  function flip(blob, axis) {
    return Conversions.blobToImage(blob).then(function(image) {
      var canvas = Canvas.create(ImageSize.getWidth(image), ImageSize.getHeight(image)),
        context = Canvas.get2dContext(canvas);

      if (axis == 'v') {
        context.scale(1, -1);
        context.drawImage(image, 0, -canvas.height);
      } else {
        context.scale(-1, 1);
        context.drawImage(image, -canvas.width, 0);
      }

      revokeImageUrl(image);

      return Conversions.canvasToBlob(canvas);
    });
  }

  function crop(blob, x, y, w, h) {
    return Conversions.blobToImage(blob).then(function(image) {
      var canvas = Canvas.create(w, h),
        context = Canvas.get2dContext(canvas);

      context.drawImage(image, -x, -y);
      revokeImageUrl(image);

      return Conversions.canvasToBlob(canvas);
    });
  }

  function resize(blob, w, h) {
    return Conversions.blobToImage(blob).then(function(image) {
      var canvas = Canvas.create(w, h),
        context = Canvas.get2dContext(canvas);

      context.drawImage(image, 0, 0, w, h);
      revokeImageUrl(image);

      return Conversions.canvasToBlob(canvas, blob.type);
    });
  }

  return {
    rotate: rotate,
    flip: flip,
    crop: crop,
    resize: resize
  };
});

define(
  'ephox/imagetools/api/ImageTransformations',

  [
    'ephox/imagetools/transformations/Filters',
    'ephox/imagetools/transformations/ImageTools'
  ],

  function (Filters, ImageTools) {
    var invert = function (blob) {
      return Filters.invert(blob);
    };

    var sharpen = function (blob) {
      return Filters.sharpen(blob);
    };

    var emboss = function (blob) {
      return Filters.emboss(blob);
    };

    var gamma = function (blob, value) {
      return Filters.gamma(blob, value);
    };

    var exposure = function (blob, value) {
      return Filters.exposure(blob, value);
    };

    var colorize = function (blob, adjustR, adjustG, adjustB) {
      return Filters.colorize(blob, adjustR, adjustG, adjustB);
    };

    var brightness = function (blob, adjust) {
      return Filters.brightness(blob, adjust);
    };

    var hue = function (blob, adjust) {
      return Filters.hue(blob, adjust);
    };

    var saturate = function (blob, adjust) {
      return Filters.saturate(blob, adjust);
    };

    var contrast = function (blob, adjust) {
      return Filters.contrast(blob, adjust);
    };

    var grayscale = function (blob, adjust) {
      return Filters.grayscale(blob, adjust);
    };

    var sepia = function (blob, adjust) {
      return Filters.sepia(blob, adjust);
    };

    var flip = function (blob, axis) {
      return ImageTools.flip(blob, axis);
    };

    var crop = function (blob, x, y, w, h) {
      return ImageTools.crop(blob, x, y, w, h);
    };

    var resize = function (blob, w, h) {
      return ImageTools.resize(blob, w, h);
    };

    var rotate = function (blob, angle) {
      return ImageTools.rotate(blob, angle);
    };

    return {
      invert: invert,
      sharpen: sharpen,
      emboss: emboss,
      brightness: brightness,
      hue: hue,
      saturate: saturate,
      contrast: contrast,
      grayscale: grayscale,
      sepia: sepia,
      colorize: colorize,
      gamma: gamma,
      exposure: exposure,

      flip: flip,
      crop: crop,
      resize: resize,
      rotate: rotate
    };
  }
);
define(
  'ephox/imagetools/api/BlobConversions',

  [
    'ephox/imagetools/util/Conversions'
  ],

  function (Conversions) {
    var blobToImage = function (image) {
      return Conversions.blobToImage(image);
    };

    var imageToBlob = function (blob) {
      return Conversions.imageToBlob(blob);
    };

    var blobToDataUri = function (blob) {
      return Conversions.blobToDataUri(blob);
    };

    var blobToBase64 = function (blob) {
      return Conversions.blobToBase64(blob);
    };

    return {
      // used outside
      blobToImage: blobToImage,
      // used outside
      imageToBlob: imageToBlob,
      // used outside
      blobToDataUri: blobToDataUri,
      // used outside
      blobToBase64: blobToBase64
    };
  }
);
defineGlobal("global!tinymce.dom.DOMUtils", tinymce.dom.DOMUtils);
defineGlobal("global!tinymce.ui.Factory", tinymce.ui.Factory);
defineGlobal("global!tinymce.ui.Form", tinymce.ui.Form);
defineGlobal("global!tinymce.ui.Container", tinymce.ui.Container);
defineGlobal("global!tinymce.ui.Control", tinymce.ui.Control);
defineGlobal("global!tinymce.ui.DragHelper", tinymce.ui.DragHelper);
defineGlobal("global!tinymce.geom.Rect", tinymce.geom.Rect);
defineGlobal("global!tinymce.dom.DomQuery", tinymce.dom.DomQuery);
defineGlobal("global!tinymce.util.Observable", tinymce.util.Observable);
/**
 * CropRect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * ...
 */
define("tinymce/imagetoolsplugin/CropRect", [
	"global!tinymce.dom.DomQuery",
	"global!tinymce.ui.DragHelper",
	"global!tinymce.geom.Rect",
	"global!tinymce.util.Tools",
	"global!tinymce.util.Observable"
], function($, DragHelper, Rect, Tools, Observable) {
	var count = 0;

	return function(currentRect, viewPortRect, clampRect, containerElm) {
		var instance, handles, dragHelpers, blockers, prefix = 'mce-', id = prefix + 'crid-' + (count++);

		handles = [
			{name: 'move', xMul: 0, yMul: 0, deltaX: 1, deltaY: 1, deltaW: 0, deltaH: 0},
			{name: 'nw', xMul: 0, yMul: 0, deltaX: 1, deltaY: 1, deltaW: -1, deltaH: -1},
			{name: 'ne', xMul: 1, yMul: 0, deltaX: 0, deltaY: 1, deltaW: 1, deltaH: -1},
			{name: 'sw', xMul: 0, yMul: 1, deltaX: 1, deltaY: 0, deltaW: -1, deltaH: 1},
			{name: 'se', xMul: 1, yMul: 1, deltaX: 0, deltaY: 0, deltaW: 1, deltaH: 1}
		];

		blockers = ["top", "right", "bottom", "left"];

		function getAbsoluteRect(outerRect, relativeRect) {
			return {
				x: relativeRect.x + outerRect.x,
				y: relativeRect.y + outerRect.y,
				w: relativeRect.w,
				h: relativeRect.h
			};
		}

		function getRelativeRect(outerRect, innerRect) {
			return {
				x: innerRect.x - outerRect.x,
				y: innerRect.y - outerRect.y,
				w: innerRect.w,
				h: innerRect.h
			};
		}

		function getInnerRect() {
			return getRelativeRect(clampRect, currentRect);
		}

		function render() {
			function createDragHelper(handle) {
				var startRect;

				return new DragHelper(id, {
					document: containerElm.ownerDocument,
					handle: id + '-' + handle.name,

					start: function() {
						startRect = currentRect;
					},

					drag: function(e) {
						var x, y, w, h, rect;

						x = startRect.x;
						y = startRect.y;
						w = startRect.w;
						h = startRect.h;

						x += e.deltaX * handle.deltaX;
						y += e.deltaY * handle.deltaY;
						w += e.deltaX * handle.deltaW;
						h += e.deltaY * handle.deltaH;

						if (w < 20) {
							w = 20;
						}

						if (h < 20) {
							h = 20;
						}

						rect = currentRect = Rect.clamp({x: x, y: y, w: w, h: h}, clampRect, handle.name == 'move');
						rect = getRelativeRect(clampRect, rect);

						instance.fire('updateRect', {rect: rect});
						setInnerRect(rect);
					}
				});
			}

			$('<div id="' + id + '" class="' + prefix + 'croprect-container" data-mce-bogus="all">').appendTo(containerElm);

			Tools.each(blockers, function(blocker) {
				$('#' + id, containerElm).append(
					'<div id="' + id + '-' + blocker + '"class="' + prefix + 'croprect-block" style="display: none" data-mce-bogus="all">'
				);
			});

			Tools.each(handles, function(handle) {
				$('#' + id, containerElm).append(
					'<div id="' + id + '-' + handle.name + '" class="' + prefix +
						'croprect-handle ' + prefix + 'croprect-handle-' + handle.name + '" style="display: none" data-mce-bogus="all">'
				);
			});

			dragHelpers = Tools.map(handles, createDragHelper);

			repaint(currentRect);
		}

		function toggleVisibility(state) {
			var selectors;

			selectors = Tools.map(handles, function(handle) {
				return '#' + id + '-' + handle.name;
			}).concat(Tools.map(blockers, function(blocker) {
				return '#' + id + '-' + blocker;
			})).join(',');

			if (state) {
				$(selectors, containerElm).show();
			} else {
				$(selectors, containerElm).hide();
			}
		}

		function repaint(rect) {
			function updateElementRect(name, rect) {
				if (rect.h < 0) {
					rect.h = 0;
				}

				if (rect.w < 0) {
					rect.w = 0;
				}

				$('#' + id + '-' + name, containerElm).css({
					left: rect.x,
					top: rect.y,
					width: rect.w,
					height: rect.h
				});
			}

			Tools.each(handles, function(handle) {
				$('#' + id + '-' + handle.name, containerElm).css({
					left: rect.w * handle.xMul + rect.x,
					top: rect.h * handle.yMul + rect.y
				});
			});

			updateElementRect('top', {x: viewPortRect.x, y: viewPortRect.y, w: viewPortRect.w, h: rect.y - viewPortRect.y});
			updateElementRect('right', {x: rect.x + rect.w, y: rect.y, w: viewPortRect.w - rect.x - rect.w + viewPortRect.x, h: rect.h});
			updateElementRect('bottom', {
				x: viewPortRect.x,
				y: rect.y + rect.h,
				w: viewPortRect.w,
				h: viewPortRect.h - rect.y - rect.h + viewPortRect.y
			});
			updateElementRect('left', {x: viewPortRect.x, y: rect.y, w: rect.x - viewPortRect.x, h: rect.h});
			updateElementRect('move', rect);
		}

		function setRect(rect) {
			currentRect = rect;
			repaint(currentRect);
		}

		function setViewPortRect(rect) {
			viewPortRect = rect;
			repaint(currentRect);
		}

		function setInnerRect(rect) {
			setRect(getAbsoluteRect(clampRect, rect));
		}

		function setClampRect(rect) {
			clampRect = rect;
			repaint(currentRect);
		}

		function destroy() {
			Tools.each(dragHelpers, function(helper) {
				helper.destroy();
			});

			dragHelpers = [];
		}

		render(containerElm);

		instance = Tools.extend({
			toggleVisibility: toggleVisibility,
			setClampRect: setClampRect,
			setRect: setRect,
			getInnerRect: getInnerRect,
			setInnerRect: setInnerRect,
			setViewPortRect: setViewPortRect,
			destroy: destroy
		}, Observable);

		return instance;
	};
});

/**
 * ImagePanel.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * ...
 *
 * @-x-less ImagePanel.less
 */
define("tinymce/imagetoolsplugin/ImagePanel", [
	"global!tinymce.ui.Control",
	"global!tinymce.ui.DragHelper",
	"global!tinymce.geom.Rect",
	"global!tinymce.util.Tools",
	"global!tinymce.util.Promise",
	"tinymce/imagetoolsplugin/CropRect"
], function(Control, DragHelper, Rect, Tools, Promise, CropRect) {
	function loadImage(image) {
		return new Promise(function(resolve) {
			function loaded() {
				image.removeEventListener('load', loaded);
				resolve(image);
			}

			if (image.complete) {
				resolve(image);
			} else {
				image.addEventListener('load', loaded);
			}
		});
	}

	return Control.extend({
		Defaults: {
			classes: "imagepanel"
		},

		selection: function(rect) {
			if (arguments.length) {
				this.state.set('rect', rect);
				return this;
			}

			return this.state.get('rect');
		},

		imageSize: function() {
			var viewRect = this.state.get('viewRect');

			return {
				w: viewRect.w,
				h: viewRect.h
			};
		},

		toggleCropRect: function(state) {
			this.state.set('cropEnabled', state);
		},

		imageSrc: function(url) {
			var self = this, img = new Image();

			img.src = url;

			loadImage(img).then(function() {
				var rect, $img, lastRect = self.state.get('viewRect');

				$img = self.$el.find('img');
				if ($img[0]) {
					$img.replaceWith(img);
				} else {
					self.getEl().appendChild(img);
				}

				rect = {x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight};
				self.state.set('viewRect', rect);
				self.state.set('rect', Rect.inflate(rect, -20, -20));

				if (!lastRect || lastRect.w != rect.w || lastRect.h != rect.h) {
					self.zoomFit();
				}

				self.repaintImage();
				self.fire('load');
			});
		},

		zoom: function(value) {
			if (arguments.length) {
				this.state.set('zoom', value);
				return this;
			}

			return this.state.get('zoom');
		},

		postRender: function() {
			this.imageSrc(this.settings.imageSrc);
			return this._super();
		},

		zoomFit: function() {
			var self = this, $img, pw, ph, w, h, zoom, padding;

			padding = 10;
			$img = self.$el.find('img');
			pw = self.getEl().clientWidth;
			ph = self.getEl().clientHeight;
			w = $img[0].naturalWidth;
			h = $img[0].naturalHeight;
			zoom = Math.min((pw - padding) / w, (ph - padding) / h);

			if (zoom >= 1) {
				zoom = 1;
			}

			self.zoom(zoom);
		},

		repaintImage: function() {
			var x, y, w, h, pw, ph, $img, zoom, rect, elm;

			elm = this.getEl();
			zoom = this.zoom();
			rect = this.state.get('rect');
			$img = this.$el.find('img');
			pw = elm.offsetWidth;
			ph = elm.offsetHeight;
			w = $img[0].naturalWidth * zoom;
			h = $img[0].naturalHeight * zoom;
			x = Math.max(0, pw / 2 - w / 2);
			y = Math.max(0, ph / 2 - h / 2);

			$img.css({
				left: x,
				top: y,
				width: w,
				height: h
			});

			if (this.cropRect) {
				this.cropRect.setRect({
					x: rect.x * zoom + x,
					y: rect.y * zoom + y,
					w: rect.w * zoom,
					h: rect.h * zoom
				});

				this.cropRect.setClampRect({
					x: x,
					y: y,
					w: w,
					h: h
				});

				this.cropRect.setViewPortRect({
					x: 0,
					y: 0,
					w: pw,
					h: ph
				});
			}
		},

		bindStates: function() {
			var self = this;

			function setupCropRect(rect) {
				self.cropRect = new CropRect(
					rect,
					self.state.get('viewRect'),
					self.state.get('viewRect'),
					self.getEl()
				);

				self.cropRect.on('updateRect', function(e) {
					var rect = e.rect, zoom = self.zoom();

					rect = {
						x: Math.round(rect.x / zoom),
						y: Math.round(rect.y / zoom),
						w: Math.round(rect.w / zoom),
						h: Math.round(rect.h / zoom)
					};

					self.state.set('rect', rect);
				});

				self.on('remove', self.cropRect.destroy);
			}

			self.state.on('change:cropEnabled', function(e) {
				self.cropRect.toggleVisibility(e.value);
				self.repaintImage();
			});

			self.state.on('change:zoom', function() {
				self.repaintImage();
			});

			self.state.on('change:rect', function(e) {
				var rect = e.value;

				if (!self.cropRect) {
					setupCropRect(rect);
				}

				self.cropRect.setRect(rect);
			});
		}
	});
});

/**
 * UndoStack.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define("tinymce/imagetoolsplugin/UndoStack", [
], function() {
	return function() {
		var data = [], index = -1;

		function add(state) {
			var removed;

			removed = data.splice(++index);
			data.push(state);

			return {
				state: state,
				removed: removed
			};
		}

		function undo() {
			if (canUndo()) {
				return data[--index];
			}
		}

		function redo() {
			if (canRedo()) {
				return data[++index];
			}
		}

		function canUndo() {
			return index > 0;
		}

		function canRedo() {
			return index != -1 && index < data.length - 1;
		}

		return {
			data: data,
			add: add,
			undo: undo,
			redo: redo,
			canUndo: canUndo,
			canRedo: canRedo
		};
	};
});

/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * ...
 */
define("tinymce/imagetoolsplugin/Dialog", [
	"global!tinymce.dom.DOMUtils",
	"global!tinymce.util.Tools",
	"global!tinymce.util.Promise",
	"global!tinymce.ui.Factory",
	"global!tinymce.ui.Form",
	"global!tinymce.ui.Container",
	"tinymce/imagetoolsplugin/ImagePanel",
	"ephox/imagetools/api/ImageTransformations",
	"ephox/imagetools/api/BlobConversions",
	"tinymce/imagetoolsplugin/UndoStack"
], function(DOMUtils, Tools, Promise, Factory, Form, Container, ImagePanel, ImageTransformations, BlobConversions, UndoStack) {
	function createState(blob) {
		return {
			blob: blob,
			url: URL.createObjectURL(blob)
		};
	}

	function destroyState(state) {
		if (state) {
			URL.revokeObjectURL(state.url);
		}
	}

	function destroyStates(states) {
		Tools.each(states, destroyState);
	}

	function open(currentState, resolve, reject) {
		var win, undoStack = new UndoStack(), mainPanel, filtersPanel, tempState,
			cropPanel, resizePanel, flipRotatePanel, imagePanel, sidePanel, mainViewContainer,
			invertPanel, brightnessPanel, huePanel, saturatePanel, contrastPanel, grayscalePanel,
			sepiaPanel, colorizePanel, sharpenPanel, embossPanel, gammaPanel, exposurePanel, panels,
			width, height, ratioW, ratioH;

		function recalcSize(e) {
			var widthCtrl, heightCtrl, newWidth, newHeight;

			widthCtrl = win.find('#w')[0];
			heightCtrl = win.find('#h')[0];

			newWidth = parseInt(widthCtrl.value(), 10);
			newHeight = parseInt(heightCtrl.value(), 10);

			if (win.find('#constrain')[0].checked() && width && height && newWidth && newHeight) {
				if (e.control.settings.name == 'w') {
					newHeight = Math.round(newWidth * ratioW);
					heightCtrl.value(newHeight);
				} else {
					newWidth = Math.round(newHeight * ratioH);
					widthCtrl.value(newWidth);
				}
			}

			width = newWidth;
			height = newHeight;
		}

		function floatToPercent(value) {
			return Math.round(value * 100) + '%';
		}

		function updateButtonUndoStates() {
			win.find('#undo').disabled(!undoStack.canUndo());
			win.find('#redo').disabled(!undoStack.canRedo());
			win.statusbar.find('#save').disabled(!undoStack.canUndo());
		}

		function disableUndoRedo() {
			win.find('#undo').disabled(true);
			win.find('#redo').disabled(true);
		}

		function displayState(state) {
			if (state) {
				imagePanel.imageSrc(state.url);
			}
		}

		function switchPanel(targetPanel) {
			return function() {
				var hidePanels = Tools.grep(panels, function(panel) {
					return panel.settings.name != targetPanel;
				});

				Tools.each(hidePanels, function(panel) {
					panel.hide();
				});

				targetPanel.show();
			};
		}

		function addTempState(blob) {
			tempState = createState(blob);
			displayState(tempState);
		}

		function addBlobState(blob) {
			currentState = createState(blob);
			displayState(currentState);
			destroyStates(undoStack.add(currentState).removed);
			updateButtonUndoStates();
		}

		function crop() {
			var rect = imagePanel.selection();

			ImageTransformations.crop(currentState.blob, rect.x, rect.y, rect.w, rect.h).then(function(blob) {
				addBlobState(blob);
				cancel();
			});
		}

		function tempAction(fn) {
			var args = [].slice.call(arguments, 1);

			return function() {
				var state = tempState || currentState;

				fn.apply(this, [state.blob].concat(args)).then(addTempState);
			};
		}

		function action(fn) {
			var args = [].slice.call(arguments, 1);

			return function() {
				fn.apply(this, [currentState.blob].concat(args)).then(addBlobState);
			};
		}

		function cancel() {
			displayState(currentState);
			destroyState(tempState);
			switchPanel(mainPanel)();
			updateButtonUndoStates();
		}

		function applyTempState() {
			if (tempState) {
				addBlobState(tempState.blob);
				cancel();
			}
		}

		function zoomIn() {
			var zoom = imagePanel.zoom();

			if (zoom < 2) {
				zoom += 0.1;
			}

			imagePanel.zoom(zoom);
		}

		function zoomOut() {
			var zoom = imagePanel.zoom();

			if (zoom > 0.1) {
				zoom -= 0.1;
			}

			imagePanel.zoom(zoom);
		}

		function undo() {
			currentState = undoStack.undo();
			displayState(currentState);
			updateButtonUndoStates();
		}

		function redo() {
			currentState = undoStack.redo();
			displayState(currentState);
			updateButtonUndoStates();
		}

		function save() {
			resolve(currentState.blob);
			win.close();
		}

		function createPanel(items) {
			return new Form({
				layout: 'flex',
				direction: 'row',
				labelGap: 5,
				border: '0 0 1 0',
				align: 'center',
				pack: 'center',
				padding: '0 10 0 10',
				spacing: 5,
				flex: 0,
				minHeight: 60,
				defaults: {
					classes: 'imagetool',
					type: 'button'
				},
				items: items
			});
		}

		function createFilterPanel(title, filter) {
			return createPanel([
				{text: 'Back', onclick: cancel},
				{type: 'spacer', flex: 1},
				{text: 'Apply', subtype: 'primary', onclick: applyTempState}
			]).hide().on('show', function() {
				disableUndoRedo();

				filter(currentState.blob).then(function(blob) {
					var newTempState = createState(blob);

					displayState(newTempState);
					destroyState(tempState);
					tempState = newTempState;
				});
			});
		}

		function createVariableFilterPanel(title, filter, value, min, max) {
			function update(value) {
				filter(currentState.blob, value).then(function(blob) {
					var newTempState = createState(blob);
					displayState(newTempState);
					destroyState(tempState);
					tempState = newTempState;
				});
			}

			return createPanel([
				{text: 'Back', onclick: cancel},
				{type: 'spacer', flex: 1},
				{
					type: 'slider',
					flex: 1,
					ondragend: function(e) {
						update(e.value);
					},
					minValue: min,
					maxValue: max,
					value: value,
					previewFilter: floatToPercent
				},
				{type: 'spacer', flex: 1},
				{text: 'Apply', subtype: 'primary', onclick: applyTempState}
			]).hide().on('show', function() {
				this.find('slider').value(value);
				disableUndoRedo();
			});
		}

		function createRgbFilterPanel(title, filter) {
			function update() {
				var r, g, b;

				r = win.find('#r')[0].value();
				g = win.find('#g')[0].value();
				b = win.find('#b')[0].value();

				filter(currentState.blob, r, g, b).then(function(blob) {
					var newTempState = createState(blob);
					displayState(newTempState);
					destroyState(tempState);
					tempState = newTempState;
				});
			}

			return createPanel([
				{text: 'Back', onclick: cancel},
				{type: 'spacer', flex: 1},
				{
					type: 'slider', label: 'R', name: 'r', minValue: 0,
					value: 1, maxValue: 2, ondragend: update, previewFilter: floatToPercent
				},
				{
					type: 'slider', label: 'G', name: 'g', minValue: 0,
					value: 1, maxValue: 2, ondragend: update, previewFilter: floatToPercent
				},
				{
					type: 'slider', label: 'B', name: 'b', minValue: 0,
					value: 1, maxValue: 2, ondragend: update, previewFilter: floatToPercent
				},
				{type: 'spacer', flex: 1},
				{text: 'Apply', subtype: 'primary', onclick: applyTempState}
			]).hide().on('show', function() {
				win.find('#r,#g,#b').value(1);
				disableUndoRedo();
			});
		}

		cropPanel = createPanel([
			{text: 'Back', onclick: cancel},
			{type: 'spacer', flex: 1},
			{text: 'Apply', subtype: 'primary', onclick: crop}
		]).hide().on('show hide', function(e) {
			imagePanel.toggleCropRect(e.type == 'show');
		}).on('show', disableUndoRedo);

		function toggleConstrain(e) {
			if (e.control.value() === true) {
				ratioW = height / width;
				ratioH = width / height;
			}
		}

		resizePanel = createPanel([
			{text: 'Back', onclick: cancel},
			{type: 'spacer', flex: 1},
			{type: 'textbox', name: 'w', label: 'Width', size: 4, onkeyup: recalcSize},
			{type: 'textbox', name: 'h', label: 'Height', size: 4, onkeyup: recalcSize},
			{type: 'checkbox', name: 'constrain', text: 'Constrain proportions', checked: true, onchange: toggleConstrain},
			{type: 'spacer', flex: 1},
			{text: 'Apply', subtype: 'primary', onclick: 'submit'}
		]).hide().on('submit', function(e) {
			var width = parseInt(win.find('#w').value(), 10),
				height = parseInt(win.find('#h').value(), 10);

			e.preventDefault();

			action(ImageTransformations.resize, width, height)();
			cancel();
		}).on('show', disableUndoRedo);

		flipRotatePanel = createPanel([
			{text: 'Back', onclick: cancel},
			{type: 'spacer', flex: 1},
			{icon: 'fliph', tooltip: 'Flip horizontally', onclick: tempAction(ImageTransformations.flip, 'h')},
			{icon: 'flipv', tooltip: 'Flip vertically', onclick: tempAction(ImageTransformations.flip, 'v')},
			{icon: 'rotateleft', tooltip: 'Rotate counterclockwise', onclick: tempAction(ImageTransformations.rotate, -90)},
			{icon: 'rotateright', tooltip: 'Rotate clockwise', onclick: tempAction(ImageTransformations.rotate, 90)},
			{type: 'spacer', flex: 1},
			{text: 'Apply', subtype: 'primary', onclick: applyTempState}
		]).hide().on('show', disableUndoRedo);

		invertPanel = createFilterPanel("Invert", ImageTransformations.invert);
		sharpenPanel = createFilterPanel("Sharpen", ImageTransformations.sharpen);
		embossPanel = createFilterPanel("Emboss", ImageTransformations.emboss);

		brightnessPanel = createVariableFilterPanel("Brightness", ImageTransformations.brightness, 0, -1, 1);
		huePanel = createVariableFilterPanel("Hue", ImageTransformations.hue, 180, 0, 360);
		saturatePanel = createVariableFilterPanel("Saturate", ImageTransformations.saturate, 0, -1, 1);
		contrastPanel = createVariableFilterPanel("Contrast", ImageTransformations.contrast, 0, -1, 1);
		grayscalePanel = createVariableFilterPanel("Grayscale", ImageTransformations.grayscale, 0, 0, 1);
		sepiaPanel = createVariableFilterPanel("Sepia", ImageTransformations.sepia, 0, 0, 1);
		colorizePanel = createRgbFilterPanel("Colorize", ImageTransformations.colorize);
		gammaPanel = createVariableFilterPanel("Gamma", ImageTransformations.gamma, 0, -1, 1);
		exposurePanel = createVariableFilterPanel("Exposure", ImageTransformations.exposure, 1, 0, 2);

		filtersPanel = createPanel([
			{text: 'Back', onclick: cancel},
			{type: 'spacer', flex: 1},
			{text: 'hue', icon: 'hue', onclick: switchPanel(huePanel)},
			{text: 'saturate', icon: 'saturate', onclick: switchPanel(saturatePanel)},
			{text: 'sepia', icon: 'sepia', onclick: switchPanel(sepiaPanel)},
			{text: 'emboss', icon: 'emboss', onclick: switchPanel(embossPanel)},
			{text: 'exposure', icon: 'exposure', onclick: switchPanel(exposurePanel)},
			{type: 'spacer', flex: 1}
		]).hide();

		mainPanel = createPanel([
			{tooltip: 'Crop', icon: 'crop', onclick: switchPanel(cropPanel)},
			{tooltip: 'Resize', icon: 'resize2', onclick: switchPanel(resizePanel)},
			{tooltip: 'Orientation', icon: 'orientation', onclick: switchPanel(flipRotatePanel)},
			{tooltip: 'Brightness', icon: 'sun', onclick: switchPanel(brightnessPanel)},
			{tooltip: 'Sharpen', icon: 'sharpen', onclick: switchPanel(sharpenPanel)},
			{tooltip: 'Contrast', icon: 'contrast', onclick: switchPanel(contrastPanel)},
			{tooltip: 'Color levels', icon: 'drop', onclick: switchPanel(colorizePanel)},
			{tooltip: 'Gamma', icon: 'gamma', onclick: switchPanel(gammaPanel)},
			{tooltip: 'Invert', icon: 'invert', onclick: switchPanel(invertPanel)}
			//{text: 'More', onclick: switchPanel(filtersPanel)}
		]);

		imagePanel = new ImagePanel({
			flex: 1,
			imageSrc: currentState.url
		});

		sidePanel = new Container({
			layout: 'flex',
			direction: 'column',
			border: '0 1 0 0',
			padding: 5,
			spacing: 5,
			items: [
				{type: 'button', icon: 'undo', tooltip: 'Undo', name: 'undo', onclick: undo},
				{type: 'button', icon: 'redo', tooltip: 'Redo', name: 'redo', onclick: redo},
				{type: 'button', icon: 'zoomin', tooltip: 'Zoom in', onclick: zoomIn},
				{type: 'button', icon: 'zoomout', tooltip: 'Zoom out', onclick: zoomOut}
			]
		});

		mainViewContainer = new Container({
			type: 'container',
			layout: 'flex',
			direction: 'row',
			align: 'stretch',
			flex: 1,
			items: [sidePanel, imagePanel]
		});

		panels = [
			mainPanel,
			cropPanel,
			resizePanel,
			flipRotatePanel,
			filtersPanel,
			invertPanel,
			brightnessPanel,
			huePanel,
			saturatePanel,
			contrastPanel,
			grayscalePanel,
			sepiaPanel,
			colorizePanel,
			sharpenPanel,
			embossPanel,
			gammaPanel,
			exposurePanel
		];

		win = Factory.create('window', {
			layout: 'flex',
			direction: 'column',
			align: 'stretch',
			minWidth: Math.min(DOMUtils.DOM.getViewPort().w, 800),
			minHeight: Math.min(DOMUtils.DOM.getViewPort().h, 650),
			title: 'Edit image',
			items: panels.concat([mainViewContainer]),
			buttons: [
				{text: 'Save', name: 'save', subtype: 'primary', onclick: save},
				{text: 'Cancel', onclick: 'close'}
			]
		});

		win.renderTo(document.body).reflow();

		win.on('close', function() {
			reject();
			destroyStates(undoStack.data);
			undoStack = null;
			tempState = null;
		});

		undoStack.add(currentState);
		updateButtonUndoStates();

		imagePanel.on('load', function() {
			width = imagePanel.imageSize().w;
			height = imagePanel.imageSize().h;
			ratioW = height / width;
			ratioH = width / height;

			win.find('#w').value(width);
			win.find('#h').value(height);
		});
	}

	function edit(blob) {
		return new Promise(function(resolve, reject) {
			open(createState(blob), resolve, reject);
		});
	}

	//edit('img/dogleft.jpg');

	return {
		edit: edit
	};
});

/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 *
 * Settings:
 *  imagetools_cors_hosts - Array of remote domains that has CORS setup.
 *  imagetools_proxy - Url to proxy that streams images from remote host to local host.
 *  imagetools_toolbar - Toolbar items to render when an editable image is selected.
 */
define("tinymce/imagetoolsplugin/Plugin", [
	"global!tinymce.PluginManager",
	"global!tinymce.Env",
	"global!tinymce.util.Promise",
	"global!tinymce.util.URI",
	"global!tinymce.util.Tools",
	"global!tinymce.util.Delay",
	"ephox/imagetools/api/ImageTransformations",
	"ephox/imagetools/api/BlobConversions",
	"tinymce/imagetoolsplugin/Dialog"
], function(PluginManager, Env, Promise, URI, Tools, Delay, ImageTransformations, BlobConversions, Dialog) {
	var plugin = function(editor) {
		var count = 0, imageUploadTimer, lastSelectedImage;

		if (!Env.fileApi) {
			return;
		}

		/*
		function startCrop() {
			var imageRect, viewPortRect;

			imageRect = getSelectedImage().getBoundingClientRect();

			imageRect = {
				x: imageRect.left,
				y: imageRect.top,
				w: imageRect.width,
				h: imageRect.height
			};

			viewPortRect = {
				x: 0,
				y: 0,
				w: editor.getBody().scrollWidth,
				h: editor.getBody().scrollHeight
			};

			cropRect = new CropRect(imageRect, viewPortRect, imageRect, editor.getBody());
			cropRect.toggleVisibility(true);

			editor.selection.getSel().removeAllRanges();
			editor.nodeChanged();
		}

		function stopCrop() {
			if (cropRect) {
				cropRect.destroy();
				cropRect = null;
			}
		}
		*/

		function getImageSize(img) {
			var width, height;

			function isPxValue(value) {
				return value.indexOf('px') == value.length - 2;
			}

			width = img.style.width;
			height = img.style.height;
			if (width || height) {
				if (isPxValue(width) && isPxValue(height)) {
					return {
						w: parseInt(width, 10),
						h: parseInt(height, 10)
					};
				}

				return null;
			}

			width = editor.$(img).attr('width');
			height = editor.$(img).attr('height');
			if (width && height) {
				return {
					w: parseInt(width, 10),
					h: parseInt(height, 10)
				};
			}

			return null;
		}

		function setImageSize(img, size) {
			var width, height;

			if (size) {
				width = img.style.width;
				height = img.style.height;

				if (width || height) {
					editor.$(img).css({
						width: size.w,
						height: size.h
					}).removeAttr('data-mce-style');
				}

				width = img.width;
				height = img.height;

				if (width || height) {
					editor.$(img).attr({
						width: size.w,
						height: size.h
					});
				}
			}
		}

		function getNaturalImageSize(img) {
			return {
				w: img.naturalWidth,
				h: img.naturalHeight
			};
		}

		function getSelectedImage() {
			return editor.selection.getNode();
		}

		function createId() {
			return 'imagetools' + count++;
		}

		function isLocalImage(img) {
			var url = img.src;

			return url.indexOf('data:') === 0 || url.indexOf('blob:') === 0 || new URI(url).host === editor.documentBaseURI.host;
		}

		function isCorsImage(img) {
			return Tools.inArray(editor.settings.imagetools_cors_hosts, new URI(img.src).host) !== -1;
		}

		function getApiKey() {
			return editor.settings.api_key || editor.settings.imagetools_api_key;
		}

		function requestUrlAsBlob(url) {
			return new Promise(function(resolve) {
				var xhr, apiKey;

				xhr = new XMLHttpRequest();
				xhr.onload = function() {
					resolve(this.response);
				};

				xhr.open('GET', url, true);

				apiKey = getApiKey();
				if (apiKey) {
					xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
					xhr.setRequestHeader('tiny-api-key', apiKey);
				}

				xhr.responseType = 'blob';
				xhr.send();
			});
		}

		function imageToBlob(img) {
			var src = img.src;

			if (isCorsImage(img)) {
				return requestUrlAsBlob(img.src);
			}

			if (!isLocalImage(img)) {
				src = editor.settings.imagetools_proxy;
				src += (src.indexOf('?') === -1 ? '?' : '&') + 'url=' + encodeURIComponent(img.src);

				if (getApiKey()) {
					return requestUrlAsBlob(src);
				}

				img = new Image();
				img.src = src;
			}

			return BlobConversions.imageToBlob(img);
		}

		function findSelectedBlobInfo() {
			var blobInfo;

			blobInfo = editor.editorUpload.blobCache.getByUri(getSelectedImage().src);
			if (blobInfo) {
				return blobInfo;
			}

			return imageToBlob(getSelectedImage()).then(function(blob) {
				return BlobConversions.blobToBase64(blob).then(function(base64) {
					var blobCache = editor.editorUpload.blobCache;
					var blobInfo = blobCache.create(createId(), blob, base64);
					blobCache.add(blobInfo);
					return blobInfo;
				});
			});
		}

		function startTimedUpload() {
			imageUploadTimer = Delay.setEditorTimeout(editor, function() {
				editor.editorUpload.uploadImagesAuto();
			}, 30000);
		}

		function cancelTimedUpload() {
			clearTimeout(imageUploadTimer);
		}

		function updateSelectedImage(blob, uploadImmediately) {
			return BlobConversions.blobToDataUri(blob).then(function(dataUri) {
				var id, base64, blobCache, blobInfo, selectedImage;

				selectedImage = getSelectedImage();
				id = createId();
				blobCache = editor.editorUpload.blobCache;
				base64 = URI.parseDataUri(dataUri).data;

				blobInfo = blobCache.create(id, blob, base64);
				blobCache.add(blobInfo);

				editor.undoManager.transact(function() {
					function imageLoadedHandler() {
						editor.$(selectedImage).off('load', imageLoadedHandler);
						editor.nodeChanged();

						if (uploadImmediately) {
							editor.editorUpload.uploadImagesAuto();
						} else {
							cancelTimedUpload();
							startTimedUpload();
						}
					}

					editor.$(selectedImage).on('load', imageLoadedHandler);

					editor.$(selectedImage).attr({
						src: blobInfo.blobUri()
					}).removeAttr('data-mce-src');
				});

				return blobInfo;
			});
		}

		function selectedImageOperation(fn) {
			return function() {
				return editor._scanForImages().then(findSelectedBlobInfo).then(fn).then(updateSelectedImage);
			};
		}

		function rotate(angle) {
			return function() {
				return selectedImageOperation(function(blobInfo) {
					var size = getImageSize(getSelectedImage());

					if (size) {
						setImageSize(getSelectedImage(), {
							w: size.h,
							h: size.w
						});
					}

					return ImageTransformations.rotate(blobInfo.blob(), angle);
				})();
			};
		}

		function flip(axis) {
			return function() {
				return selectedImageOperation(function(blobInfo) {
					return ImageTransformations.flip(blobInfo.blob(), axis);
				})();
			};
		}

		function editImageDialog() {
			var img = getSelectedImage(), originalSize = getNaturalImageSize(img);

			if (img) {
				imageToBlob(img).then(Dialog.edit).then(function(blob) {
					return new Promise(function(resolve) {
						BlobConversions.blobToImage(blob).then(function(newImage) {
							var newSize = getNaturalImageSize(newImage);

							if (originalSize.w != newSize.w || originalSize.h != newSize.h) {
								if (getImageSize(img)) {
									setImageSize(img, newSize);
								}
							}

							URL.revokeObjectURL(newImage.src);
							resolve(blob);
						});
					});
				}).then(function(blob) {
					updateSelectedImage(blob, true);
				}, function() {
					// Close dialog
				});
			}
		}

		function addButtons() {
			editor.addButton('rotateleft', {
				title: 'Rotate counterclockwise',
				onclick: rotate(-90)
			});

			editor.addButton('rotateright', {
				title: 'Rotate clockwise',
				onclick: rotate(90)
			});

			editor.addButton('flipv', {
				title: 'Flip vertically',
				onclick: flip('v')
			});

			editor.addButton('fliph', {
				title: 'Flip horizontally',
				onclick: flip('h')
			});

			editor.addButton('editimage', {
				title: 'Edit image',
				onclick: editImageDialog
			});

			editor.addButton('imageoptions', {
				title: 'Image options',
				icon: 'options',
				cmd: 'mceImage'
			});

			/*
			editor.addButton('crop', {
				title: 'Crop',
				onclick: startCrop
			});
			*/
		}

		function addEvents() {
			editor.on('NodeChange', function(e) {
				//If the last node we selected was an image
				//And had a source that doesn't match the current blob url
				//We need to attempt to upload it
				if (lastSelectedImage && lastSelectedImage.src != e.element.src) {
					cancelTimedUpload();
					editor.editorUpload.uploadImagesAuto();
					lastSelectedImage = undefined;
				}

				//Set up the lastSelectedImage
				if (isEditableImage(e.element)) {
					lastSelectedImage = e.element;
				}
			});
		}

		function isEditableImage(img) {
			var selectorMatched = editor.dom.is(img, 'img:not([data-mce-object],[data-mce-placeholder])');

			return selectorMatched && (isLocalImage(img) || isCorsImage(img) || editor.settings.imagetools_proxy);
		}

		function addToolbars() {
			var toolbarItems = editor.settings.imagetools_toolbar;

			if (!toolbarItems) {
				toolbarItems = 'rotateleft rotateright | flipv fliph | crop editimage imageoptions';
			}

			editor.addContextToolbar(
				isEditableImage,
				toolbarItems
			);
		}

		addButtons();
		addToolbars();
		addEvents();

		editor.addCommand('mceEditImage', editImageDialog);
	};

	PluginManager.add('imagetools', plugin);

	return function() {};
});

dem('tinymce/imagetoolsplugin/Plugin')();
})();
