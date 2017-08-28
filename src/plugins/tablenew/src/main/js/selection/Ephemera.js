define(
  'tinymce.plugins.tablenew.selection.Ephemera',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    var selected = 'data-mce-selected';
    var selectedSelector = 'td[' + selected + '],th[' + selected + ']';
    var firstSelected = 'data-mce-first-selected';
    var lastSelected = 'data-mce-last-selected';
    return {
      selected: Fun.constant(selected),
      selectedSelector: Fun.constant(selectedSelector),
      firstSelected: Fun.constant(firstSelected),
      lastSelected: Fun.constant(lastSelected)
    };
  }
);
