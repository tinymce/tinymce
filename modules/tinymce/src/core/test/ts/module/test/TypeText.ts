import { Keyboard, Step } from '@ephox/agar';
import { Arr, Fun } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

const insertCharAtRange = (rng: Range, chr: string): Range => {
  const outRng = rng.cloneRange();
  const sc = rng.startContainer, so = rng.startOffset;

  if (sc.nodeType === 3) {
    (sc as Text).insertData(so, chr);
    outRng.setStart(sc, so + 1);
    outRng.setEnd(sc, so + 1);
  } else {
    const textNode = document.createTextNode(chr);

    if (so === sc.childNodes.length) {
      sc.appendChild(textNode);
    } else {
      sc.insertBefore(textNode, sc.childNodes[so]);
    }

    outRng.setStart(textNode, 1);
    outRng.setEnd(textNode, 1);
  }

  return outRng;
};

const insertCharAtSelection = (doc: Document, chr: string): void => {
  const sel = doc.defaultView.getSelection();

  if (sel.rangeCount >= 1) {
    const rng = sel.getRangeAt(0);
    const newRange = insertCharAtRange(rng, chr);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    throw new Error('Cannot type at an non existing range selection');
  }
};

const typeChar = (doc: SugarElement<Document>, chr: string): void => {
  Keyboard.activeKeydown(doc, chr.charCodeAt(0), { });
  Keyboard.activeKeypress(doc, chr.charCodeAt(0), { });
  insertCharAtSelection(doc.dom, chr);
  Keyboard.activeKeyup(doc, chr.charCodeAt(0), { });
};

const typeContentAtSelection = (doc: SugarElement<Document>, text: string): void => {
  Arr.map(text.split(''), Fun.curry(typeChar, doc));
};

const sTypeContentAtSelection = <T>(doc: SugarElement<Document>, text: string): Step<T, T> => Step.sync(() => {
  typeContentAtSelection(doc, text);
});

export {
  typeContentAtSelection,
  sTypeContentAtSelection
};
