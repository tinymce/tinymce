define(
  'tinymce.themes.mobile.api.AndroidWebapp',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.android.core.AndroidMode',
    'tinymce.themes.mobile.api.MobileSchema',
    'tinymce.themes.mobile.touch.view.TapToEditMask'
  ],

  function (GuiFactory, ValueSchema, Fun, Insert, Css, AndroidMode, MobileSchema, TapToEditMask) {
    // TODO: Remove dupe with IosWebapp
    var produce = function (raw) {
      var mobile = ValueSchema.asRawOrDie(
        'Getting AndroidWebapp schema',
        MobileSchema,
        raw
      );

      /* Make the toolbar */
      Css.set(mobile.toolstrip, 'width', '100%');

      // We do not make the Android container relative, because we aren't positioning the toolbar absolutely.
      var onTap = function () {
        mobile.setReadOnly(true);
        mode.enter();
      };

      var mask = GuiFactory.build(
        TapToEditMask.sketch(onTap, mobile.translate)
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

      Insert.append(mobile.container, mask.element());

      var mode = AndroidMode.create(mobile, maskApi);

      return {
        setReadOnly: mobile.setReadOnly,
        // Not used.
        refreshStructure: Fun.noop,
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
