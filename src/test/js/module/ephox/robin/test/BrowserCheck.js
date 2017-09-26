define(
  'ephox.robin.test.BrowserCheck',

  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Option, Element, Insert, Remove, SelectorFind, Traverse) {

    var getNode = function (container) {
      return SelectorFind.descendant(container, '.me').fold(function () {
        return SelectorFind.descendant(container, '.child').bind(Traverse.firstChild);
      }, function (v) {
        return Option.some(v);
      }).getOrDie();
    };

    var run = function (input, f) {
      var body = SelectorFind.first('body').getOrDie();
      var container = Element.fromTag('div');
      Insert.append(body, container);
      container.dom().innerHTML = input;
      var node = getNode(container);
      f(node);
      Remove.remove(container);
    };

    return {
      run: run
    };
  }
);
