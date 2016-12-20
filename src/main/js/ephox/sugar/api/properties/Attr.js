define(
  'ephox.sugar.api.properties.Attr',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.node.Node',
    'global!Error',
    'global!console'
  ],

  /*
   * Direct attribute manipulation has been around since IE8, but
   * was apparently unstable until IE10.
   */
  function (Type, Arr, Obj, Node, Error, console) {
    var rawSet = function (dom, key, value) {
      /*
       * JQuery coerced everything to a string, and silently did nothing on text node/null/undefined.
       *
       * We fail on those invalid cases, only allowing numbers and booleans.
       */
      if (Type.isString(value) || Type.isBoolean(value) || Type.isNumber(value)) {
        dom.setAttribute(key, value + '');
      } else {
        console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
        throw new Error('Attribute value was not simple');
      }
    };

    var set = function (element, key, value) {
      rawSet(element.dom(), key, value);
    };

    var setAll = function (element, attrs) {
      var dom = element.dom();
      Obj.each(attrs, function (v, k) {
        rawSet(dom, k, v);
      });
    };

    var get = function (element, key) {
      var v = element.dom().getAttribute(key);

      // undefined is the more appropriate value for JS, and this matches JQuery
      return v === null ? undefined : v;
    };

    var has = function (element, key) {
      var dom = element.dom();

      // return false for non-element nodes, no point in throwing an error
      return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
    };

    var remove = function (element, key) {
      element.dom().removeAttribute(key);
    };

    var hasNone = function (element) {
      var attrs = element.dom().attributes;
      return attrs === undefined || attrs === null || attrs.length === 0;
    };

    var clone = function (element) {
      return Arr.foldl(element.dom().attributes, function (acc, attr) {
        acc[attr.name] = attr.value;
        return acc;
      }, {});
    };

    var transferOne = function (source, destination, attr) {
      // NOTE: We don't want to clobber any existing attributes
      if (has(source, attr) && !has(destination, attr)) set(destination, attr, get(source, attr));        
    };

    // Transfer attributes(attrs) from source to destination, unless they are already present
    var transfer = function (source, destination, attrs) {
      if (!Node.isElement(source) || !Node.isElement(destination)) return;
      Arr.each(attrs, function (attr) {
        transferOne(source, destination, attr);
      });
    };

    return {
      clone: clone,
      set: set,
      setAll: setAll,
      get: get,
      has: has,
      remove: remove,
      hasNone: hasNone,
      transfer: transfer
    };
  }
);
