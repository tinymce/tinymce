define(
  'ephox.dragster.detect.Blocker',

  [
    'ephox.dragster.style.Styles',
    'ephox.highway.Merger',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Remove'
  ],

  function (Styles, Merger, Class, Css, Element, Remove) {
    return function (options) {
      var settings = Merger.merge({
        'layerClass': Styles.resolve('blocker')
      }, options);

      var div = Element.fromTag('div');
      Css.setAll(div, {
        position: 'fixed',
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%',
        opacity: '0.5'
      });

      Class.add(div, Styles.resolve('blocker'));
      Class.add(div, settings.layerClass);

      var element = function () {
        return div;
      };

      var destroy = function () {
        Remove.remove(div);
      };

      return {
        element: element,
        destroy: destroy
      };
    };
  }
);
