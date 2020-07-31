import { FieldSchema } from '@ephox/boulder';
import { Optional, Unicode } from '@ephox/katamari';
import { Insert, Remove, SimRange, SimSelection, SugarElement, SugarNode, Traverse, WindowSelection } from '@ephox/sugar';

import * as Descend from '../../alien/Descend';
import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Origins from '../layout/Origins';
import { Anchoring, SelectionAnchor } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';
import * as ContainerOffsets from './ContainerOffsets';
import * as ContentAnchorCommon from './ContentAnchorCommon';

// TODO: This structure exists in a few places
export interface ElementAndOffset<T> {
  readonly element: SugarElement<T>;
  readonly offset: number;
}

const point = <T> (element: SugarElement, offset: number): ElementAndOffset<T> => ({
  element,
  offset
});

// TODO: remove "any"
// A range from (a, 1) to (body, end) was giving the wrong bounds.
const descendOnce = (element: SugarElement, offset: number): ElementAndOffset<any> =>
  SugarNode.isText(element) ? point(element, offset) : Descend.descendOnce(element, offset);

const getAnchorSelection = (win: Window, anchorInfo: SelectionAnchor): Optional<SimRange> => {
  // FIX TEST Test both providing a getSelection and not providing a getSelection
  const getSelection = anchorInfo.getSelection.getOrThunk(() => () => WindowSelection.getExact(win));

  return getSelection().map((sel) => {
    const modStart = descendOnce(sel.start, sel.soffset);
    const modFinish = descendOnce(sel.finish, sel.foffset);
    return SimSelection.range(modStart.element, modStart.offset, modFinish.element, modFinish.offset);
  });
};

const placement = (component: AlloyComponent, anchorInfo: SelectionAnchor, origin: Origins.OriginAdt): Optional<Anchoring> => {
  const win: Window = Traverse.defaultView(anchorInfo.root).dom;
  const rootPoint = ContainerOffsets.getRootPoint(component, origin, anchorInfo);

  const selectionBox = getAnchorSelection(win, anchorInfo).bind((sel) => {
    // This represents the *visual* rectangle of the selection.
    const optRect = WindowSelection.getFirstRect(win, SimSelection.exactFromRange(sel)).orThunk(() => {
      const x = SugarElement.fromText(Unicode.zeroWidth);
      Insert.before(sel.start, x);
      // Certain things like <p><br/></p> with (p, 0) or <br>) as collapsed selection do not return a client rectangle
      return WindowSelection.getFirstRect(win, SimSelection.exact(x, 0, x, 1)).map((rect) => {
        Remove.remove(x);
        return rect;
      });
    });
    return optRect.bind((rawRect) => ContentAnchorCommon.capRect(rawRect.left, rawRect.top, rawRect.width, rawRect.height));
  });

  const targetElement: Optional<SugarElement> = getAnchorSelection(win, anchorInfo)
    .bind((sel) => SugarNode.isElement(sel.start) ? Optional.some<SugarElement<Node>>(sel.start) : Traverse.parentNode(sel.start));
  const elem = targetElement.getOr(component.element);

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
