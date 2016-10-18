define(
  'ephox.alloy.positioning.SelectionAnchor',

  [
    'ephox.alloy.alien.Boxes',
    'ephox.alloy.alien.CssPosition',
    'ephox.alloy.alien.Descend',
    'ephox.alloy.positioning.Anchoring',
    'ephox.alloy.positioning.ContainerOffsets',
    'ephox.boulder.api.FieldSchema',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.WindowSelection',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.Layout',
    'ephox.repartee.api.Origins',
    'ephox.scullion.Struct',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Direction',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Traverse'
  ],

  function (Boxes, CssPosition, Descend, Anchoring, ContainerOffsets, FieldSchema, SelectionRange, WindowSelection, Fun, Option, Bubble, Layout, Origins, Struct, Position, Direction, Node, Traverse) {
    var point = Struct.immutable('element', 'offset');

    // A range from (a, 1) to (body, end) was giving the wrong bounds.
    var descendOnce = function (element, offset) {
      return Node.isText(element) ? point(element, offset) : Descend.descendOnce(element, offset);
    };

    var getAnchorSelection = function (win, anchorInfo) {
      var getSelection = anchorInfo.getSelection().getOrThunk(function () {
        return function () {
          return WindowSelection.get(win);
        };
      });

      return getSelection().map(function (sel) {
        var modStart = descendOnce(sel.start(), sel.soffset());
        var modFinish = descendOnce(sel.finish(), sel.foffset());
        return SelectionRange.general(modStart.element(), modStart.offset(), modFinish.element(), modFinish.offset());
      });
    };

    var placement = function (component, posInfo, anchorInfo, origin) {
      var win = Traverse.defaultView(anchorInfo.root()).dom();
      var rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

      var selectionBox = getAnchorSelection(win, anchorInfo).bind(function (sel) {
        // This represents the *visual* rectangle of the selection.
        var optRect = WindowSelection.rectangleAt(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset());
        return optRect.map(function (rawRect) {
          // NOTE: We are going to have to do some interesting things to make inline toolbars not appear over the toolbar.
          var point = CssPosition.screen(
            Position(rawRect.left, rawRect.top)
          );

          console.log('rawRect', rawRect.height, rawRect.top);

          return Boxes.pointed(point, rawRect.width, rawRect.height);
        });
      });

      return selectionBox.map(function (box) {
        var points = [ rootPoint, box.point() ];
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

        var anchorBox = Boxes.rect(
          topLeft.left(),
          topLeft.top(),
          box.width(),
          box.height()
        );

        var targetElement = getAnchorSelection(win, anchorInfo).bind(function (sel) {
          return Node.isElement(sel.start()) ? Option.some(sel.start()) : Traverse.parent(sel.start());
        });

        var getLayouts = Direction.onDirection([ Layout.northwest ], Layout.allRtl());
        var layouts = targetElement.map(getLayouts).getOrThunk(Layout.all);

        return Anchoring({
          anchorBox: Fun.constant(anchorBox),
          bubble: Fun.constant(Bubble(0, 0)),
          overrides: Fun.constant({ }),
          layouts: Fun.constant(layouts)
        });
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