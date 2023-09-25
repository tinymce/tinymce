import { Arr, Unicode } from '@ephox/katamari';
import { Attribute, Insert, Remove, SelectorFilter, SugarElement, SugarNode, SugarText, Traverse } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import * as ElementType from './ElementType';

const getLastChildren = (elm: SugarElement<Node>): SugarElement<Node>[] => {
  const children: SugarElement<Node>[] = [];
  let rawNode: Node | null = elm.dom;

  while (rawNode) {
    children.push(SugarElement.fromDom(rawNode));
    rawNode = rawNode.lastChild;
  }

  return children;
};

const removeTrailingBr = (elm: SugarElement<Node>): void => {
  const allBrs = SelectorFilter.descendants(elm, 'br');
  const brs = Arr.filter(getLastChildren(elm).slice(-1), ElementType.isBr);
  if (allBrs.length === brs.length) {
    Arr.each(brs, Remove.remove);
  }
};

const createPaddingBr = (): SugarElement<HTMLBRElement> => {
  const br = SugarElement.fromTag('br');
  Attribute.set(br, 'data-mce-bogus', '1');
  return br;
};

const fillWithPaddingBr = (elm: SugarElement<Node>): void => {
  Remove.empty(elm);
  Insert.append(elm, createPaddingBr());
};

const isPaddingContents = (elm: SugarElement<Node>): boolean => {
  return SugarNode.isText(elm) ? SugarText.get(elm) === Unicode.nbsp : ElementType.isBr(elm);
};

const isPaddedElement = (elm: SugarElement<Node>): boolean => {
  return Arr.filter(Traverse.children(elm), isPaddingContents).length === 1;
};

const trimBlockTrailingBr = (elm: SugarElement<Node>, schema: Schema): void => {
  Traverse.lastChild(elm).each((lastChild) => {
    Traverse.prevSibling(lastChild).each((lastChildPrevSibling) => {
      if (schema.isBlock(SugarNode.name(elm)) && ElementType.isBr(lastChild) && schema.isBlock(SugarNode.name(lastChildPrevSibling))) {
        Remove.remove(lastChild);
      }
    });
  });
};

export {
  createPaddingBr,
  removeTrailingBr,
  fillWithPaddingBr,
  isPaddedElement,
  trimBlockTrailingBr
};
