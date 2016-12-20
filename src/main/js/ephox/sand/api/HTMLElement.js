define(
  'ephox.sand.api.HTMLElement',

  [
    'ephox.katamari.api.Resolve',
    'ephox.sand.util.Global'
  ],

  function (Resolve, Global) {
    /*
     * IE9 and above
     *
     * MDN no use on this one, but here's the link anyway:
     * https://developer.mozilla.org/en/docs/Web/API/HTMLElement
     */
    var htmlElement = function (scope) {
      return Global.getOrDie('HTMLElement', scope);
    };

    var isPrototypeOf = function (x) {
      // use Resolve to get the window object for x and just return undefined if it can't find it.
      // undefined scope later triggers using the global window.
      var scope = Resolve.resolve('ownerDocument.defaultView', x);

      return htmlElement(scope).prototype.isPrototypeOf(x);
    };

    return {
      isPrototypeOf: isPrototypeOf
    };
  }
);