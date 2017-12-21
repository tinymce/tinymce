import Boxes from '../../alien/Boxes';
import CssPosition from '../../alien/CssPosition';
import Descend from '../../alien/Descend';
import Fields from '../../data/Fields';
import Bubble from '../layout/Bubble';
import Layout from '../layout/Layout';
import Origins from '../layout/Origins';
import Anchoring from './Anchoring';
import ContainerOffsets from './ContainerOffsets';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import { Unicode } from '@ephox/katamari';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { Direction } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { Selection } from '@ephox/sugar';
import { WindowSelection } from '@ephox/sugar';
import { Position } from '@ephox/sugar';

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
      return WindowSelection.getFirstRect(win, Selection.exact(x, 0, x, 1)).map(function (rect) {
        Remove.remove(x);
        return rect;
      });
    });
    return optRect.map(function (rawRect) {
      // NOTE: We are going to have to do some interesting things to make inline toolbars not appear over the toolbar.
      var point = CssPosition.screen(
        Position(
          Math.max(0, rawRect.left()),
          Math.max(0, rawRect.top())
        )
      );

      return Boxes.pointed(point, rawRect.width(), rawRect.height());
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

export default <any> [
  FieldSchema.option('getSelection'),
  FieldSchema.strict('root'),
  FieldSchema.option('bubble'),
  // chiefly MaxHeight.expandable()
  FieldSchema.defaulted('overrides', { }),
  FieldSchema.defaulted('showAbove', false),
  Fields.output('placement', placement)
];