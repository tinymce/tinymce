import { FieldSchema } from '@ephox/boulder';
import { Window } from '@ephox/dom-globals';
import { Option, Struct, Unicode } from '@ephox/katamari';
import { Element, Insert, Node, Remove, Selection, Traverse, WindowSelection } from '@ephox/sugar';

import * as Descend from '../../alien/Descend';
import { SugarRange } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Origins from '../layout/Origins';
import { SelectionAnchor, Anchoring } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';
import * as ContainerOffsets from './ContainerOffsets';
import ContentAnchorCommon from './ContentAnchorCommon';

const point: (element: Element, offset: number) => {element: () => Element; offset: () => number; } = Struct.immutable('element', 'offset');

// A range from (a, 1) to (body, end) was giving the wrong bounds.
const descendOnce = (element, offset) => {
  return Node.isText(element) ? point(element, offset) : Descend.descendOnce(element, offset);
};

const getAnchorSelection = (win: Window, anchorInfo: SelectionAnchor): Option<SugarRange> => {
  // FIX TEST Test both providing a getSelection and not providing a getSelection
  const getSelection = anchorInfo.getSelection.getOrThunk(() => {
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

const placement = (component: AlloyComponent, anchorInfo: SelectionAnchor, origin: Origins.OriginAdt): Option<Anchoring> => {
  const win: Window = Traverse.defaultView(anchorInfo.root).dom();
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
    return optRect.bind((rawRect) => {
      return ContentAnchorCommon.capRect(rawRect.left(), rawRect.top(), rawRect.width(), rawRect.height());
    });
  });

  const targetElement: Option<Element> = getAnchorSelection(win, anchorInfo).bind((sel) => {
    return Node.isElement(sel.start()) ? Option.some(sel.start()) : Traverse.parent(sel.start());
  });
  const elem = targetElement.getOr(component.element());

  return ContentAnchorCommon.calcNewAnchor(selectionBox, rootPoint, anchorInfo, origin, elem);
};

export default [
  FieldSchema.option('getSelection'),
  FieldSchema.strict('root'),
  FieldSchema.option('bubble'),
  AnchorLayouts.schema(),
  FieldSchema.defaulted('overrides', { }),
  FieldSchema.defaulted('showAbove', false),
  Fields.output('placement', placement)
];
