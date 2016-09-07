define(
  'ephox.alloy.positioning.SelectionAnchor',

  [
    'ephox.alloy.alien.Boxes',
    'ephox.alloy.alien.CssPosition',
    'ephox.alloy.alien.Descend',
    'ephox.alloy.positioning.ContainerOffsets',
    'ephox.boulder.api.FieldSchema',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.Layout',
    'ephox.repartee.api.MaxHeight',
    'ephox.repartee.api.Origins',
    'ephox.scullion.Struct',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Traverse'
  ],

  function (Boxes, CssPosition, Descend, ContainerOffsets, FieldSchema, SelectionRange, WindowSelection, Awareness, Fun, Bubble, Layout, MaxHeight, Origins, Struct, Position, Node, Traverse) {
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

    var placement = function (component, posInfo, anchorInfo, origin) {
      var win = Traverse.defaultView(anchorInfo.root()).dom();
      var rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

      var selectionBox = getAnchorSelection(win, anchorInfo).bind(function (sel) {
        // This represents the *visual* rectangle of the selection.
        var optRect = WindowSelection.rectangleAt(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
        return optRect.map(function (rawRect) {
          var point = CssPosition.screen(
            Position(rawRect.left, rawRect.top)
          );
          debugger;
          return Boxes.pointed(point, rawRect.width, rawRect.height);
        });
      });

      return selectionBox.map(function (box) {
        var points = [ rootPoint, box.point() ];
        debugger;
        var topLeft = Origins.cata(origin,
          function () {
            return CssPosition.sumAsAbsolute(points);
          },
          function () {
            return CssPosition.sumAsAbsolute(points);
          },
          function () {
            return CssPosition.sumAsFixed(points);
          }
        );

        console.log('topLeft', topLeft.left(), topLeft.top());

        var anchorBox = Boxes.rect(
          topLeft.left(),
          topLeft.top(),
          box.width(),
          box.height()
        );

        return {
          anchorBox: Fun.constant(anchorBox),
          bubble: Fun.constant(Bubble(0, 0)),
          maxHeightFunction: Fun.constant(MaxHeight.available()),
          layouts: Fun.constant(Layout)
        };
      });
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