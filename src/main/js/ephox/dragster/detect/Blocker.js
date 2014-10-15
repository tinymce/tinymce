define(
  'ephox.dragster.detect.Blocker',

  [
    'ephox.dragster.style.Styles',
    'ephox.highway.Merger',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Remove'
  ],

  function (Styles, Merger, Attr, Class, Css, Element, Remove) {

    return function (options) {
      var settings = Merger.merge({
        'layerClass': Styles.resolve('blocker')
      }, options);

      var div = Element.fromTag('div');
      Css.setAll(div, {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      });

      Class.add(div, Styles.resolve('blocker'));
      Class.add(div, settings.layerClass);

      Attr.set(div, 'tabindex', -1);

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
