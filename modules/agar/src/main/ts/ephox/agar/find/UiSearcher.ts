import { Adt, Option, Result } from '@ephox/katamari';
import { Element, Truncate } from '@ephox/sugar';

import * as SizzleFind from '../alien/SizzleFind';
import { TestLabel } from '@ephox/bedrock-client';

interface TargetAdt {
  fold: <T> (
    self: (element: Element<any>, selector: string) => T,
    children: (element: Element<any>, selector: string) => T,
    descendants: (element: Element<any>, selector: string) => T
  ) => T;
  match: <T>(branches: {
    self: (element: Element<any>, selector: string) => T;
    children: (element: Element<any>, selector: string) => T;
    descendants: (element: Element<any>, selector: string) => T;
  }) => T;
  log: (label: string) => void;
}

const targets: {
  self: (element: Element<any>, selector: string) => TargetAdt;
  children: (element: Element<any>, selector: string) => TargetAdt;
  descendants: (element: Element<any>, selector: string) => TargetAdt;
} = Adt.generate([
  { self: [ 'element', 'selector' ] },
  { children: [ 'element', 'selector' ] },
  { descendants: [ 'element', 'selector' ] }
]);

const derive = (element: Element<any>, selector: string) => {
  // Not sure if error is what I want here.
  if (selector === undefined) {
    throw new Error('No selector passed through');
  } else if (selector.indexOf('root:') === 0) {
    return targets.self(element, selector.substring('root:'.length));
  } else if (selector.indexOf('root>') === 0) {
    return targets.children(element, selector.substring('root>'.length));
  } else {
    return targets.descendants(element, selector);
  }
};

const matchesSelf = (element: Element<any>, selector: string): Option<Element<any>> =>
  SizzleFind.matches(element, selector) ? Option.some(element) : Option.none();

const select = (element: Element<any>, selector: string): Option<Element<any>> =>
  derive(element, selector).fold(
    matchesSelf,
    SizzleFind.child,
    SizzleFind.descendant
  );

const selectAll = (element: Element<any>, selector: string): Array<Element<any>> =>
  derive(element, selector).fold(
    (element, selector) => matchesSelf(element, selector).toArray(),
    SizzleFind.children,
    SizzleFind.descendants
  );

const toResult = <T>(message: TestLabel, option: Option<T>): Result<T, TestLabel> =>
  option.fold(
    () => Result.error<T, TestLabel>(message),
    Result.value
  );

const findIn = (container: Element<any>, selector: string): Result<Element<any>, TestLabel> =>
  toResult(
    () => 'Could not find selector: ' + selector + ' in ' + Truncate.getHtml(container),
    select(container, selector)
  );

const findAllIn = (container: Element<any>, selector: string): Array<Element<any>> =>
  selectAll(container, selector);

export {
  select,
  findIn,
  findAllIn
};
