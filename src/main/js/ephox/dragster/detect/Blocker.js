define(
  'ephox.dragster.detect.Blocker',

  [
    'ephox.dragster.style.Styles',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css'
  ],

  function (Styles, Merger, Remove, Element, Attr, Class, Css) {
    return function (options) {
      var settings = Merger.merge({
        'layerClass': Styles.resolve('blocker')
      }, options);

      var div = Element.fromTag('div');
      Attr.set(div, 'role', 'presentation');
      Css.setAll(div, {
        position: 'fixed',
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%'
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
