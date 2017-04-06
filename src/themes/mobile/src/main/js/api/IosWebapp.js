define(
  'tinymce.themes.mobile.api.IosWebapp',

  [
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.properties.Css',
    'tinymce.themes.mobile.api.MobileSchema',
    'tinymce.themes.mobile.ios.core.IosMode',
    'tinymce.themes.mobile.touch.view.TapToEditMask'
  ],

  function (ValueSchema, Fun, Insert, Css, MobileSchema, IosMode, TapToEditMask) {
    var produce = function (raw) {
      var mobile = ValueSchema.asRawOrDie(
        'Getting IosWebapp schema',
        MobileSchema,
        raw
      );

      /* Make the toolbar */
      Css.set(mobile.toolstrip, 'width', '100%');

      Css.set(mobile.container, 'position', 'relative');
      var onTap = function () {
        mask.hide();
        mode.enter();
      };

      var mask = TapToEditMask(onTap);

      Insert.append(mobile.container, mask.element());
      mask.show();

      var mode = IosMode.create(mobile, mask);

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
