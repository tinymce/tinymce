define(
  'ephox.alloy.positioning.mode.SelectionAnchor',

  [
    'ephox.alloy.alien.Boxes',
    'ephox.alloy.alien.CssPosition',
    'ephox.alloy.alien.Descend',
    'ephox.alloy.positioning.layout.Bubble',
    'ephox.alloy.positioning.layout.Layout',
    'ephox.alloy.positioning.layout.Origins',
    'ephox.alloy.positioning.mode.Anchoring',
    'ephox.alloy.positioning.mode.ContainerOffsets',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'ephox.katamari.api.Unicode',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Direction',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Selection',
    'ephox.sugar.api.selection.WindowSelection',
    'ephox.sugar.api.view.Position',
    'global!Math'
  ],

  function (
    Boxes, CssPosition, Descend, Bubble, Layout, Origins, Anchoring, ContainerOffsets, FieldSchema, Fun, Option, Struct, Unicode, Insert, Remove, Element, Node,
    Direction, Traverse, Selection, WindowSelection, Position, Math
  ) {
    var point = Struct.immutable('element', 'offset');

    // A range from (a, 1) to (body, end) was giving the wrong bounds.
    var descendOnce = function (element, offset) {
      return Node.isText(element) ? point(element, offset) : Descend.descendOnce(element, offset);
    };

    var getAnchorSelection = function (win, anchorInfo) {
      var getSelection = anchorInfo.getSelection().getOrThunk(function () {
        return function () {
          return WindowSelection.getExact(win);
        };
      });

      return getSelection().map(function (sel) {
        var modStart = descendOnce(sel.start(), sel.soffset());
        var modFinish = descendOnce(sel.finish(), sel.foffset());
        return Selection.range(modStart.element(), modStart.offset(), modFinish.element(), modFinish.offset());
      });
    };

    var placement = function (component, posInfo, anchorInfo, origin) {
      var win = Traverse.defaultView(anchorInfo.root()).dom();
      var rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

      var selectionBox = getAnchorSelection(win, anchorInfo).bind(function (sel) {
        // This represents the *visual* rectangle of the selection.
        var optRect = WindowSelection.getFirstRect(win, Selection.exactFromRange(sel)).orThunk(function () {
          var x = Element.fromText(Unicode.zeroWidth());
          Insert.before(sel.start(), x);
          // Certain things like <p><br/></p> with (p, 0) or <br>) as collapsed selection do not return a client rectangle
          return WindowSelection.getFirstRect(win, Selection.range(x, 0, x, 1)).map(function (rect) {
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
          return anchorInfo.showAbove() ? 
            [ Layout.northeast, Layout.northwest, Layout.southeast, Layout.southwest, Layout.northmiddle, Layout.southmiddle ] :
            [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.southmiddle, Layout.northmiddle ];
        };

        var layoutsRtl = function () {
          return anchorInfo.showAbove() ? 
            [ Layout.northwest, Layout.northeast, Layout.southwest, Layout.southeast, Layout.northmiddle, Layout.southmiddle ] :
            [ Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.southmiddle, Layout.northmiddle ];
        };

        var getLayouts = Direction.onDirection(layoutsLtr(), layoutsRtl());
        var layouts = targetElement.map(getLayouts).getOrThunk(layoutsLtr);

        return Anchoring({
          anchorBox: Fun.constant(anchorBox),
          bubble: Fun.constant(anchorInfo.bubble().getOr(Bubble(0, 0))),
          overrides: anchorInfo.overrides,
          layouts: Fun.constant(layouts),
          placer: Option.none
        });
      });
    };

    return [
      FieldSchema.option('getSelection'),
      FieldSchema.strict('root'),
      FieldSchema.option('bubble'),
      // chiefly MaxHeight.expandable()
      FieldSchema.defaulted('overrides', { }),
      FieldSchema.defaulted('showAbove', false),
      FieldSchema.state('placement', function () {
        return placement;
      })
    ];
  }
);