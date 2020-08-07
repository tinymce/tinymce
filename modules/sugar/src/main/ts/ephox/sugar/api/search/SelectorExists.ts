import { SugarElement } from '../node/SugarElement';
import * as SelectorFind from './SelectorFind';

const any = (selector: string): boolean =>
  SelectorFind.first(selector).isSome();

const ancestor = (scope: SugarElement<Node>, selector: string, isRoot?: (e: SugarElement<Node>) => boolean): boolean =>
  SelectorFind.ancestor(scope, selector, isRoot).isSome();

const sibling = (scope: SugarElement<Node>, selector: string): boolean =>
  SelectorFind.sibling(scope, selector).isSome();

const child = (scope: SugarElement<Node>, selector: string): boolean =>
  SelectorFind.child(scope, selector).isSome();

const descendant = (scope: SugarElement<Node>, selector: string): boolean =>
  SelectorFind.descendant(scope, selector).isSome();

const closest = (scope: SugarElement<Node>, selector: string, isRoot?: (e: SugarElement<Node>) => boolean): boolean =>
  SelectorFind.closest(scope, selector, isRoot).isSome();

export {
  any,
  ancestor,
  sibling,
  child,
  descendant,
  closest
};
