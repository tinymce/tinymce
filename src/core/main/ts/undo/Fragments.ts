/**
 * Fragments.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Entities from '../api/html/Entities';
import Diff from './Diff';
import Arr from '../util/Arr';
import NodeType from 'tinymce/core/dom/NodeType';

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
  let frag, node, container;

  container = document.createElement('div');
  frag = document.createDocumentFragment();

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
  return Arr.filter(Arr.map(elm.childNodes, getOuterHtml), function (item) {
    return item.length > 0;
  });
};

const write = function (fragments: string[], elm: Element): Element {
  const currentFragments = Arr.map(elm.childNodes, getOuterHtml);
  applyDiff(Diff.diff(currentFragments, fragments), elm);
  return elm;
};

export default {
  read,
  write
};