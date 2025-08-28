import { Fun, Optional } from '@ephox/katamari';
import { DomEvent, Insert, SelectorFind, SugarElement } from '@ephox/sugar';

import * as DomSmartSelect from 'ephox/robin/api/dom/DomSmartSelect';

const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

const editor = SugarElement.fromHtml('<div contenteditable="true" style="width: 500px; height: 300px; border: 1px solid black;">' +
  'This is <span style="color: red;">som</span>eth<b>ing that you should</b> see.<img src="http://www.google.com/google.jpg">The<br>dog</div>');

Insert.append(ephoxUi, editor);

const select = (s: SugarElement, so: number, f: SugarElement, fo: number) => {
  Optional.from(window.getSelection()).each((selection) => {
    selection.removeAllRanges();
    const range = document.createRange();
    range.setStart(s.dom, so);
    range.setEnd(f.dom, fo);
    // eslint-disable-next-line no-console
    console.log('setting range: ', s.dom, so, f.dom, fo);
    selection.addRange(range);
  });
};

const getSelection = () => {
  return Optional.from(window.getSelection()).map((selection) => {
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // eslint-disable-next-line no-console
      console.log('range: ', range);
      return {
        startContainer: SugarElement.fromDom(range.startContainer),
        startOffset: range.startOffset,
        endContainer: SugarElement.fromDom(range.endContainer),
        endOffset: range.endOffset,
        collapsed: range.collapsed
      };
    } else {
      return null;
    }
  }).getOrNull();
};

DomEvent.bind(editor, 'click', (_event) => {
  const current = getSelection();
  if (current !== null && current.collapsed) {
    const wordRange = DomSmartSelect.word(current.startContainer, current.startOffset, Fun.never);
    wordRange.each((wr) => {
      select(wr.startContainer, wr.startOffset, wr.endContainer, wr.endOffset);
    });
  }
});
