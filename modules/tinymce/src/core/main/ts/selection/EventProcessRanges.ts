import { Arr } from '@ephox/katamari';

import Editor from '../api/Editor';

const processRanges = (editor: Editor, ranges: Range[]): Range[] => Arr.map(ranges, (range) => {
  const evt = editor.dispatch('GetSelectionRange', { range });
  return evt.range !== range ? evt.range : range;
});

export {
  processRanges
};
