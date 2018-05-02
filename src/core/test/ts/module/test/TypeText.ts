import { GeneralSteps, Keyboard, Step } from '@ephox/agar';
import { Arr, Fun } from '@ephox/katamari';
import { document } from '@ephox/dom-globals';

const insertCharAtRange = function (rng, chr) {
  const outRng = rng.cloneRange();
  const sc = rng.startContainer, so = rng.startOffset;

  if (sc.nodeType === 3) {
    sc.insertData(so, chr);
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

const insertCharAtSelection = function (doc, chr) {
  const sel = doc.defaultView.getSelection();

  if (sel.rangeCount >= 1) {
    const rng = sel.getRangeAt(0);
    const newRange = insertCharAtRange(rng, chr);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    throw new Error('Can not type at an non existing range selection');
  }
};

const sInsertCharAtSelection = function (doc, chr) {
  return Step.sync(function () {
    insertCharAtSelection(doc.dom(), chr);
  });
};

const sTypeChar = function (doc, chr) {
  return GeneralSteps.sequence([
    Keyboard.sKeydown(doc, chr, {}),
    Keyboard.sKeypress(doc, chr, {}),
    sInsertCharAtSelection(doc, chr),
    Keyboard.sKeyup(doc, chr, {})
  ]);
};

const sTypeContentAtSelection = function (doc, text) {
  return GeneralSteps.sequence(Arr.map(text.split(''), Fun.curry(sTypeChar, doc)));
};

export default {
  sTypeContentAtSelection
};