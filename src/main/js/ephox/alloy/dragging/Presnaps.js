define(
  'ephox.alloy.dragging.Presnaps',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'global!isNaN'
  ],

  function (Fun, Option, Attr, isNaN) {
    // DUPE with ego with some parameterisation
    var get = function (component, dockInfo) {
      var element = component.elemnent();
      var x = parseInt(Attr.get(element, dockInfo.leftAttr()), 10);
      var y = parseInt(Attr.get(element, dockInfo.topAttr()), 10);
      var position = Attr.get(element, dockInfo.posAttr());
      return isNaN(x) || isNaN(y) ? Option.none() : Option.some({
        left: Fun.constant(x),
        top: Fun.constant(y),
        position: Fun.constant(position)
      });
    };

    var set = function (component, dockInfo, position, x, y) {
      var element = component.element();
      Attr.set(element, dockInfo.posAttr(), position);
      Attr.set(element, dockInfo.leftAttr(), x + 'px');
      Attr.set(element, dockInfo.topAttr(), y + 'px');
    };

    var clear = function (component, dockInfo) {
      var element = component.element();
      Attr.remove(element, dockInfo.posAttr());
      Attr.remove(element, dockInfo.leftAttr());
      Attr.remove(element, dockInfo.topAttr());
    };

    return {
      get: get,
      set: set,
      clear: clear
    };
  }
);