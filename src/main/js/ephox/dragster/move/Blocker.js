define(
  'ephox.dragster.move.Blocker',

  [
    'ephox.sugar.Css',
    'ephox.sugar.Element'
  ],

  function (Css, Element) {

    return function () {

      var div = Element(document.createElement('div'));
      Css.setAll(div, {
        'z-index': 10000,
        position: 'fixed',
        width: '100%',
        height: '100%',
        'background-color': 'black'
      });

      return div;

    };


  }
);
