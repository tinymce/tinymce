define(
  'tinymce.themes.mobile.api.IosWebapp',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.api.MobileSchema',
    'tinymce.themes.mobile.ios.core.IosMode',
    'tinymce.themes.mobile.touch.view.TapToEditMask'
  ],

  function (GuiFactory, ValueSchema, Fun, Css, MobileSchema, IosMode, TapToEditMask) {
    var produce = function (raw) {
      var mobile = ValueSchema.asRawOrDie(
        'Getting IosWebapp schema',
        MobileSchema,
        raw
      );

      /* Make the toolbar */
      Css.set(mobile.toolstrip, 'width', '100%');

      Css.set(mobile.container, 'position', 'relative');
      var onView = function () {
        mobile.setReadOnly(true);
        mode.enter();
      };

      var mask = GuiFactory.build(
        TapToEditMask.sketch(onView, mobile.translate)
      );

      mobile.alloy.add(mask);
      var maskApi = {
        show: function () {
          mobile.alloy.add(mask);
        },
        hide: function () {
          mobile.alloy.remove(mask);
        }
      };

      var mode = IosMode.create(mobile, maskApi);

      return {
        setReadOnly: mobile.setReadOnly,
        refreshStructure: mode.refreshStructure,
        enter: mode.enter,
        exit: mode.exit,
        destroy: Fun.noop
      };
    };

    return {
      produce: produce
    };
  }
);
