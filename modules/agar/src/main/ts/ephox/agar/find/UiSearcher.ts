import { Adt, Option, Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import * as SizzleFind from '../alien/SizzleFind';
import * as Truncate from '../alien/Truncate';
import { TestLabel } from '@ephox/bedrock';

interface TargetAdt {
  fold: <T> (
    self: (element: Element, selector: string) => T,
    children: (element: Element, selector: string) => T,
    descendants: (element: Element, selector: string) => T
  ) => T;
  match: <T>(branches: {
    self: (element: Element, selector: string) => T;
    children: (element: Element, selector: string) => T;
    descendants: (element: Element, selector: string) => T;
  }) => T;
  log: (label: string) => void;
}

const targets: {
  self: (element: Element, selector: string) => TargetAdt;
  children: (element: Element, selector: string) => TargetAdt;
  descendants: (element: Element, selector: string) => TargetAdt;
} = Adt.generate([
  { self: ['element', 'selector'] },
  { children: ['element', 'selector'] },
  { descendants: ['element', 'selector'] }
]);

const derive = function (element: Element, selector: string) {
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

const matchesSelf = function (element: Element<any>, selector: string): Option<Element<any>> {
  return SizzleFind.matches(element, selector) ? Option.some(element) : Option.none();
};

const select = function (element: Element<any>, selector: string): Option<Element<any>> {
  return derive(element, selector).fold(
    matchesSelf,
    SizzleFind.child,
    SizzleFind.descendant
  );
};

const selectAll = function (element: Element<any>, selector: string): Array<Element<any>> {
  return derive(element, selector).fold(
    (element, selector) => matchesSelf(element, selector).toArray(),
    SizzleFind.children,
    SizzleFind.descendants
  );
};

const toResult = function <T>(message: TestLabel, option: Option<T>): Result<T, TestLabel> {
  return option.fold(function () {
    return Result.error<T, TestLabel>(message);
  }, Result.value);
};

const findIn = function (container: Element<any>, selector: string): Result<Element<any>, TestLabel> {
  return toResult(
    () => 'Could not find selector: ' + selector + ' in ' + Truncate.getHtml(container),
    select(container, selector)
  );
};

const findAllIn = function (container: Element<any>, selector: string): Array<Element<any>> {
  return selectAll(container, selector);
};

export {
  select,
  findIn,
  findAllIn
};
