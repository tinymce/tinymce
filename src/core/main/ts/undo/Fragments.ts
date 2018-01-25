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

/**
 * This module reads and applies html fragments from/to dom nodes.
 *
 * @class tinymce.undo.Fragments
 * @private
 */

const getOuterHtml = function (elm) {
  if (elm.nodeType === 1) {
    return elm.outerHTML;
  } else if (elm.nodeType === 3) {
    return Entities.encodeRaw(elm.data, false);
  } else if (elm.nodeType === 8) {
    return '<!--' + elm.data + '-->';
  }

  return '';
};

const createFragment = function (html) {
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

const insertAt = function (elm, html, index) {
  const fragment = createFragment(html);
  if (elm.hasChildNodes() && index < elm.childNodes.length) {
    const target = elm.childNodes[index];
    target.parentNode.insertBefore(fragment, target);
  } else {
    elm.appendChild(fragment);
  }
};

const removeAt = function (elm, index) {
  if (elm.hasChildNodes() && index < elm.childNodes.length) {
    const target = elm.childNodes[index];
    target.parentNode.removeChild(target);
  }
};

const applyDiff = function (diff, elm) {
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

const read = function (elm) {
  return Arr.filter(Arr.map(elm.childNodes, getOuterHtml), function (item) {
    return item.length > 0;
  });
};

const write = function (fragments, elm) {
  const currentFragments = Arr.map(elm.childNodes, getOuterHtml);
  applyDiff(Diff.diff(currentFragments, fragments), elm);
  return elm;
};

export default {
  read,
  write
};