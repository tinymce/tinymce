define(
  'ephox.alloy.positioning.mode.ContainerOffsets',

  [
    'ephox.alloy.alien.CssPosition',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.view.Location',
    'ephox.sugar.api.view.Scroll',
    'ephox.sugar.api.search.Traverse'
  ],

  function (CssPosition, Option, Compare, Element, Location, Scroll, Traverse) {
    // In one mode, the window is inside an iframe. If that iframe is in the
    // same document as the positioning element (component), then identify the offset
    // difference between the iframe and the component.
    var getOffset = function (component, origin, anchorInfo) {
      var win = Traverse.defaultView(anchorInfo.root()).dom();

      var hasSameOwner = function (frame) {
        var frameOwner = Traverse.owner(frame);
        var compOwner = Traverse.owner(component.element());
        return Compare.eq(frameOwner, compOwner);
      };

      return Option.from(win.frameElement).map(Element.fromDom).
        filter(hasSameOwner).map(Location.absolute);
    };

    var getRootPoint = function (component, origin, anchorInfo) {
      var doc = Traverse.owner(component.element());
      var outerScroll = Scroll.get(doc);

      var offset = getOffset(component, origin, anchorInfo).getOr(outerScroll);
      return CssPosition.absolute(offset, outerScroll.left(), outerScroll.top());
    };

    return {
      getRootPoint: getRootPoint
    };
  }
);