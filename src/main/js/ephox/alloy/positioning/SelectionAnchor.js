define(
  'ephox.alloy.positioning.SelectionAnchor',

  [
    'ephox.alloy.alien.AdjustPositions',
    'ephox.alloy.alien.Descend',
    'ephox.alloy.alien.Rectangles',
    'ephox.boulder.api.FieldSchema',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.Layout',
    'ephox.repartee.api.MaxHeight',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.Traverse'
  ],

  function (AdjustPositions, Descend, Rectangles, FieldSchema, SelectionRange, WindowSelection, Awareness, Fun, Option, Bubble, Layout, MaxHeight, Struct, Compare, Element, Location, Node, Scroll, Traverse) {
    var point = Struct.immutable('element', 'offset');

    // A range from (a, 1) to (body, end) was giving the wrong bounds.
    var modifyStart = function (element, offset) {
      return Node.isText(element) ? point(element, offset) : Descend.descendOnce(element, offset);
    };

    var getAnchorSelection = function (win, anchorInfo) {
      var getSelection = anchorInfo.getSelection().getOrThunk(function () {
        return function () {
          return WindowSelection.get(win);
        };
      });

      return getSelection().map(function (sel) {
        var rootEnd = Awareness.getEnd(anchorInfo.root());
        var modStart = modifyStart(sel.start(), sel.soffset());
        return SelectionRange.general(modStart.element(), modStart.offset(), anchorInfo.root(), rootEnd);
      });
    };

    // In one mode, the window is inside an iframe. If that iframe is in the
    // same document as the positioning element (component), then identify the offset
    // difference between the iframe and the component.
    var getOffset = function (component, anchorInfo) {
      var win = Traverse.defaultView(anchorInfo.root()).dom();

      var hasSameOwner = function (frame) {
        var frameOwner = Traverse.owner(frame);
        var compOwner = Traverse.owner(component.element());
        return Compare.eq(frameOwner, compOwner);
      };

      return Option.from(win.frameElement).map(Element.fromDom).
        filter(hasSameOwner).map(Location.absolute);
    };


    var placement = function (component, posInfo, anchorInfo, origin) {
      var win = Traverse.defaultView(anchorInfo.root()).dom();
      var rawAnchorBox = getAnchorSelection(win, anchorInfo).bind(function (sel) {
        var optRect = WindowSelection.rectangleAt(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
        return optRect.map(Rectangles.fromRaw);
      }).getOr(Rectangles.empty());

      var optOffset = getOffset(component, anchorInfo);

      var anchorBox = AdjustPositions.adjust(origin, optOffset, Scroll.get(), rawAnchorBox);

      return {
        anchorBox: Fun.constant(anchorBox),
        bubble: Fun.constant(Bubble(0, 0)),
        maxHeightFunction: Fun.constant(MaxHeight.available()),
        layouts: Fun.constant(Layout)
      };
    };

    return [
      // FieldSchema.defaulted(/) // ui direction
      FieldSchema.option('getSelection'),
      FieldSchema.strict('root'),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);