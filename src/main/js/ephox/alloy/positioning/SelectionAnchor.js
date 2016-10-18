define(
  'ephox.alloy.positioning.SelectionAnchor',

  [
    'ephox.alloy.alien.Boxes',
    'ephox.alloy.alien.CssPosition',
    'ephox.alloy.alien.Descend',
    'ephox.alloy.positioning.Anchoring',
    'ephox.alloy.positioning.ContainerOffsets',
    'ephox.boulder.api.FieldSchema',
    'ephox.bud.Unicode',
    'ephox.fussy.api.SelectionRange',
    'ephox.fussy.api.WindowSelection',
    'ephox.oath.proximity.Awareness',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Bubble',
    'ephox.repartee.api.Layout',
    'ephox.repartee.api.Origins',
    'ephox.scullion.Struct',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Direction',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.Traverse',
    'global!Math'
  ],

  function (Boxes, CssPosition, Descend, Anchoring, ContainerOffsets, FieldSchema, Unicode, SelectionRange, WindowSelection, Awareness, Fun, Option, Bubble, Layout, Origins, Struct, Position, Direction, Element, Insert, Node, Remove, Traverse, Math) {
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

      console.log('selection.placement');

      var selectionBox = getAnchorSelection(win, anchorInfo).bind(function (sel) {
        console.log('sel', sel.start().dom());
        // This represents the *visual* rectangle of the selection.
        var optRect = WindowSelection.rectangleAt(win, sel.start(), sel.soffset(), sel.finish(), sel.foffset()).orThunk(function () {
          var x = Element.fromText(Unicode.zeroWidth());
          Insert.before(sel.start(), x);
          // Certain things like <p><br/></p> with (p, 0) or <br>) as collapsed selection do not return a client rectangle
          return WindowSelection.rectangleAt(win, x, 0, x, 1).map(function (rect) {
            Remove.remove(x);
            return rect;
          });          
        });
        return optRect.map(function (rawRect) {
          // NOTE: We are going to have to do some interesting things to make inline toolbars not appear over the toolbar.
          var point = CssPosition.screen(
            Position(
              Math.max(0, rawRect.left),
              Math.max(0, rawRect.top)
            )
          );

          console.log('rawRect', rawRect.height, rawRect.top, rawRect.width, rawRect.height);

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

        var layoutsLtr = function () {
          return [ Layout.northeast, Layout.northwest, Layout.southeast, Layout.southwest, Layout.northmiddle, Layout.southmiddle ];
        };

        var layoutsRtl = function () {
          return [ Layout.northwest, Layout.northeast, Layout.southwest, Layout.southeast, Layout.northmiddle, Layout.southmiddle ];
        };

        var getLayouts = Direction.onDirection(layoutsLtr(), layoutsRtl());
        var layouts = targetElement.map(getLayouts).getOrThunk(layoutsLtr);

        return Anchoring({
          anchorBox: Fun.constant(anchorBox),
          bubble: Fun.constant(anchorInfo.bubble().getOr(Bubble(0, 0))),
          overrides: Fun.constant({ }),
          layouts: Fun.constant(layouts)
        });
      });
    };

    return [
      FieldSchema.option('getSelection'),
      FieldSchema.strict('root'),
      FieldSchema.option('bubble'),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);