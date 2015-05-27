define(
  'ephox.darwin.api.Ephemera',

  [
    'ephox.darwin.style.Styles',
    'ephox.peanut.Fun'
  ],

  function (Styles, Fun) {
    var selected = Styles.resolve('selected');
    var lastSelected = Styles.resolve('last-selected');
    var firstSelected = Styles.resolve('first-selected');

    return {
      selectedClass: Fun.constant(selected),
      lastSelectedClass: Fun.constant(lastSelected),
      firstSelectedClass: Fun.constant(firstSelected)
    };
  }
);