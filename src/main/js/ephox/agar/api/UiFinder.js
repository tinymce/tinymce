define(
  'ephox.agar.api.UiFinder',

  [
    'ephox.agar.alien.Truncate',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.Step',
    'ephox.agar.find.UiSearcher',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.view.Visibility'
  ],

  function (Truncate, Chain, Guard, Step, UiSearcher, Fun, Result, Visibility) {
    var findIn = function (container, selector) {
      return UiSearcher.findIn(container, selector);
    };

    var findAllIn = function (container, selector) {
      return UiSearcher.findAllIn(container, selector);
    };

    var cWaitFor = function (message, selector) {
      return cWaitForState(message, selector, Fun.constant(true));
    };

    var cWaitForVisible = function (message, selector) {
      return cWaitForState(message, selector, Visibility.isVisible);
    };

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

    return {
      findIn: findIn,
      findAllIn: findAllIn,

      sExists: sExists,
      sNotExists: sNotExists,

      cWaitFor: cWaitFor,
      cWaitForVisible: cWaitForVisible,
      cWaitForState: cWaitForState,

      cFindIn: cFindIn,
      cFindAllIn: cFindAllIn
    };
  }
);