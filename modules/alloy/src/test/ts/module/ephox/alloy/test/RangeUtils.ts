import { Cursors } from '@ephox/agar';
import { Traverse } from '@ephox/sugar';

const toDomRange = (cursorRange: Cursors.CursorRange): Range => {
  const doc = Traverse.owner(cursorRange.start);
  const range = doc.dom.createRange();
  range.setStart(cursorRange.start.dom, cursorRange.soffset);
  range.setEnd(cursorRange.finish.dom, cursorRange.foffset);
  return range;
};

export {
  toDomRange
};
