import { TestLabel } from '@ephox/bedrock-client';
import { Adt, Optional, Result } from '@ephox/katamari';
import { SugarElement, Truncate } from '@ephox/sugar';

import * as SizzleFind from '../alien/SizzleFind';

interface TargetAdt {
  fold: <T> (
    self: (element: SugarElement<Node>, selector: string) => T,
    children: (element: SugarElement<Node>, selector: string) => T,
    descendants: (element: SugarElement<Node>, selector: string) => T
  ) => T;
  match: <T>(branches: {
    self: (element: SugarElement<Node>, selector: string) => T;
    children: (element: SugarElement<Node>, selector: string) => T;
    descendants: (element: SugarElement<Node>, selector: string) => T;
  }) => T;
  log: (label: string) => void;
}

const targets: {
  self: (element: SugarElement<Node>, selector: string) => TargetAdt;
  children: (element: SugarElement<Node>, selector: string) => TargetAdt;
  descendants: (element: SugarElement<Node>, selector: string) => TargetAdt;
} = Adt.generate([
  { self: [ 'element', 'selector' ] },
  { children: [ 'element', 'selector' ] },
  { descendants: [ 'element', 'selector' ] }
]);

const derive = (element: SugarElement<Node>, selector: string) => {
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

const matchesSelf = <T extends Element>(element: SugarElement<Node>, selector: string): Optional<SugarElement<T>> =>
  SizzleFind.matches<T>(element, selector) ? Optional.some(element) : Optional.none();

const select = <T extends Element>(element: SugarElement<Node>, selector: string): Optional<SugarElement<T>> =>
  derive(element, selector).fold<Optional<SugarElement<T>>>(
    matchesSelf,
    SizzleFind.child,
    SizzleFind.descendant
  );

const selectAll = <T extends Element>(element: SugarElement<Node>, selector: string): Array<SugarElement<T>> =>
  derive(element, selector).fold<Array<SugarElement<T>>>(
    (element, selector) => matchesSelf<T>(element, selector).toArray(),
    SizzleFind.children,
    SizzleFind.descendants
  );

const toResult = <T>(message: TestLabel, option: Optional<T>): Result<T, TestLabel> =>
  option.fold(
    () => Result.error<T, TestLabel>(TestLabel.asString(message)),
    Result.value
  );

const findIn = <T extends Element>(container: SugarElement<Node>, selector: string): Result<SugarElement<T>, TestLabel> =>
  toResult(
    () => 'Could not find selector: ' + selector + ' in ' + Truncate.getHtml(container),
    select(container, selector)
  );

const findAllIn = <T extends Element>(container: SugarElement<Node>, selector: string): Array<SugarElement<T>> =>
  selectAll(container, selector);

export {
  select,
  findIn,
  findAllIn
};
