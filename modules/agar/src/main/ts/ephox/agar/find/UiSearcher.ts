import { TestLabel } from '@ephox/bedrock-client';
import { Adt, Optional, Result } from '@ephox/katamari';
import { SugarElement, Truncate } from '@ephox/sugar';

import * as SizzleFind from '../alien/SizzleFind';

interface TargetAdt {
  fold: <T> (
    self: (element: SugarElement<any>, selector: string) => T,
    children: (element: SugarElement<any>, selector: string) => T,
    descendants: (element: SugarElement<any>, selector: string) => T
  ) => T;
  match: <T>(branches: {
    self: (element: SugarElement<any>, selector: string) => T;
    children: (element: SugarElement<any>, selector: string) => T;
    descendants: (element: SugarElement<any>, selector: string) => T;
  }) => T;
  log: (label: string) => void;
}

const targets: {
  self: (element: SugarElement<any>, selector: string) => TargetAdt;
  children: (element: SugarElement<any>, selector: string) => TargetAdt;
  descendants: (element: SugarElement<any>, selector: string) => TargetAdt;
} = Adt.generate([
  { self: [ 'element', 'selector' ] },
  { children: [ 'element', 'selector' ] },
  { descendants: [ 'element', 'selector' ] }
]);

const derive = (element: SugarElement<any>, selector: string) => {
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

const matchesSelf = (element: SugarElement<any>, selector: string): Optional<SugarElement<any>> =>
  SizzleFind.matches(element, selector) ? Optional.some(element) : Optional.none();

const select = (element: SugarElement<any>, selector: string): Optional<SugarElement<any>> =>
  derive(element, selector).fold(
    matchesSelf,
    SizzleFind.child,
    SizzleFind.descendant
  );

const selectAll = (element: SugarElement<any>, selector: string): Array<SugarElement<any>> =>
  derive(element, selector).fold(
    (element, selector) => matchesSelf(element, selector).toArray(),
    SizzleFind.children,
    SizzleFind.descendants
  );

const toResult = <T>(message: TestLabel, option: Optional<T>): Result<T, TestLabel> =>
  option.fold(
    () => Result.error<T, TestLabel>(message),
    Result.value
  );

const findIn = (container: SugarElement<any>, selector: string): Result<SugarElement<any>, TestLabel> =>
  toResult(
    () => 'Could not find selector: ' + selector + ' in ' + Truncate.getHtml(container),
    select(container, selector)
  );

const findAllIn = (container: SugarElement<any>, selector: string): Array<SugarElement<any>> =>
  selectAll(container, selector);

export {
  select,
  findIn,
  findAllIn
};
