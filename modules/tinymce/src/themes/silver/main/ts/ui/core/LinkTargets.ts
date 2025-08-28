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
  readonly type: LinkTargetType;
  readonly title: string;
  readonly url: string;
  readonly level: number;
  readonly attach: any; // To allow popups we have to replace the function with a placeholder
}

const isElement = (node: Node): node is HTMLElement => Type.isNonNullable(node) && node.nodeType === 1;

const trim = Tools.trim;
const hasContentEditableState = (value: string) => {
  return (node: Node): boolean => {
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

const create = (type: LinkTargetType, title: string, url: string, level: number, attach: () => void): LinkTarget => ({
  type,
  title,
  url,
  level,
  attach
});

const isChildOfContentEditableTrue = (node: Node): boolean => {
  let tempNode: Node | null = node;
  while ((tempNode = tempNode.parentNode)) {
    const value = (tempNode as HTMLElement).contentEditable;
    if (value && value !== 'inherit') {
      return isContentEditableTrue(tempNode);
    }
  }

  return false;
};

const select = (selector: string, root: HTMLElement) => {
  return Arr.map(SelectorFilter.descendants<HTMLElement>(SugarElement.fromDom(root), selector), (element) => {
    return element.dom;
  });
};

const getElementText = (elm: HTMLElement): string | null => {
  return elm.innerText || elm.textContent;
};

const getOrGenerateId = (elm: HTMLElement): string => {
  return elm.id ? elm.id : Id.generate('h');
};

const isAnchor = (elm: HTMLElement): elm is HTMLAnchorElement => {
  return elm && elm.nodeName === 'A' && (elm.id || (elm as HTMLAnchorElement).name) !== undefined;
};

const isValidAnchor = (elm: HTMLElement): elm is HTMLAnchorElement => {
  return isAnchor(elm) && isEditable(elm);
};

const isHeader = (elm: HTMLElement): elm is HTMLHeadingElement => {
  return elm && /^(H[1-6])$/.test(elm.nodeName);
};

const isEditable = (elm: HTMLElement): boolean => {
  return isChildOfContentEditableTrue(elm) && !isContentEditableFalse(elm);
};

const isValidHeader = (elm: HTMLElement): elm is HTMLHeadingElement => {
  return isHeader(elm) && isEditable(elm);
};

const getLevel = (elm: HTMLElement) => {
  return isHeader(elm) ? parseInt(elm.nodeName.substr(1), 10) : 0;
};

const headerTarget = (elm: HTMLElement): LinkTarget => {
  const headerId = getOrGenerateId(elm);

  const attach = () => {
    elm.id = headerId;
  };

  return create('header', getElementText(elm) ?? '', '#' + headerId, getLevel(elm), attach);
};

const anchorTarget = (elm: HTMLAnchorElement): LinkTarget => {
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

const getTargetElements = (elm: HTMLElement): HTMLElement[] => {
  const elms = select('h1,h2,h3,h4,h5,h6,a:not([href])', elm);
  return elms;
};

const hasTitle = (target: LinkTarget): boolean => {
  return trim(target.title).length > 0;
};

const find = (elm: HTMLElement): LinkTarget[] => {
  const elms = getTargetElements(elm);
  return Arr.filter(getHeaderTargets(elms).concat(getAnchorTargets(elms)), hasTitle);
};

export const LinkTargets = {
  find
};
