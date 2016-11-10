define(
  'ephox.alloy.dragging.Presnaps',

  [
    'ephox.perhaps.Option',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Attr',
    'global!isNaN',
    'global!parseInt'
  ],

  function (Option, Position, Attr, isNaN, parseInt) {
    // DUPE with ego with some parameterisation
    var get = function (component, dockInfo) {
      var element = component.element();
      var x = parseInt(Attr.get(element, dockInfo.leftAttr()), 10);
      var y = parseInt(Attr.get(element, dockInfo.topAttr()), 10);
      return isNaN(x) || isNaN(y) ? Option.none() : Option.some(
        Position(x, y)
      );
    };

    var set = function (component, dockInfo, pt) {
      var element = component.element();
      Attr.set(element, dockInfo.leftAttr(), pt.left() + 'px');
      Attr.set(element, dockInfo.topAttr(), pt.top() + 'px');
    };

    var clear = function (component, dockInfo) {
      var element = component.element();
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