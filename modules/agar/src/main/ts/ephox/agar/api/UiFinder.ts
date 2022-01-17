import { Fun, Result } from '@ephox/katamari';
import { SugarElement, Truncate, Visibility } from '@ephox/sugar';

import * as UiSearcher from '../find/UiSearcher';
import { Chain } from './Chain';
import * as Guard from './Guard';
import { Step } from './Step';

const findIn = UiSearcher.findIn;
const findAllIn = UiSearcher.findAllIn;

const exists = (container: SugarElement<Node>, selector: string): void => {
  findIn(container, selector).fold(
    () => {
      throw new Error('Expected ' + selector + ' to exist.');
    },
    Fun.noop
  );
};

const notExists = (container: SugarElement<Node>, selector: string): void => {
  return findIn(container, selector).fold(
    Fun.noop,
    () => {
      throw new Error('Expected ' + selector + ' not to exist.');
    }
  );
};

const cWaitFor = <T extends Element>(message: string, selector: string): Chain<SugarElement<Node>, SugarElement<T>> =>
  cWaitForState(message, selector, Fun.always);

const sWaitFor = <T>(message: string, container: SugarElement<Node>, selector: string): Step<T, T> =>
  Chain.asStep<T, SugarElement<Node>>(container, [ cWaitFor(message, selector) ]);

const cWaitForVisible = <T extends HTMLElement>(message: string, selector: string): Chain<SugarElement<Node>, SugarElement<T>> =>
  cWaitForState<T>(message, selector, Visibility.isVisible);

// TODO: Perhaps create cWaitForNoState rather than Fun.not here?
const cWaitForHidden = <T extends HTMLElement>(message: string, selector: string): Chain<SugarElement<Node>, SugarElement<T>> =>
  cWaitForState<T>(message, selector, Fun.not(Visibility.isVisible));

const sWaitForVisible = <T>(message: string, container: SugarElement<Node>, selector: string): Step<T, T> =>
  Chain.asStep<T, SugarElement<Node>>(container, [ cWaitForVisible(message, selector) ]);

const sWaitForHidden = <T>(message: string, container: SugarElement<Node>, selector: string): Step<T, T> =>
  Chain.asStep<T, SugarElement<Node>>(container, [ cWaitForHidden(message, selector) ]);

const cHasState = <T extends Node> (predicate: (element: SugarElement<T>) => boolean): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.binder((element) => predicate(element) ? Result.value(element) :
    Result.error(Truncate.getHtml(element) + ' did not match predicate: ' + predicate.toString()));

const cFindWithState = <T extends Element>(selector: string, predicate: (element: SugarElement<T>) => boolean): Chain<SugarElement<Node>, SugarElement<T>> =>
  Chain.fromChains([
    cFindIn(selector),
    cHasState(predicate)
  ]);

// Wait for a selector to have state. Max wait time: 10 seconds.
const cWaitForState = <T extends Element>(message: string, selector: string, predicate: (element: SugarElement<T>) => boolean): Chain<SugarElement<Node>, SugarElement<T>> =>
  Chain.control(
    cFindWithState(selector, predicate),
    Guard.tryUntil(message, 10, 10000)
  );

const sExists = <T>(container: SugarElement<Node>, selector: string): Step<T, T> =>
  Step.sync<T>(() => exists(container, selector));

const sNotExists = <T>(container: SugarElement<Node>, selector: string): Step<T, T> =>
  Step.sync<T>(() => notExists(container, selector));

const cExists = <T extends Node>(selector: string): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op((container) => exists(container, selector));

const cNotExists = <T extends Node>(selector: string): Chain<SugarElement<T>, SugarElement<T>> =>
  Chain.op((container) => notExists(container, selector));

const cFindIn = (selector: string): Chain<SugarElement<Node>, SugarElement<Element>> =>
  Chain.binder((container) =>
    findIn(container, selector)
  );

const cFindAllIn = <T extends Element>(selector: string): Chain<SugarElement<Node>, SugarElement<T>[]> =>
  Chain.mapper((container) =>
    findAllIn(container, selector)
  );

const pWaitFor = <T extends Element>(message: string, container: SugarElement<Node>, selector: string): Promise<SugarElement<T>> =>
  Chain.toPromise(cWaitFor<T>(message, selector))(container);

const pWaitForVisible = <T extends HTMLElement>(message: string, container: SugarElement<Node>, selector: string): Promise<SugarElement<T>> =>
  Chain.toPromise(cWaitForVisible<T>(message, selector))(container);

const pWaitForHidden = <T extends HTMLElement>(message: string, container: SugarElement<Node>, selector: string): Promise<SugarElement<T>> =>
  Chain.toPromise(cWaitForHidden<T>(message, selector))(container);

const pWaitForState = <T extends Element>(message: string, container: SugarElement<Node>, selector: string, predicate: (element: SugarElement<T>) => boolean): Promise<SugarElement<T>> =>
  Chain.toPromise(cWaitForState(message, selector, predicate))(container);

export {
  findIn,
  findAllIn,
  exists,
  notExists,

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
  cFindAllIn,

  pWaitFor,
  pWaitForVisible,
  pWaitForHidden,
  pWaitForState
};
