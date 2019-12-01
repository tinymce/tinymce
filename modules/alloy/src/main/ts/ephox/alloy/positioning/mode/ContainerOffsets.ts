import { HTMLFrameElement } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Compare, Element, Location, Position, Scroll, Traverse } from '@ephox/sugar';

import * as CssPosition from '../../alien/CssPosition';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { OriginAdt } from '../layout/Origins';
import { NodeAnchor, SelectionAnchor } from './Anchoring';

// In one mode, the window is inside an iframe. If that iframe is in the
// same document as the positioning element (component), then identify the offset
// difference between the iframe and the component.
const getOffset = <I extends SelectionAnchor | NodeAnchor>(component: AlloyComponent, origin: OriginAdt, anchorInfo: I): Option<Position> => {
  const win = Traverse.defaultView(anchorInfo.root).dom();

  const hasSameOwner = (frame: Element<HTMLFrameElement>) => {
    const frameOwner = Traverse.owner(frame);
    const compOwner = Traverse.owner(component.element());
    return Compare.eq(frameOwner, compOwner);
  };

  return Option.from(win.frameElement as HTMLFrameElement).map(Element.fromDom).
    filter(hasSameOwner).map(Location.absolute);
};

const getRootPoint = <I extends SelectionAnchor | NodeAnchor>(component: AlloyComponent, origin: OriginAdt, anchorInfo: I): CssPosition.CssPositionAdt => {
  const doc = Traverse.owner(component.element());
  const outerScroll = Scroll.get(doc);

  const offset = getOffset(component, origin, anchorInfo).getOr(outerScroll);
  return CssPosition.absolute(offset, outerScroll.left(), outerScroll.top());
};

export {
  getRootPoint
};
