import { FieldSchema } from '@ephox/boulder';
import { Arr, Optional, Unicode } from '@ephox/katamari';
import { Insert, Remove, SimRange, SimSelection, SugarElement, SugarNode, Traverse, WindowSelection } from '@ephox/sugar';

import * as Descend from '../../alien/Descend';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Origins from '../layout/Origins';
import { Anchoring, SelectionAnchor } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';
import * as ContainerOffsets from './ContainerOffsets';
import * as ContentAnchorCommon from './ContentAnchorCommon';

// A range from (a, 1) to (body, end) was giving the wrong bounds.
const descendOnce = (element: SugarElement<Node>, offset: number): Descend.ElementAndOffset<Node> =>
  SugarNode.isText(element) ? Descend.point(element, offset) : Descend.descendOnce(element, offset);

const isSimRange = (detail: SimRange | SugarElement<Node>[]): detail is SimRange =>
  (detail as SimRange).start !== undefined;

const getAnchorSelection = (win: Window, anchorInfo: SelectionAnchor): Optional<SimRange | SugarElement<HTMLTableCellElement>[]> => {
  // FIX TEST Test both providing a getSelection and not providing a getSelection
  const getSelection = anchorInfo.getSelection.getOrThunk(() => () => WindowSelection.getExact(win));

  return getSelection().map((sel) => {
    if (isSimRange(sel)) {
      const modStart = descendOnce(sel.start, sel.soffset);
      const modFinish = descendOnce(sel.finish, sel.foffset);
      return SimSelection.range(modStart.element, modStart.offset, modFinish.element, modFinish.offset);
    }

    return sel;
  });
};

const placement = (component: AlloyComponent, anchorInfo: SelectionAnchor, origin: Origins.OriginAdt): Optional<Anchoring> => {
  const win: Window = Traverse.defaultView(anchorInfo.root).dom;
  const rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

  const selectionBox = getAnchorSelection(win, anchorInfo).bind((sel) => {
    // This represents the *visual* rectangle of the selection.
    if (isSimRange(sel)) {
      const optRect = WindowSelection.getBounds(win, SimSelection.exactFromRange(sel)).orThunk(() => {
        const x = SugarElement.fromText(Unicode.zeroWidth);
        Insert.before(sel.start, x);
        // Certain things like <p><br/></p> with (p, 0) or <br>) as collapsed selection do not return a client rectangle
        const rect = WindowSelection.getFirstRect(win, SimSelection.exact(x, 0, x, 1));
        Remove.remove(x);
        return rect;
      });

      return optRect.bind((rawRect) => {
        return ContentAnchorCommon.getBox(rawRect.left, rawRect.top, rawRect.width, rawRect.height);
      });
    } else {
      const selectionRects = sel.map((x) => x.dom.getBoundingClientRect());

      const bounds = Arr.foldl(selectionRects, (acc, rect) => {
        return {
          left: Math.min(acc.left, rect.left),
          right: Math.max(acc.right, rect.right),
          top: Math.min(acc.top, rect.top),
          bottom: Math.max(acc.bottom, rect.bottom)
        };
      },
      {
        left: Number.MAX_VALUE,
        right: Number.MIN_VALUE,
        top: Number.MAX_VALUE,
        bottom: Number.MIN_VALUE
      });

      return ContentAnchorCommon.getBox(bounds.left, bounds.top, bounds.right - bounds.left, bounds.bottom - bounds.top);
    }
  });

  const targetElement = getAnchorSelection(win, anchorInfo)
    .bind((sel) => {
      if (isSimRange(sel)) {
        return SugarNode.isElement(sel.start) ? Optional.some(sel.start) : Traverse.parentElement(sel.start);
      }

      return Arr.head(sel);
    });
  const elem = targetElement.getOr(component.element);

  return ContentAnchorCommon.calcNewAnchor(selectionBox, rootPoint, anchorInfo, origin, elem);
};

export default [
  FieldSchema.option('getSelection'),
  FieldSchema.required('root'),
  FieldSchema.option('bubble'),
  AnchorLayouts.schema(),
  FieldSchema.defaulted('overrides', { }),
  FieldSchema.defaulted('showAbove', false),
  Fields.output('placement', placement)
];
