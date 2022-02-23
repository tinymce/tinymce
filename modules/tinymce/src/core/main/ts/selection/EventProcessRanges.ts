import { Arr } from '@ephox/katamari';

const processRanges = (editor, ranges: Range[]): Range[] => Arr.map(ranges, (range) => {
  const evt = editor.dispatch('GetSelectionRange', { range });
  return evt.range !== range ? evt.range : range;
});

export {
  processRanges
};
