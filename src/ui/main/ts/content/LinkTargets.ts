/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Id } from '@ephox/katamari';
import { Element, SelectorFilter } from '@ephox/sugar';
import Tools from 'tinymce/core/api/util/Tools';

/**
 * This module is enables you to get anything that you can link to in a element.
 *
 * @private
 * @class tinymce.ui.LinkTargets
 */

const trim = Tools.trim;
const hasContentEditableState = function (value) {
  return function (node) {
    if (node && node.nodeType === 1) {
      if (node.contentEditable === value) {
        return true;
      }

      if (node.getAttribute('data-mce-contenteditable') === value) {
        return true;
      }
    }

    return false;
  };
};

const isContentEditableTrue = hasContentEditableState('true');
const isContentEditableFalse = hasContentEditableState('false');

const create = function (type, title, url, level, attach) {
  return {
    type,
    title,
    url,
    level,
    attach
  };
};

const isChildOfContentEditableTrue = function (node) {
  while ((node = node.parentNode)) {
    const value = node.contentEditable;
    if (value && value !== 'inherit') {
      return isContentEditableTrue(node);
    }
  }

  return false;
};

const select = function (selector, root) {
  return Arr.map(SelectorFilter.descendants(Element.fromDom(root), selector), function (element) {
    return element.dom();
  });
};

const getElementText = function (elm) {
  return elm.innerText || elm.textContent;
};

const getOrGenerateId = function (elm) {
  return elm.id ? elm.id : Id.generate('h');
};

const isAnchor = function (elm) {
  return elm && elm.nodeName === 'A' && (elm.id || elm.name);
};

const isValidAnchor = function (elm) {
  return isAnchor(elm) && isEditable(elm);
};

const isHeader = function (elm) {
  return elm && /^(H[1-6])$/.test(elm.nodeName);
};

const isEditable = function (elm) {
  return isChildOfContentEditableTrue(elm) && !isContentEditableFalse(elm);
};

const isValidHeader = function (elm) {
  return isHeader(elm) && isEditable(elm);
};

const getLevel = function (elm) {
  return isHeader(elm) ? parseInt(elm.nodeName.substr(1), 10) : 0;
};

const headerTarget = function (elm) {
  const headerId = getOrGenerateId(elm);

  const attach = function () {
    elm.id = headerId;
  };

  return create('header', getElementText(elm), '#' + headerId, getLevel(elm), attach);
};

const anchorTarget = function (elm) {
  const anchorId = elm.id || elm.name;
  const anchorText = getElementText(elm);

  return create('anchor', anchorText ? anchorText : '#' + anchorId, '#' + anchorId, 0, Fun.noop);
};

const getHeaderTargets = function (elms) {
  return Arr.map(Arr.filter(elms, isValidHeader), headerTarget);
};

const getAnchorTargets = function (elms) {
  return Arr.map(Arr.filter(elms, isValidAnchor), anchorTarget);
};

const getTargetElements = function (elm) {
  const elms = select('h1,h2,h3,h4,h5,h6,a:not([href])', elm);
  return elms;
};

const hasTitle = function (target) {
  return trim(target.title).length > 0;
};

const find = function (elm) {
  const elms = getTargetElements(elm);
  return Arr.filter(getHeaderTargets(elms).concat(getAnchorTargets(elms)), hasTitle);
};

export default {
  find
};