import { TestLabel } from '@ephox/bedrock-client';
import { Fun, Result } from '@ephox/katamari';
import { SugarElement, Truncate, Visibility } from '@ephox/sugar';

import * as UiSearcher from '../find/UiSearcher';
import { Chain } from './Chain';
import * as Guard from './Guard';
import { Step } from './Step';

const findIn = (container: SugarElement<any>, selector: string): Result<SugarElement<any>, TestLabel> =>
  UiSearcher.findIn(container, selector);

const findAllIn = (container: SugarElement<any>, selector: string): SugarElement<any>[] =>
  UiSearcher.findAllIn(container, selector);

const cWaitFor = (message: string, selector: string): Chain<SugarElement<any>, SugarElement<any>> =>
  cWaitForState(message, selector, Fun.always);

const sWaitFor = <T>(message: string, container: SugarElement<any>, selector: string): Step<T, T> =>
  Chain.asStep<T, SugarElement>(container, [ cWaitFor(message, selector) ]);

const cWaitForVisible = (message: string, selector: string): Chain<SugarElement<any>, SugarElement<any>> =>
  cWaitForState(message, selector, Visibility.isVisible);

// TODO: Perhaps create cWaitForNoState rather than Fun.not here?
const cWaitForHidden = (message: string, selector: string): Chain<SugarElement<any>, SugarElement<any>> =>
  cWaitForState(message, selector, Fun.not(Visibility.isVisible));

const sWaitForVisible = <T>(message: string, container: SugarElement<any>, selector: string): Step<T, T> =>
  Chain.asStep<T, SugarElement>(container, [ cWaitForVisible(message, selector) ]);

const sWaitForHidden = <T>(message: string, container: SugarElement<any>, selector: string): Step<T, T> =>
  Chain.asStep<T, SugarElement>(container, [ cWaitForHidden(message, selector) ]);

const cHasState = <T> (predicate: (element: SugarElement<T>) => boolean): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.binder((element) => predicate(element) ? Result.value(element) :
    Result.error(Truncate.getHtml(element) + ' did not match predicate: ' + predicate.toString()));

const cFindWithState = (selector: string, predicate: (element: SugarElement<any>) => boolean): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.fromChains([
    cFindIn(selector),
    cHasState(predicate)
  ]);

// Wait for a selector to have state. Max wait time: 10 seconds.
const cWaitForState = (message: string, selector: string, predicate: (element: SugarElement<any>) => boolean): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.control(
    cFindWithState(selector, predicate),
    Guard.tryUntil(message, 10, 10000)
  );

const sExists = <T>(container: SugarElement<any>, selector: string): Step<T, T> =>
  Step.async<T>((next, die) => {
    findIn(container, selector).fold(die, next);
  });

const sNotExists = <T>(container: SugarElement<any>, selector: string): Step<T, T> =>
  Step.async<T>((next, die) => {
    findIn(container, selector).fold(() => {
      next();
    }, () => {
      die('Expected ' + selector + ' not to exist.');
    });
  });

const cExists = (selector: string): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.async((container: SugarElement<any>, next, die) => {
    findIn(container, selector).fold(
      () => die('Expected ' + selector + ' to exist.'),
      () => next(container)
    );
  });

const cNotExists = (selector: string): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.async((container: SugarElement<any>, next, die) => {
    findIn(container, selector).fold(
      () => next(container),
      () => die('Expected ' + selector + ' not to exist.')
    );
  });

const cFindIn = (selector: string): Chain<SugarElement<any>, SugarElement<any>> =>
  Chain.binder((container: SugarElement<any>) =>
    findIn(container, selector)
  );

const cFindAllIn = (selector: string): Chain<SugarElement<any>, SugarElement<any>[]> =>
  Chain.mapper((container: SugarElement<any>) =>
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
