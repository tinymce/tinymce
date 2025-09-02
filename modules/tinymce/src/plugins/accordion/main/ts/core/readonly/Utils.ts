import { Arr } from '@ephox/katamari';
import { Attribute, SelectorFilter, SugarElement } from '@ephox/sugar';

import AstNode from 'tinymce/core/api/html/Node';

const MCE_OPEN = 'data-mce-open';
const OPEN = 'open';

const getDetailsElements = (scope: SugarElement<Node>): Array<SugarElement<HTMLDetailsElement>> =>
  SelectorFilter.descendants<HTMLDetailsElement>(scope, 'details');

const hasOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): boolean =>
  hasAttribute(element, OPEN);

const setOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): void =>
  setAttribute(element, OPEN, 'open');

const removeOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): void =>
  removeAttribute(element, OPEN);

const hasMceOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): boolean =>
  hasAttribute(element, MCE_OPEN);

const setMceOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode, value: boolean): void =>
  setAttribute(element, MCE_OPEN, value);

const removeMceOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): void =>
  removeAttribute(element, MCE_OPEN);

const getMceOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): boolean =>
  getAttributeValue(element, MCE_OPEN)?.toLowerCase() === 'true' ? true : false;

const hasAttribute = (element: SugarElement<Element> | AstNode, attribute: string): boolean => {
  if (element instanceof AstNode) {
    return Arr.exists(element.attributes ?? [], ({ name }) => name === attribute);
  }
  return Attribute.has(element, attribute);
};

const getAttributeValue = (element: SugarElement<Element> | AstNode, attribute: string): string | undefined => {
  if (element instanceof AstNode) {
    return element.attr(attribute);
  }
  return Attribute.get(element, attribute);
};

const removeAttribute = (element: SugarElement<Element> | AstNode, attribute: string) => {
  if (element instanceof AstNode) {
    element.attr(attribute, null);
  } else {
    Attribute.remove(element, attribute);
  }
};

const setAttribute = (element: SugarElement<Element> | AstNode, attribute: string, value: string | boolean) => {
  if (element instanceof AstNode) {
    element.attr(attribute, value + '');
  } else {
    Attribute.set(element, attribute, value);
  }
};

export {
  getDetailsElements,
  hasOpenAttribute,
  setOpenAttribute,
  removeOpenAttribute,
  hasMceOpenAttribute,
  setMceOpenAttribute,
  removeMceOpenAttribute,
  getMceOpenAttribute
};
