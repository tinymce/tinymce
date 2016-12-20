define(
  'ephox.sugar.api.properties.Checked',

  [
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (SelectorFind) {
    var set = function (element, status) {
      element.dom().checked = status;
    };

    var find = function (parent) {
      // :checked selector requires IE9
      // http://www.quirksmode.org/css/selectors/#t60
      return SelectorFind.descendant(parent, 'input:checked');
    };

    return {
      set: set,
      find: find
    };
  }
);
