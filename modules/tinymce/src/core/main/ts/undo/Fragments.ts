/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, DocumentFragment, Element, Node } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import Entities from '../api/html/Entities';
import * as NodeType from '../dom/NodeType';
import * as Diff from './Diff';

/**
 * This module reads and applies html fragments from/to dom nodes.
 *
 * @class tinymce.undo.Fragments
 * @private
 */

const getOuterHtml = function (elm: Node): string {
  if (NodeType.isElement(elm)) {
    return elm.outerHTML;
  } else if (NodeType.isText(elm)) {
    return Entities.encodeRaw(elm.data, false);
  } else if (NodeType.isComment(elm)) {
    return '<!--' + elm.data + '-->';
  }

  return '';
};

const createFragment = function (html: string): DocumentFragment {
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

const insertAt = function (elm: Element, html: string, index: number) {
  const fragment = createFragment(html);
  if (elm.hasChildNodes() && index < elm.childNodes.length) {
    const target = elm.childNodes[index];
    target.parentNode.insertBefore(fragment, target);
  } else {
    elm.appendChild(fragment);
  }
};

const removeAt = function (elm: Element, index: number) {
  if (elm.hasChildNodes() && index < elm.childNodes.length) {
    const target = elm.childNodes[index];
    target.parentNode.removeChild(target);
  }
};

const applyDiff = function (diff, elm: Element) {
  let index = 0;
  Arr.each(diff, function (action) {
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

const read = function (elm: Element): string[] {
  return Arr.filter(Arr.map(Arr.from(elm.childNodes), getOuterHtml), function (item) {
    return item.length > 0;
  });
};

const write = function (fragments: string[], elm: Element): Element {
  const currentFragments = Arr.map(Arr.from(elm.childNodes), getOuterHtml);
  applyDiff(Diff.diff(currentFragments, fragments), elm);
  return elm;
};

export {
  read,
  write
};
