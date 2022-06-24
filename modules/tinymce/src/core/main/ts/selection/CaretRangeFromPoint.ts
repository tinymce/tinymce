import { SugarElement, Traverse, WindowSelection } from '@ephox/sugar';

const fromPoint = (clientX: number, clientY: number, doc: Document): Range | undefined => {
  const win = Traverse.defaultView(SugarElement.fromDom(doc));
  return WindowSelection.getAtPoint(win.dom, clientX, clientY).map((simRange) => {
    const rng = doc.createRange();
    rng.setStart(simRange.start.dom, simRange.soffset);
    rng.setEnd(simRange.finish.dom, simRange.foffset);
    return rng;
  }).getOrUndefined();
};

export {
  fromPoint
};
