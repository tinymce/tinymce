/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Id, Type } from '@ephox/katamari';
import { SelectorFilter, SugarElement } from '@ephox/sugar';

import Tools from 'tinymce/core/api/util/Tools';

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

const isElement = (node: Node): node is HTMLElement => Type.isNonNullable(node) && node.nodeType === 1;

const trim = Tools.trim;
const hasContentEditableState = (value: string) => {
  return (node: Node) => {
    if (isElement(node)) {
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

const create = (type: LinkTargetType, title: string, url: string, level: number, attach: () => void): LinkTarget => {
  return {
    type,
    title,
    url,
    level,
    attach
  };
};

const isChildOfContentEditableTrue = (node: Node) => {
  while ((node = node.parentNode)) {
    const value = (node as HTMLElement).contentEditable;
    if (value && value !== 'inherit') {
      return isContentEditableTrue(node);
    }
  }

  return false;
};

const select = (selector: string, root: HTMLElement) => {
  return Arr.map(SelectorFilter.descendants<HTMLElement>(SugarElement.fromDom(root), selector), (element) => {
    return element.dom;
  });
};

const getElementText = (elm: HTMLElement) => {
  return elm.innerText || elm.textContent;
};

const getOrGenerateId = (elm: HTMLElement) => {
  return elm.id ? elm.id : Id.generate('h');
};

const isAnchor = (elm: HTMLElement) => {
  return elm && elm.nodeName === 'A' && (elm.id || (elm as HTMLAnchorElement).name) !== undefined;
};

const isValidAnchor = (elm: HTMLElement) => {
  return isAnchor(elm) && isEditable(elm);
};

const isHeader = (elm: HTMLElement) => {
  return elm && /^(H[1-6])$/.test(elm.nodeName);
};

const isEditable = (elm: HTMLElement) => {
  return isChildOfContentEditableTrue(elm) && !isContentEditableFalse(elm);
};

const isValidHeader = (elm: HTMLElement) => {
  return isHeader(elm) && isEditable(elm);
};

const getLevel = (elm: HTMLElement) => {
  return isHeader(elm) ? parseInt(elm.nodeName.substr(1), 10) : 0;
};

const headerTarget = (elm: HTMLElement) => {
  const headerId = getOrGenerateId(elm);

  const attach = () => {
    elm.id = headerId;
  };

  return create('header', getElementText(elm), '#' + headerId, getLevel(elm), attach);
};

const anchorTarget = (elm: HTMLAnchorElement) => {
  const anchorId = elm.id || elm.name;
  const anchorText = getElementText(elm);

  return create('anchor', anchorText ? anchorText : '#' + anchorId, '#' + anchorId, 0, Fun.noop);
};

const getHeaderTargets = (elms: HTMLElement[]) => {
  return Arr.map(Arr.filter(elms, isValidHeader), headerTarget);
};

const getAnchorTargets = (elms: HTMLElement[]) => {
  return Arr.map(Arr.filter(elms, isValidAnchor), anchorTarget);
};

const getTargetElements = (elm: HTMLElement) => {
  const elms = select('h1,h2,h3,h4,h5,h6,a:not([href])', elm);
  return elms;
};

const hasTitle = (target: LinkTarget) => {
  return trim(target.title).length > 0;
};

const find = (elm: HTMLElement): LinkTarget[] => {
  const elms = getTargetElements(elm);
  return Arr.filter(getHeaderTargets(elms).concat(getAnchorTargets(elms)), hasTitle);
};

export const LinkTargets = {
  find
};
