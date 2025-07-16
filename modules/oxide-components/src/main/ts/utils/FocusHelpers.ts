import { Focus, SelectorFind, SugarElement } from '@ephox/sugar';

export const focusDescendant = (scope: SugarElement<HTMLElement>, selector: string): void =>
  SelectorFind.descendant<HTMLElement>(scope, selector).each(Focus.focus);

export const focusAncestor = (scope: SugarElement<HTMLElement>, selector: string): void =>
  SelectorFind.ancestor<HTMLElement>(scope, selector).each(Focus.focus);

