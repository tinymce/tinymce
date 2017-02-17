define(
  'ephox.alloy.frame.OuterPosition',

  [
    'ephox.alloy.frame.Frames',
    'ephox.alloy.frame.Navigation',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Position',
    'ephox.sugar.api.view.Scroll',
    'global!document'
  ],

  function (Frames, Navigation, Arr, Fun, Element, Location, Position, Scroll, document) {
    var find = function (element) {
      var doc = Element.fromDom(document);
      var scroll = Scroll.get(doc);
      var path = Frames.pathTo(element, Navigation);

      return path.fold(Fun.curry(Location.absolute, element), function (frames) {
        var offset = Location.viewport(element);

        var r = Arr.foldr(frames, function (b, a) {
          var loc = Location.viewport(a);
          return {
            left: b.left + loc.left(),
            top: b.top + loc.top()
          };
        }, { left: 0, top: 0 });

        return Position(r.left + offset.left() + scroll.left(), r.top + offset.top() + scroll.top());
      });
    };

    return {
      find: find
    };
  }
);
