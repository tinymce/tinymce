define(
  'ephox.alloy.alien.OffsetOrigin',

  [
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Traverse'
  ],

  function (Position, Element, Insert, Location, Remove, Traverse) {
    var getOrigin = function (component, scroll) {
      return Traverse.offsetParent(component.element()).orThunk(function () {
        var marker = Element.fromTag('span');
        Insert.before(component.element(), marker);
        var offsetParent = Traverse.offsetParent(marker);
        Remove.remove(marker);
        return offsetParent;
      }).map(function (offsetP) {
        var loc = Location.absolute(offsetP);
        // Think about whether you want to do this.
        return loc.translate(-scroll.left(), -scroll.top());
      }).getOrThunk(function () {
        return Position(0, 0);
      });
    };

    return {
      getOrigin: getOrigin
    };
  }
);