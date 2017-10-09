define(
  'tinymce.themes.mobile.util.CaptureBin',

  [
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Css'
  ],

  function (Focus, Insert, Remove, Element, Css) {
    var input = function (parent, operation) {
      // to capture focus allowing the keyboard to remain open with no 'real' selection
      var input = Element.fromTag('input');
      Css.setAll(input, {
        'opacity': '0',
        'position': 'absolute',
        'top': '-1000px',
        'left': '-1000px'
      });
      Insert.append(parent, input);

      Focus.focus(input);
      operation(input);
      Remove.remove(input);
    };

    return {
      input: input
    };
  }
);