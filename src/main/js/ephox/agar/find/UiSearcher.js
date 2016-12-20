define(
  'ephox.agar.find.UiSearcher',

  [
    'ephox.agar.alien.SizzleFind',
    'ephox.agar.alien.Truncate',
    'ephox.katamari.api.Adt',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.search.Selectors',
    'global!Error'
  ],

  function (SizzleFind, Truncate, Adt, Fun, Option, Result, Selectors, Error) {
    var targets = Adt.generate([
      { self: [ 'element', 'selector' ] },
      { children: [ 'element', 'selector' ] },
      { descendants: [ 'element', 'selector' ] }
    ]);

    var derive = function (element, selector) {
      // Not sure if error is what I want here.
      if (selector === undefined) throw new Error('No selector passed through');
      else if (selector.indexOf('root:') === 0) {
        return targets.self(element, selector.substring('root:'.length)); 
      } else if (selector.indexOf('root>') === 0) {
        return targets.children(element, selector.substring('root>'.length));
      } else {
        return targets.descendants(element, selector);
      }
    };

    var matchesSelf = function (element, selector) {
      return Selectors.is(element, selector) ? Option.some(element) : Option.none();
    };

    var optToArray = function (opt) {
      return opt.toArray();
    };

    var select = function (element, selector) {
      return derive(element, selector).fold(
        matchesSelf,
        SizzleFind.child,
        SizzleFind.descendant
      );
    };

    var selectAll = function (element, selector) {
      return derive(element, selector).fold(
        Fun.compose(optToArray, matchesSelf),
        SizzleFind.children,
        SizzleFind.descendants
      );
    };

    var toResult = function (message, option) {
      return option.fold(function () {
        return Result.error(message);
      }, Result.value);
    };

    var findIn = function (container, selector) {
      return toResult(
        'Could not find selector: ' + selector + ' in ' + Truncate.getHtml(container),
        select(container, selector)
      );
    };

    var findAllIn = function (container, selector) {
      return selectAll(container, selector);
    };

    return {
      select: select,
      findIn: findIn,
      findAllIn: findAllIn
    };
  }
);