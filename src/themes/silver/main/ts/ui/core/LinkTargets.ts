/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Id } from '@ephox/katamari';
import { Element, SelectorFilter } from '@ephox/sugar';
import Tools from 'tinymce/core/api/util/Tools';
import { HTMLElement, HTMLAnchorElement, Node } from '@ephox/dom-globals';

/**
 * This module is enables you to get anything that you can link to in a element.
 *
 * @private
 * @class tinymce.ui.LinkTargets
 */

export type LinkTargetType = 'header' | 'anchor';

export interface LinkTarget {
  type: LinkTargetType;
  title: string;
  url: string;
  level: number;
  attach: any; // To allow popups we have to replace the function with a placeholder
}

const trim = Tools.trim;
const hasContentEditableState = function (value: string) {
  return function (node: Node) {
    if (node && node.nodeType === 1) {
      if ((<HTMLElement> node).contentEditable === value) {
        return true;
      }

      if ((<HTMLElement> node).getAttribute('data-mce-contenteditable') === value) {
        return true;
      }
    }

    return false;
  };
};

const isContentEditableTrue = hasContentEditableState('true');
const isContentEditableFalse = hasContentEditableState('false');

const create = function (type: LinkTargetType, title: string, url: string, level: number, attach: () => void): LinkTarget {
  return {
    type,
    title,
    url,
    level,
    attach
  };
};

const isChildOfContentEditableTrue = function (node: Node) {
  while ((node = node.parentNode)) {
    const value = (<HTMLElement> node).contentEditable;
    if (value && value !== 'inherit') {
      return isContentEditableTrue(node);
    }
  }

  return false;
};

const select = function (selector: string, root: HTMLElement) {
  return Arr.map(SelectorFilter.descendants(Element.fromDom(root), selector), function (element): HTMLElement {
    return element.dom();
  });
};

const getElementText = function (elm: HTMLElement) {
  return elm.innerText || elm.textContent;
};

const getOrGenerateId = function (elm: HTMLElement) {
  return elm.id ? elm.id : Id.generate('h');
};

const isAnchor = function (elm: HTMLElement) {
  return elm && elm.nodeName === 'A' && (elm.id || (<HTMLAnchorElement> elm).name) !== undefined;
};

const isValidAnchor = function (elm: HTMLElement) {
  return isAnchor(elm) && isEditable(elm);
};

const isHeader = function (elm: HTMLElement) {
  return elm && /^(H[1-6])$/.test(elm.nodeName);
};

const isEditable = function (elm: HTMLElement) {
  return isChildOfContentEditableTrue(elm) && !isContentEditableFalse(elm);
};

const isValidHeader = function (elm: HTMLElement) {
  return isHeader(elm) && isEditable(elm);
};

const getLevel = function (elm: HTMLElement) {
  return isHeader(elm) ? parseInt(elm.nodeName.substr(1), 10) : 0;
};

const headerTarget = function (elm: HTMLElement) {
  const headerId = getOrGenerateId(elm);

  const attach = function () {
    elm.id = headerId;
  };

  return create('header', getElementText(elm), '#' + headerId, getLevel(elm), attach);
};

const anchorTarget = function (elm: HTMLAnchorElement) {
  const anchorId = elm.id || elm.name;
  const anchorText = getElementText(elm);

  return create('anchor', anchorText ? anchorText : '#' + anchorId, '#' + anchorId, 0, Fun.noop);
};

const getHeaderTargets = function (elms: HTMLElement[]) {
  return Arr.map(Arr.filter(elms, isValidHeader), headerTarget);
};

const getAnchorTargets = function (elms: HTMLElement[]) {
  return Arr.map(Arr.filter(elms, isValidAnchor), anchorTarget);
};

const getTargetElements = function (elm: HTMLElement) {
  const elms = select('h1,h2,h3,h4,h5,h6,a:not([href])', elm);
  return elms;
};

const hasTitle = function (target: LinkTarget) {
  return trim(target.title).length > 0;
};

const find = function (elm: HTMLElement): LinkTarget[] {
  const elms = getTargetElements(elm);
  return Arr.filter(getHeaderTargets(elms).concat(getAnchorTargets(elms)), hasTitle);
};

export const LinkTargets = {
  find
};