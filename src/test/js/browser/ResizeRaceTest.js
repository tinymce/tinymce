asynctest(
  'ResizeRaceTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.events.Resize',
    'ephox.sugar.api.view.Width',
    'ephox.sugar.impl.Monitors',
    'global!setTimeout'
  ],

  function (Arr, Body, Class, Element, Insert, Remove, Resize, Width, Monitors, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var div = Element.fromTag('div');
    Insert.append(Body.body(), div);

    var handler = function () { };
    Resize.bind(div, handler);
    Remove.remove(div);
    Resize.unbind(div, handler);

    setTimeout(function () {
      if (Monitors.query(div).isSome()) {
        failure('Monitor added to div after resize was unbound');
      } else {
        success();
      }
    }, 200); // assumes the resize code still uses 100
  }
);