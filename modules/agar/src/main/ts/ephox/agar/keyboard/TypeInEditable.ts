import { Optional } from '@ephox/katamari';
import { Compare, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import * as Waiter from '../api/Waiter';

import * as Keycodes from './Keycodes';

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

const insertCharAtSelection = (el: SugarElement<HTMLElement>, chr: string): void => {
  const doc = Traverse.owner(el);
  const win = Traverse.defaultView(doc);
  const sel = Optional.from(win.dom.getSelection()).getOrDie('No window selection available');

  if (sel.rangeCount >= 1) {
    const rng = sel.getRangeAt(0);
    const commonAncestor = SugarElement.fromDom(rng.commonAncestorContainer);

    if (Compare.contains(el, commonAncestor) === false) {
      throw new Error('Cannot type at a range selection that is outside the element');
    }

    const newRange = insertCharAtRange(rng, chr, doc.dom);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    throw new Error('Cannot type at an non existing range selection');
  }
};

const typeCharInEditable = (el: SugarElement<HTMLElement>, chr: string) => {
  const rawInput = el.dom;
  const view = rawInput.ownerDocument.defaultView;

  const keydownEvent = Keycodes.getKeyEventFromData(view, 'keydown', chr).getOrDie(`Could not find keydown event for char: ${chr}`);
  if (!rawInput.dispatchEvent(keydownEvent)) {
    return;
  }

  const keypressEvent = Keycodes.getKeyEventFromData(view, 'keypress', chr).getOrDie(`Could not find keypress event for char: ${chr}`);
  if (!rawInput.dispatchEvent(keypressEvent)) {
    return;
  }

  if (!rawInput.dispatchEvent(new view.InputEvent('beforeinput', { inputType: 'insertText', data: chr, cancelable: true, bubbles: true }))) {
    return;
  }

  insertCharAtSelection(el, chr);

  rawInput.dispatchEvent(new view.InputEvent('input', { inputType: 'insertText', data: chr, cancelable: false, bubbles: true }));

  const keyupEvent = Keycodes.getKeyEventFromData(view, 'keyup', chr).getOrDie(`Could not find keyup event for char: ${chr}`);
  rawInput.dispatchEvent(keyupEvent);
};

export const pTypeInEditable = async (el: SugarElement<HTMLElement>, text: string, speed: number = 0): Promise<void> => {
  for (let i = 0; i < text.length; i++) {
    typeCharInEditable(el, text[i]);
    await (speed === 0 ? Promise.resolve() : Waiter.pWait(speed));
  }
};

