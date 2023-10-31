import { Arr, Fun } from '@ephox/katamari';

import Entities from '../api/html/Entities';
import * as NodeType from '../dom/NodeType';
import * as Zwsp from '../text/Zwsp';
import * as Diff from './Diff';

/**
 * This module reads and applies html fragments from/to dom nodes.
 *
 * @class tinymce.undo.Fragments
 * @private
 */

const getOuterHtml = (elm: Node): string => {
  if (NodeType.isElement(elm)) {
    return elm.outerHTML;
  } else if (NodeType.isText(elm)) {
    return Entities.encodeRaw(elm.data, false);
  } else if (NodeType.isComment(elm)) {
    return '<!--' + elm.data + '-->';
  }

  return '';
};

const createFragment = (html: string): DocumentFragment => {
  let node;

  const container = document.createElement('div');
  const frag = document.createDocumentFragment();

  if (html) {
    container.innerHTML = html;
  }

  while ((node = container.firstChild)) {
    frag.appendChild(node);
  }

  return frag;
};

const insertAt = (elm: Element, html: string, index: number) => {
  const fragment = createFragment(html);
  if (elm.hasChildNodes() && index < elm.childNodes.length) {
    const target = elm.childNodes[index];
    elm.insertBefore(fragment, target);
  } else {
    elm.appendChild(fragment);
  }
};

const removeAt = (elm: Element, index: number) => {
  if (elm.hasChildNodes() && index < elm.childNodes.length) {
    const target = elm.childNodes[index];
    elm.removeChild(target);
  }
};

const applyDiff = (diff: Diff.Diff<string>[], elm: Element) => {
  let index = 0;
  Arr.each(diff, (action) => {
    if (action[0] === Diff.KEEP) {
      index++;
    } else if (action[0] === Diff.INSERT) {
      insertAt(elm, action[1], index);
      index++;
    } else if (action[0] === Diff.DELETE) {
      removeAt(elm, index);
    }
  });
};

const read = (elm: Element, trimZwsp?: boolean): string[] =>
  Arr.filter(Arr.map(Arr.from(elm.childNodes), trimZwsp ? Fun.compose(Zwsp.trim, getOuterHtml) : getOuterHtml), (item) => {
    return item.length > 0;
  });

const write = (fragments: string[], elm: Element): Element => {
  const currentFragments = Arr.map(Arr.from(elm.childNodes), getOuterHtml);
  applyDiff(Diff.diff(currentFragments, fragments), elm);
  return elm;
};

export {
  read,
  write
};
