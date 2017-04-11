define(
  'tinymce.themes.mobile.api.AndroidWebapp',

  [
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.android.core.AndroidMode',
    'tinymce.themes.mobile.api.MobileSchema',
    'tinymce.themes.mobile.touch.view.TapToEditMask'
  ],

  function (ValueSchema, Fun, Insert, Css, AndroidMode, MobileSchema, TapToEditMask) {
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
        mask.hide();
        mode.enter();
      };

      var mask = TapToEditMask(onTap);

      Insert.append(mobile.container, mask.element());
      mask.show();

      var mode = AndroidMode.create(mobile, mask);

      return {
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
