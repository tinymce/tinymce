import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const isText = (node: Node): node is Text => node.nodeType === 3;
const isElement = (node: Node): node is Element => node.nodeType === 1;

const charCodeToKeyCode = (charCode: number): number => {
  const lookup: Record<string, number> = {
    '0': 48, '1': 49, '2': 50, '3': 51, '4': 52, '5': 53, '6': 54, '7': 55, '8': 56, '9': 57, 'a': 65, 'b': 66, 'c': 67,
    'd': 68, 'e': 69, 'f': 70, 'g': 71, 'h': 72, 'i': 73, 'j': 74, 'k': 75, 'l': 76, 'm': 77, 'n': 78, 'o': 79, 'p': 80, 'q': 81,
    'r': 82, 's': 83, 't': 84, 'u': 85, 'v': 86, 'w': 87, 'x': 88, 'y': 89, ' ': 32, ',': 188, '-': 189, '.': 190, '/': 191,
    '\\': 220, '[': 219, ']': 221, '\'': 222, ';': 186, '=': 187, ')': 41
  };

  return lookup[String.fromCharCode(charCode)];
};

const type = (editor: Editor, chr: string | number | Record<string, number | string | boolean>): void => {
  let keyCode: number | undefined;
  let charCode: number | undefined;
  let evt: Record<string, any> | undefined;
  let offset: number;

  const fakeEvent = (target: Node, type: string, evt: Record<string, any>) => {
    editor.dom.dispatch(target, type, evt);
  };

  // Numeric keyCode
  if (Type.isNumber(chr)) {
    charCode = chr;
    keyCode = charCodeToKeyCode(charCode);
  } else if (Type.isString(chr)) {
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

  const startElm = editor.selection.getStart();
  fakeEvent(startElm, 'keydown', evt);
  fakeEvent(startElm, 'keypress', evt);

  if (!evt.isDefaultPrevented()) {
    if (keyCode === 8) {
      const rng = editor.selection.getRng();

      if (rng.collapsed) {
        const startContainer = rng.startContainer;
        if (isElement(startContainer)) {
          const nodes = startContainer.childNodes;
          const lastNode = nodes[nodes.length - 1];

          // If caret is at <p>abc|</p> and after the abc text node then move it to the end of the text node
          // Expand the range to include the last char <p>ab[c]</p> since IE 11 doesn't delete otherwise
          if (rng.startOffset >= nodes.length - 1 && lastNode && isText(lastNode) && lastNode.data.length > 0) {
            rng.setStart(lastNode, lastNode.data.length - 1);
            rng.setEnd(lastNode, lastNode.data.length);
            editor.selection.setRng(rng);
          }
        } else if (isText(startContainer)) {
          // If caret is at <p>abc|</p> and after the abc text node then move it to the end of the text node
          // Expand the range to include the last char <p>ab[c]</p> since IE 11 doesn't delete otherwise
          offset = rng.startOffset;
          if (offset > 0) {
            rng.setStart(startContainer, offset - 1);
            rng.setEnd(startContainer, offset);
            editor.selection.setRng(rng);
          }
        }
      }

      editor.getDoc().execCommand('Delete');
    } else if (Type.isString(chr)) {
      const rng = editor.selection.getRng();

      if (isText(rng.startContainer) && rng.collapsed) {
        rng.startContainer.insertData(rng.startOffset, chr);
        rng.setStart(rng.startContainer, rng.startOffset + 1);
        rng.collapse(true);
        editor.selection.setRng(rng);
      } else {
        rng.deleteContents();
        rng.insertNode(editor.getDoc().createTextNode(chr));
      }
    }
  }

  fakeEvent(startElm, 'keyup', evt);
};

export {
  type
};
