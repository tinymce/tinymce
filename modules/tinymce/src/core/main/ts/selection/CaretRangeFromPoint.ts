import { WindowSelection } from '@ephox/sugar';

const fromPoint = (clientX: number, clientY: number, doc: Document): Range | undefined =>
  WindowSelection.getAtPoint(doc.defaultView, clientX, clientY).map((simRange) => {
    const rng = doc.createRange();
    rng.setStart(simRange.start.dom, simRange.soffset);
    rng.setEnd(simRange.finish.dom, simRange.foffset);
    return rng;
  }).getOrUndefined();

export {
  fromPoint
};
