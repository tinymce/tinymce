import { Arr, Fun, Obj, Type, Unicode } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const isText = (node: Node): node is Text => node.nodeType === 3;

const charCodeToKeyCode = (charCode: number): number => {
  const lookup: Record<string, number> = {
    '0': 48, '1': 49, '2': 50, '3': 51, '4': 52, '5': 53, '6': 54, '7': 55, '8': 56, '9': 57, 'a': 65, 'b': 66, 'c': 67,
    'd': 68, 'e': 69, 'f': 70, 'g': 71, 'h': 72, 'i': 73, 'j': 74, 'k': 75, 'l': 76, 'm': 77, 'n': 78, 'o': 79, 'p': 80,
    'q': 81, 'r': 82, 's': 83, 't': 84, 'u': 85, 'v': 86, 'w': 87, 'x': 88, 'y': 89, 'z': 90, ' ': 32, ',': 188, '-': 189,
    '.': 190, '/': 191, '\\': 220, '[': 219, ']': 221, '{': 219, '}': 221, '\'': 222, ';': 186, '=': 187, '(': 57, ')': 48
  };

  return Obj.get(lookup, String.fromCharCode(charCode)).getOr(charCode);
};

const needsShiftModifier = (charCode: number | undefined): boolean => {
  const lookup: Record<string, boolean> = {
    '(': true, ')': true, '{': true, '}': true, '+': true, '_': true, ':': true, '"': true,
    '<': true, '>': true, '?': true, '!': true, '@': true, '#': true, '$': true, '%': true,
    '^': true, '&': true, '*': true, '|': true
  };

  return Type.isNumber(charCode) && Obj.has(lookup, String.fromCharCode(charCode));
};

const needsNbsp = (rng: Range, chr: string): boolean => {
  const container = rng.startContainer;
  const offset = rng.startOffset;

  if (chr === ' ' && isText(container)) {
    if (container.data[offset - 1] === ' ' || offset === container.data.length) {
      return true;
    }
  }

  return false;
};

const type = (editor: Editor, chr: string | number | Record<string, number | string | boolean>): void => {
  let keyCode: number | undefined;
  let charCode: number | undefined;
  let evt: Record<string, any> | undefined;
  let offset: number;

  const fakeEvent = (type: string, evt: Record<string, any>) => {
    return editor.dispatch(type, evt);
  };

  // Numeric keyCode
  if (typeof chr === 'number') {
    charCode = chr;
    keyCode = charCodeToKeyCode(charCode);
  } else if (typeof chr === 'string') {
    // String value
    if (chr === '\b') {
      keyCode = 8;
      charCode = chr.charCodeAt(0);
    } else if (chr === '\n') {
      keyCode = 13;
      charCode = chr.charCodeAt(0);
    } else {
      charCode = chr.charCodeAt(0);
      keyCode = charCodeToKeyCode(charCode);
    }
  } else {
    evt = chr;

    if (evt.charCode) {
      chr = String.fromCharCode(evt.charCode);
    }

    if (evt.keyCode) {
      keyCode = evt.keyCode;
    }
  }

  evt = evt || { keyCode, charCode };

  if (needsShiftModifier(charCode)) {
    evt.shiftKey = true;
  }

  const keydownEvent = fakeEvent('keydown', evt);
  if (keydownEvent.isDefaultPrevented()) {
    return;
  }

  const keypressEvent = fakeEvent('keypress', { ...evt, keyCode: evt.charCode });
  if (keypressEvent.isDefaultPrevented()) {
    return;
  }

  if (keyCode === 8) {
    const selection: any = (editor.getDoc() as any).selection;
    if (selection) {
      const legacyRng: any = selection.createRange();

      if (legacyRng.text.length === 0) {
        legacyRng.moveStart('character', -1);
        legacyRng.select();
      }

      legacyRng.execCommand('Delete', false, null);
    } else {
      const rng = editor.selection.getRng();

      if (rng.collapsed) {
        if (rng.startContainer.nodeType === 1) {
          const nodes = rng.startContainer.childNodes;
          const lastNode = nodes[nodes.length - 1];

          // If caret is at <p>abc|</p> and after the abc text node then move it to the end of the text node
          // Expand the range to include the last char <p>ab[c]</p> since IE 11 doesn't delete otherwise
          if (rng.startOffset >= nodes.length - 1 && lastNode && isText(lastNode) && lastNode.data.length > 0) {
            rng.setStart(lastNode, lastNode.data.length - 1);
            rng.setEnd(lastNode, lastNode.data.length);
            editor.selection.setRng(rng);
          }
        } else if (rng.startContainer.nodeType === 3) {
          // If caret is at <p>abc|</p> and after the abc text node then move it to the end of the text node
          // Expand the range to include the last char <p>ab[c]</p> since IE 11 doesn't delete otherwise
          offset = rng.startOffset;
          if (offset > 0) {
            rng.setStart(rng.startContainer, offset - 1);
            rng.setEnd(rng.startContainer, offset);
            editor.selection.setRng(rng);
          }
        }
      }

      editor.getDoc().execCommand('Delete');
    }
  } else if (typeof chr === 'string') {
    const rng = editor.selection.getRng();

    if (isText(rng.startContainer) && rng.collapsed) {
      rng.startContainer.insertData(rng.startOffset, needsNbsp(rng, chr) ? Unicode.nbsp : chr);
      rng.setStart(rng.startContainer, rng.startOffset + 1);
      rng.collapse(true);
      editor.selection.setRng(rng);
    } else {
      rng.deleteContents();
      rng.insertNode(editor.getDoc().createTextNode(chr));
    }
  }

  fakeEvent('keyup', evt);
};

const typeString = (editor: Editor, str: string): void => {
  Arr.each(str.split(''), Fun.curry(type, editor));
};

export {
  type,
  typeString
};
