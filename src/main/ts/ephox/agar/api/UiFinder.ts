import Truncate from '../alien/Truncate';
import Chain from './Chain';
import Guard from './Guard';
import Step from './Step';
import UiSearcher from '../find/UiSearcher';
import { Fun } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { Visibility } from '@ephox/sugar';

var findIn = function (container, selector) {
  return UiSearcher.findIn(container, selector);
};

var findAllIn = function (container, selector) {
  return UiSearcher.findAllIn(container, selector);
};

var cWaitFor = function (message, selector) {
  return cWaitForState(message, selector, Fun.constant(true));
};

var sWaitFor = (message, container, selector) =>
  Chain.asStep(container, [cWaitFor(message, selector)]);

var cWaitForVisible = function (message, selector) {
  return cWaitForState(message, selector, Visibility.isVisible);
};

// TODO: Perhaps create cWaitForNoState rather than Fun.not here?
var cWaitForHidden = function (message, selector) {
  return cWaitForState(message, selector, Fun.not(Visibility.isVisible));
};

var sWaitForVisible = (message, container, selector) =>
  Chain.asStep(container, [cWaitForVisible(message, selector)]);

var sWaitForHidden = (message, container, selector) =>
  Chain.asStep(container, [cWaitForHidden(message, selector)]);

var cHasState = function (predicate) {
  return Chain.binder(function (element) {
    return predicate(element) ? Result.value(element) :
      Result.error(Truncate.getHtml(element) + ' did not match predicate: ' + predicate.toString());
  });
};

var cFindWithState = function (selector, predicate) {
  return Chain.fromChains([
    cFindIn(selector),
    cHasState(predicate)
  ]);
};

// Wait for a selector to have state. Max wait time: 3 seconds.
var cWaitForState = function (message, selector, predicate) {
  return Chain.control(
    cFindWithState(selector, predicate),
    Guard.tryUntil(message, 10, 3000)
  );
};

var sExists = function (container, selector) {
  return Step.async(function (next, die) {
    findIn(container, selector).fold(die, next);
  });
};

var sNotExists = function (container, selector) {
  return Step.async(function (next, die) {
    findIn(container, selector).fold(function () {
      next();
    }, function () {
      die('Expected ' + selector + ' not to exist.');
    });
  });
};

var cFindIn = function (selector) {
  return Chain.binder(function (container) {
    return findIn(container, selector);
  });
};

var cFindAllIn = function (selector) {
  return Chain.mapper(function (container) {
    return findAllIn(container, selector);
  });
};

export default <any>{
  findIn: findIn,
  findAllIn: findAllIn,

  sExists: sExists,
  sNotExists: sNotExists,

  sWaitFor,
  sWaitForVisible,
  sWaitForHidden,

  cWaitFor: cWaitFor,
  cWaitForVisible: cWaitForVisible,
  cWaitForHidden: cWaitForHidden,
  cWaitForState: cWaitForState,

  cFindIn: cFindIn,
  cFindAllIn: cFindAllIn
};