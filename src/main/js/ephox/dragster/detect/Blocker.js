define(
  'ephox.dragster.detect.Blocker',

  [
    'ephox.dragster.style.Styles',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element'
  ],

  function (Styles, Class, Css, Element) {

    return function () {

      var div = Element.fromTag('div');
      Css.setAll(div, {
        'z-index': 10000,
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      });

      Class.add(div, Styles.resolve('blocker'));

      return div;
    };


  }
);
