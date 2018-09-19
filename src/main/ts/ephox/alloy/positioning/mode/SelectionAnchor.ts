import { FieldSchema } from '@ephox/boulder';
import { Fun, Option, Struct, Unicode } from '@ephox/katamari';
import { Direction, Element, Insert, Node, Position, Remove, Selection, Traverse, WindowSelection } from '@ephox/sugar';

import { Window } from '@ephox/dom-globals';

import * as Boxes from '../../alien/Boxes';
import * as CssPosition from '../../alien/CssPosition';
import * as Descend from '../../alien/Descend';
import * as Fields from '../../data/Fields';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { SelectionAnchor, nu as NuAnchor, Anchoring } from './Anchoring';
import * as ContainerOffsets from './ContainerOffsets';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { PositioningConfig } from '../../behaviour/positioning/PositioningTypes';
import { SugarRange } from '../../alien/TypeDefinitions';
import * as AnchorLayouts from './AnchorLayouts';

const point: (element: Element, offset: number) => {element: () => Element; offset: () => number; } = Struct.immutable('element', 'offset');

// A range from (a, 1) to (body, end) was giving the wrong bounds.
const descendOnce = (element, offset) => {
  return Node.isText(element) ? point(element, offset) : Descend.descendOnce(element, offset);
};

const getAnchorSelection = (win: Window, anchorInfo: SelectionAnchor): Option<SugarRange> => {
  // FIX TEST Test both providing a getSelection and not providing a getSelection
  const getSelection = anchorInfo.getSelection().getOrThunk(() => {
    return () => {
      return WindowSelection.getExact(win);
    };
  });

  return getSelection().map((sel) => {
    const modStart = descendOnce(sel.start(), sel.soffset());
    const modFinish = descendOnce(sel.finish(), sel.foffset());
    return Selection.range(modStart.element(), modStart.offset(), modFinish.element(), modFinish.offset());
  });
};

const placement = (component: AlloyComponent, posInfo: PositioningConfig, anchorInfo: SelectionAnchor, origin: Origins.OriginAdt): Option<Anchoring> => {
  const win: Window = Traverse.defaultView(anchorInfo.root()).dom();
  const rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

  const selectionBox = getAnchorSelection(win, anchorInfo).bind((sel) => {
    // This represents the *visual* rectangle of the selection.
    const optRect = WindowSelection.getFirstRect(win, Selection.exactFromRange(sel)).orThunk(() => {
      const x = Element.fromText(Unicode.zeroWidth());
      Insert.before(sel.start(), x);
      // Certain things like <p><br/></p> with (p, 0) or <br>) as collapsed selection do not return a client rectangle
      return WindowSelection.getFirstRect(win, Selection.exact(x, 0, x, 1)).map((rect) => {
        Remove.remove(x);
        return rect;
      });
    }) as Option<{ left: () => number, top: () => number, width: () => number, height: () => number}>;
    return optRect.map((rawRect) => {
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

  return selectionBox.map((box) => {
    const points = [ rootPoint, box.point() ];
    const topLeft = Origins.cata(origin,
      () => {
        return CssPosition.sumAsAbsolute(points);
      },
      () => {
        return CssPosition.sumAsAbsolute(points);
      },
      () => {
        return CssPosition.sumAsFixed(points);
      }
    );

    const anchorBox = Boxes.rect(
      topLeft.left(),
      topLeft.top(),
      box.width(),
      box.height()
    );

    const targetElement: Option<Element> = getAnchorSelection(win, anchorInfo).bind((sel) => {
      return Node.isElement(sel.start()) ? Option.some(sel.start()) : Traverse.parent(sel.start());
    });

    const layoutsLtr = (): Layout.AnchorLayout[] => {
      return anchorInfo.showAbove() ?
        [ Layout.northeast, Layout.northwest, Layout.southeast, Layout.southwest, Layout.north, Layout.south ] :
        [ Layout.southeast, Layout.southwest, Layout.northeast, Layout.northwest, Layout.south, Layout.south ];
    };

    const layoutsRtl = (): Layout.AnchorLayout[] => {
      return anchorInfo.showAbove() ?
        [ Layout.northwest, Layout.northeast, Layout.southwest, Layout.southeast, Layout.north, Layout.south ] :
        [ Layout.southwest, Layout.southeast, Layout.northwest, Layout.northeast, Layout.south, Layout.north ];
    };

    const elem = targetElement.getOr(component.element());
    const layouts = AnchorLayouts.get(elem, anchorInfo, layoutsLtr(), layoutsRtl());

    return NuAnchor({
      anchorBox: Fun.constant(anchorBox),
      bubble: Fun.constant(anchorInfo.bubble().getOr(Bubble.fallback())),
      overrides: anchorInfo.overrides,
      layouts: Fun.constant(layouts),
      placer: Option.none
    });
  });
};

export default [
  FieldSchema.option('getSelection'),
  FieldSchema.strict('root'),
  FieldSchema.option('bubble'),
  AnchorLayouts.schema(),
  // chiefly MaxHeight.expandable()
  FieldSchema.defaulted('overrides', { }),
  FieldSchema.defaulted('showAbove', false),
  Fields.output('placement', placement)
];