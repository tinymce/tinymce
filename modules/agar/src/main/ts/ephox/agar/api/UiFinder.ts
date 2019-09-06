import { Fun, Result } from '@ephox/katamari';
import { Element, Visibility } from '@ephox/sugar';

import * as Truncate from '../alien/Truncate';
import * as UiSearcher from '../find/UiSearcher';
import { Chain } from './Chain';
import * as Guard from './Guard';
import { Step } from './Step';
import { TestLabel } from '@ephox/bedrock';

const findIn = function (container: Element, selector: string): Result<Element, TestLabel> {
  return UiSearcher.findIn(container, selector);
};

const findAllIn = function (container: Element, selector: string): Element[] {
  return UiSearcher.findAllIn(container, selector);
};

const cWaitFor = function (message: string, selector: string) {
  return cWaitForState(message, selector, Fun.constant(true));
};

const sWaitFor = <T>(message: string, container: Element, selector: string) =>
  Chain.asStep<T, Element>(container, [cWaitFor(message, selector)]);

const cWaitForVisible = function (message: string, selector: string) {
  return cWaitForState(message, selector, Visibility.isVisible);
};

// TODO: Perhaps create cWaitForNoState rather than Fun.not here?
const cWaitForHidden = function (message: string, selector: string) {
  return cWaitForState(message, selector, Fun.not(Visibility.isVisible));
};

const sWaitForVisible = <T>(message: string, container: Element, selector: string) =>
  Chain.asStep<T, Element>(container, [cWaitForVisible(message, selector)]);

const sWaitForHidden = <T>(message: string, container: Element, selector: string) =>
  Chain.asStep<T, Element>(container, [cWaitForHidden(message, selector)]);

const cHasState = function (predicate: (element: Element) => boolean) {
  return Chain.binder(function (element: Element): Result<Element, string> {
    return predicate(element) ? Result.value(element) :
      Result.error(Truncate.getHtml(element) + ' did not match predicate: ' + predicate.toString());
  });
};

const cFindWithState = function (selector: string, predicate: (element: Element) => boolean): Chain<Element, Element> {
  return Chain.fromChains([
    cFindIn(selector),
    cHasState(predicate)
  ]);
};

// Wait for a selector to have state. Max wait time: 10 seconds.
const cWaitForState = function (message: string, selector: string, predicate: (element: Element) => boolean): Chain<Element, Element> {
  return Chain.control(
    cFindWithState(selector, predicate),
    Guard.tryUntil(message, 10, 10000)
  );
};

const sExists = function <T>(container: Element, selector: string) {
  return Step.async<T>(function (next, die) {
    findIn(container, selector).fold(die, next);
  });
};

const sNotExists = function <T>(container: Element, selector: string) {
  return Step.async<T>((next, die) => {
    findIn(container, selector).fold(function () {
      next();
    }, function () {
      die('Expected ' + selector + ' not to exist.');
    });
  });
};

const cExists = (selector: string) => Chain.async((container: Element, next, die) => {
  findIn(container, selector).fold(
    () => die('Expected ' + selector + ' to exist.'),
    () => next(container)
  );
});

const cNotExists = (selector: string) => Chain.async((container: Element, next, die) => {
  findIn(container, selector).fold(
    () => next(container),
    () => die('Expected ' + selector + ' not to exist.')
  );
});

const cFindIn = function (selector: string) {
  return Chain.binder(function (container: Element) {
    return findIn(container, selector);
  });
};

const cFindAllIn = function (selector: string) {
  return Chain.mapper(function (container: Element) {
    return findAllIn(container, selector);
  });
};

export {
  findIn,
  findAllIn,

  sExists,
  sNotExists,

  sWaitFor,
  sWaitForVisible,
  sWaitForHidden,

  cExists,
  cNotExists,

  cWaitFor,
  cWaitForVisible,
  cWaitForHidden,
  cWaitForState,

  cFindIn,
  cFindAllIn
};
