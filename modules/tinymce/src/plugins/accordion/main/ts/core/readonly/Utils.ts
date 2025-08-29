import { Attribute, SelectorFilter, SugarElement } from '@ephox/sugar';

const MCE_OPEN = 'data-mce-open';
const OPEN = 'open';

const getDetailsElements = (scope: SugarElement<Node>): Array<SugarElement<HTMLDetailsElement>> =>
  SelectorFilter.descendants<HTMLDetailsElement>(scope, 'details');

const hasOpenAttribute = (element: SugarElement<HTMLDetailsElement>): boolean =>
  Attribute.has(element, OPEN);

const setOpenAttribute = (element: SugarElement<HTMLDetailsElement>): void =>
  Attribute.set(element, OPEN, 'open');

const removeOpenAttribute = (element: SugarElement<HTMLDetailsElement>): void =>
  Attribute.remove(element, OPEN);

const hasMceOpenAttribute = (element: SugarElement<HTMLDetailsElement>): boolean =>
  Attribute.has(element, MCE_OPEN);

const setMceOpenAttribute = (element: SugarElement<HTMLDetailsElement>, value: boolean): void =>
  Attribute.set(element, MCE_OPEN, value);

const removeMceOpenAttribute = (element: SugarElement<HTMLDetailsElement>): void =>
  Attribute.remove(element, MCE_OPEN);

const getMceOpenAttribute = (element: SugarElement<HTMLDetailsElement>): boolean =>
  Attribute.get(element, MCE_OPEN)?.toLowerCase() === 'true' ? true : false;

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
