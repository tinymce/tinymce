import { Keyboard } from '@ephox/agar';
import { Arr, Fun, Optional } from '@ephox/katamari';
import { SugarElement, SugarNode, Traverse } from '@ephox/sugar';

const isText = (node: Node): node is Text => SugarNode.isText(SugarElement.fromDom(node));

const insertCharAtRange = (rng: Range, chr: string, doc: Document): Range => {
  const outRng = rng.cloneRange();
  const sc = rng.startContainer;
  const so = rng.startOffset;

  if (isText(sc)) {
    sc.insertData(so, chr);
    outRng.setStart(sc, so + 1);
    outRng.setEnd(sc, so + 1);
  } else {
    const textNode = doc.createTextNode(chr);

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

const insertCharAtSelection = (doc: SugarElement<Document>, chr: string): void => {
  const win = Traverse.defaultView(doc);
  const sel = Optional.from(win.dom.getSelection()).getOrDie('No window selection available');

  if (sel.rangeCount >= 1) {
    const rng = sel.getRangeAt(0);
    const newRange = insertCharAtRange(rng, chr, doc.dom);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    throw new Error('Cannot type at an non existing range selection');
  }
};

const typeChar = (doc: SugarElement<Document>, chr: string): void => {
  // TODO: Make this respect preventDefault on each keydown/keypress
  Keyboard.activeKeydown(doc, chr.charCodeAt(0), { });
  Keyboard.activeKeypress(doc, chr.charCodeAt(0), { });
  insertCharAtSelection(doc, chr);
  Keyboard.activeKeyup(doc, chr.charCodeAt(0), { });
};

const typeContentAtSelection = (doc: SugarElement<Document>, text: string): void => {
  Arr.map(text.split(''), Fun.curry(typeChar, doc));
};

export {
  typeContentAtSelection
};
