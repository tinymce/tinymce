import { Fun, Result } from '@ephox/katamari';
import { Element, Visibility, Truncate } from '@ephox/sugar';

import * as UiSearcher from '../find/UiSearcher';
import { Chain } from './Chain';
import * as Guard from './Guard';
import { Step } from './Step';
import { TestLabel } from '@ephox/bedrock-client';

const findIn = (container: Element<any>, selector: string): Result<Element<any>, TestLabel> =>
  UiSearcher.findIn(container, selector);

const findAllIn = (container: Element<any>, selector: string): Element<any>[] =>
  UiSearcher.findAllIn(container, selector);

const cWaitFor = (message: string, selector: string): Chain<Element<any>, Element<any>> =>
  cWaitForState(message, selector, Fun.constant(true));

const sWaitFor = <T>(message: string, container: Element<any>, selector: string): Step<T, T> =>
  Chain.asStep<T, Element>(container, [cWaitFor(message, selector)]);

const cWaitForVisible = (message: string, selector: string): Chain<Element<any>, Element<any>> =>
  cWaitForState(message, selector, Visibility.isVisible);

// TODO: Perhaps create cWaitForNoState rather than Fun.not here?
const cWaitForHidden = (message: string, selector: string): Chain<Element<any>, Element<any>> =>
  cWaitForState(message, selector, Fun.not(Visibility.isVisible));

const sWaitForVisible = <T>(message: string, container: Element<any>, selector: string): Step<T, T> =>
  Chain.asStep<T, Element>(container, [cWaitForVisible(message, selector)]);

const sWaitForHidden = <T>(message: string, container: Element<any>, selector: string): Step<T, T> =>
  Chain.asStep<T, Element>(container, [cWaitForHidden(message, selector)]);

const cHasState = <T> (predicate: (element: Element<T>) => boolean): Chain<Element<T>, Element<T>> =>
  Chain.binder((element) => predicate(element) ? Result.value(element) :
    Result.error(Truncate.getHtml(element) + ' did not match predicate: ' + predicate.toString()));

const cFindWithState = (selector: string, predicate: (element: Element<any>) => boolean): Chain<Element<any>, Element<any>> =>
  Chain.fromChains([
    cFindIn(selector),
    cHasState(predicate)
  ]);

// Wait for a selector to have state. Max wait time: 10 seconds.
const cWaitForState = (message: string, selector: string, predicate: (element: Element<any>) => boolean): Chain<Element<any>, Element<any>> =>
  Chain.control(
    cFindWithState(selector, predicate),
    Guard.tryUntil(message, 10, 10000)
  );

const sExists = <T>(container: Element<any>, selector: string): Step<T, T> =>
  Step.async<T>((next, die) => {
    findIn(container, selector).fold(die, next);
  });

const sNotExists = <T>(container: Element<any>, selector: string): Step<T, T> =>
  Step.async<T>((next, die) => {
    findIn(container, selector).fold(() => {
      next();
    }, () => {
      die('Expected ' + selector + ' not to exist.');
    });
  });

const cExists = (selector: string): Chain<Element<any>, Element<any>> =>
  Chain.async((container: Element<any>, next, die) => {
    findIn(container, selector).fold(
      () => die('Expected ' + selector + ' to exist.'),
      () => next(container)
    );
  });

const cNotExists = (selector: string): Chain<Element<any>, Element<any>> =>
  Chain.async((container: Element<any>, next, die) => {
    findIn(container, selector).fold(
      () => next(container),
      () => die('Expected ' + selector + ' not to exist.')
    );
  });

const cFindIn = (selector: string): Chain<Element<any>, Element<any>> =>
  Chain.binder((container: Element<any>) =>
    findIn(container, selector)
  );

const cFindAllIn = (selector: string): Chain<Element<any>, Element<any>[]> =>
  Chain.mapper((container: Element<any>) =>
    findAllIn(container, selector)
  );

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
