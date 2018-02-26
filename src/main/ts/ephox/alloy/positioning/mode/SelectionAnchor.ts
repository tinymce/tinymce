import { FieldSchema } from '@ephox/boulder';
import { Fun, Option, Struct, Unicode } from '@ephox/katamari';
import { Direction, Element, Insert, Node, Position, Remove, Selection, Traverse, WindowSelection } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import CssPosition from '../../alien/CssPosition';
import * as Descend from '../../alien/Descend';
import * as Fields from '../../data/Fields';
import Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import Anchoring from './Anchoring';
import * as ContainerOffsets from './ContainerOffsets';

const point = Struct.immutable('element', 'offset');

// A range from (a, 1) to (body, end) was giving the wrong bounds.
const descendOnce = function (element, offset) {
  return Node.isText(element) ? point(element, offset) : Descend.descendOnce(element, offset);
};

const getAnchorSelection = function (win, anchorInfo) {
  const getSelection = anchorInfo.getSelection().getOrThunk(function () {
    return function () {
      return WindowSelection.getExact(win);
    };
  });

  return getSelection().map(function (sel) {
    const modStart = descendOnce(sel.start(), sel.soffset());
    const modFinish = descendOnce(sel.finish(), sel.foffset());
    return Selection.range(modStart.element(), modStart.offset(), modFinish.element(), modFinish.offset());
  });
};

const placement = function (component, posInfo, anchorInfo, origin) {
  const win = Traverse.defaultView(anchorInfo.root()).dom();
  const rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

  const selectionBox = getAnchorSelection(win, anchorInfo).bind(function (sel) {
    // This represents the *visual* rectangle of the selection.
    const optRect = WindowSelection.getFirstRect(win, Selection.exactFromRange(sel)).orThunk(function () {
      const x = Element.fromText(Unicode.zeroWidth());
      Insert.before(sel.start(), x);
      // Certain things like <p><br/></p> with (p, 0) or <br>) as collapsed selection do not return a client rectangle
      return WindowSelection.getFirstRect(win, Selection.exact(x, 0, x, 1)).map(function (rect) {
        Remove.remove(x);
        return rect;
      });
    });
    return optRect.map(function (rawRect) {
      // NOTE: We are going to have to do some interesting things to make inline toolbars not appear over the toolbar.
      const point = CssPosition.screen(
        Position(
          Math.max(0, rawRect.left()),
          Math.max(0, rawRect.top())
        )
      );

      return Boxes.pointed(point, rawRect.width(), rawRect.height());
    });
  });

  return selectionBox.map(function (box) {
    const points = [ rootPoint, box.point() ];
    const topLeft = Origins.cata(origin,
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

    const anchorBox = Boxes.rect(
      topLeft.left(),
      topLeft.top(),
      box.width(),
      box.height()
    );

    const targetElement = getAnchorSelection(win, anchorInfo).bind(function (sel) {
      return Node.isElement(sel.start()) ? Option.some(sel.start()) : Traverse.parent(sel.start());
    });

    const layoutsLtr = function () {
      return anchorInfo.showAbove() ?
        [ Layout.northeast, Layout.northwest, Layout.southeast, Layout.southwest, Layout.northmiddle, Layout.southmiddle ] :
        [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.southmiddle, Layout.northmiddle ];
    };

    const layoutsRtl = function () {
      return anchorInfo.showAbove() ?
        [ Layout.northwest, Layout.northeast, Layout.southwest, Layout.southeast, Layout.northmiddle, Layout.southmiddle ] :
        [ Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.southmiddle, Layout.northmiddle ];
    };

    const getLayouts = Direction.onDirection(layoutsLtr(), layoutsRtl());
    const layouts = targetElement.map(getLayouts).getOrThunk(layoutsLtr);

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