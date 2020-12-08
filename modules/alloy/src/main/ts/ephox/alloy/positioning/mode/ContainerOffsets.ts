import { Optional } from '@ephox/katamari';
import { Compare, Scroll, SugarElement, SugarLocation, SugarPosition, Traverse } from '@ephox/sugar';

import * as CssPosition from '../../alien/CssPosition';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { OriginAdt } from '../layout/Origins';
import { NodeAnchor, SelectionAnchor } from './Anchoring';

// In one mode, the window is inside an iframe. If that iframe is in the
// same document as the positioning element (component), then identify the offset
// difference between the iframe and the component.
const getOffset = <I extends SelectionAnchor | NodeAnchor>(component: AlloyComponent, origin: OriginAdt, anchorInfo: I): Optional<SugarPosition> => {
  const win = Traverse.defaultView(anchorInfo.root).dom;

  const hasSameOwner = (frame: SugarElement<HTMLFrameElement>) => {
    const frameOwner = Traverse.owner(frame);
    const compOwner = Traverse.owner(component.element);
    return Compare.eq(frameOwner, compOwner);
  };

  return Optional.from(win.frameElement as HTMLFrameElement).map(SugarElement.fromDom)
    .filter(hasSameOwner).map(SugarLocation.absolute);
};

const getRootPoint = <I extends SelectionAnchor | NodeAnchor>(component: AlloyComponent, origin: OriginAdt, anchorInfo: I): CssPosition.CssPositionAdt => {
  const doc = Traverse.owner(component.element);
  const outerScroll = Scroll.get(doc);

  const offset = getOffset(component, origin, anchorInfo).getOr(outerScroll);
  return CssPosition.absolute(offset, outerScroll.left, outerScroll.top);
};

export {
  getRootPoint
};
