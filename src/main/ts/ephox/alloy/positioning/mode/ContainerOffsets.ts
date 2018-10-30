import { Option } from '@ephox/katamari';
import { Compare, Element, Location, Scroll, Traverse } from '@ephox/sugar';

import * as CssPosition from '../../alien/CssPosition';
import { SugarPosition } from '../../alien/TypeDefinitions';
import { OriginAdt } from '../../positioning/layout/Origins';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SelectionAnchor, NodeAnchor } from '../../positioning/mode/Anchoring';

// In one mode, the window is inside an iframe. If that iframe is in the
// same document as the positioning element (component), then identify the offset
// difference between the iframe and the component.
const getOffset = <I extends SelectionAnchor | NodeAnchor>(component: AlloyComponent, origin: OriginAdt, anchorInfo: I): Option<SugarPosition> => {
  const win = Traverse.defaultView(anchorInfo.root).dom();

  const hasSameOwner = (frame) => {
    const frameOwner = Traverse.owner(frame);
    const compOwner = Traverse.owner(component.element());
    return Compare.eq(frameOwner, compOwner);
  };

  return Option.from(win.frameElement).map(Element.fromDom).
    filter(hasSameOwner).map(Location.absolute);
};

const getRootPoint = <I extends SelectionAnchor | NodeAnchor>(component: AlloyComponent, origin: OriginAdt, anchorInfo: I): CssPosition.CssPositionAdt => {
  const doc = Traverse.owner(component.element());
  const outerScroll: SugarPosition = Scroll.get(doc);

  const offset = getOffset(component, origin, anchorInfo).getOr(outerScroll);
  return CssPosition.absolute(offset, outerScroll.left(), outerScroll.top());
};

export {
  getRootPoint
};