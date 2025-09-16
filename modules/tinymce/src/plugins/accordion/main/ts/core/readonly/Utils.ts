import { Attribute, SelectorFilter, type SugarElement } from '@ephox/sugar';

import AstNode from 'tinymce/core/api/html/Node';

import { accordionTemporaryOpenAttribute } from '../Identifiers';

const getDetailsElements = (scope: SugarElement<Node>): Array<SugarElement<HTMLDetailsElement>> =>
  SelectorFilter.descendants<HTMLDetailsElement>(scope, 'details');

const hasOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): boolean =>
  hasAttribute(element, 'open');

const setOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): void =>
  setAttribute(element, 'open', 'open');

const removeOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): void =>
  removeAttribute(element, 'open');

const hasMceOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): boolean =>
  hasAttribute(element, accordionTemporaryOpenAttribute);

const setMceOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode, value: boolean): void =>
  setAttribute(element, accordionTemporaryOpenAttribute, value);

const removeMceOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): void =>
  removeAttribute(element, accordionTemporaryOpenAttribute);

const getMceOpenAttribute = (element: SugarElement<HTMLDetailsElement> | AstNode): boolean =>
  getAttributeValue(element, accordionTemporaryOpenAttribute)?.toLowerCase() === 'true' ? true : false;

const hasAttribute = (element: SugarElement<Element> | AstNode, attribute: string): boolean => {
  if (element instanceof AstNode) {
    return element.attr(attribute) !== undefined;
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
