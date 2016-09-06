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
    'ephox.repartee.api.Origins',
    'ephox.scullion.Struct',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Scroll',
    'ephox.sugar.api.Traverse'
  ],

  function (AdjustPositions, Descend, Rectangles, FieldSchema, SelectionRange, WindowSelection, Awareness, Fun, Option, Bubble, Layout, MaxHeight, Origins, Struct, Compare, Element, Location, Node, Scroll, Traverse) {
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
    var getOffset = function (component, origin, anchorInfo) {
      var win = Traverse.defaultView(anchorInfo.root()).dom();

      var hasSameOwner = function (frame) {
        var frameOwner = Traverse.owner(frame);
        var compOwner = Traverse.owner(component.element());
        return Compare.eq(frameOwner, compOwner);
      };

      return Option.from(win.frameElement).map(Element.fromDom).
        filter(hasSameOwner).map(Location.absolute).map(function (pos) {
          return Origins.cata(origin, 
            // None uses value with scroll in it
            Fun.constant(pos),
            // Relative uses value with scroll in it
            Fun.constant(pos),
            // Fixed removes scroll
            function () {
              /* Fixed */
              var doc = Traverse.owner(component.element());
              var scroll = Scroll.get(doc);
              return pos.translate(-scroll.left(), -scroll.top());
            }
          );
        });
    };


    var placement = function (component, posInfo, anchorInfo, origin) {
      var doc = Traverse.owner(component.element());
      var outerScroll = Scroll.get(doc);
      var win = Traverse.defaultView(anchorInfo.root()).dom();
      var optOffset = getOffset(component, origin, anchorInfo);
      var rawAnchorBox = getAnchorSelection(win, anchorInfo).bind(function (sel) {
        /* This represents the *visual* rectangle of the selection. If it is in the 
         * same document, then you need to consider scroll (because scroll isn't being
         * added by the offset above. If it is not in the same document, then leave it 
         * as is
         */
        var optRect = WindowSelection.rectangleAt(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
        return optRect.map(function (rawRect) {
          var rect = Rectangles.fromRaw(rawRect);
          return optOffset.fold(function () {
            return origin.fold(function () {
              // None with no offset ... add scroll
              return Rectangles.translate(rect, outerScroll.left(), outerScroll.top());
            }, function () {
              // Relative with no offset ... add scroll
              return Rectangles.translate(rect, outerScroll.left(), outerScroll.top());
            }, function (_) {
              // Fixed with no offset ... do not add scroll
              return rect;
            });
          }, function (_) {
            return rect;
          });
        });
      }).getOr(Rectangles.empty());

      

      var anchorBox = AdjustPositions.adjust(origin, optOffset, outerScroll, rawAnchorBox);

      return {
        anchorBox: Fun.constant(anchorBox),
        bubble: Fun.constant(Bubble(0, 0)),
        maxHeightFunction: Fun.constant(MaxHeight.available()),
        layouts: Fun.constant(Layout)
      };
    };

    return [
      FieldSchema.option('getSelection'),
      FieldSchema.strict('root'),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);