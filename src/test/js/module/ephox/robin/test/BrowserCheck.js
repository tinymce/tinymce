define(
  'ephox.robin.test.BrowserCheck',

  [
    'ephox.perhaps.Option',
    'ephox.syrup.api.Element',
    'ephox.syrup.api.Insert',
    'ephox.syrup.api.Remove',
    'ephox.syrup.api.SelectorFind',
    'ephox.syrup.api.Traverse'
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
