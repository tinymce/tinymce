define(
  'tinymce.themes.autochooser.Theme',

  [
    'ephox.katamari.api.Obj',
    'ephox.sand.api.PlatformDetection',
    'tinymce.core.ThemeManager',
    'tinymce.themes.mobile.Theme',
    'tinymce.themes.modern.Theme'
  ],

  function (Obj, PlatformDetection, ThemeManager, MobileTheme, ModernTheme) {
    MobileTheme();
    ModernTheme();

    var platform = PlatformDetection.detect();

    ThemeManager.add('autochooser', function (editor, themeUrl) {
      var theme = (function () {
        if (platform.deviceType.isTouch()) {
          return {
            instance: ThemeManager.lookup.mobile.instance,
            settings: {
              mobile_skin_url: editor.settings.autochooser_mobile_skin_url !== undefined ?
                editor.settings.autochooser_mobile_skin_url : (themeUrl + '/css')
            }
          };
        } else {
          return {
            instance: ThemeManager.lookup.modern.instance,
            settings: {
              skin_url: editor.settings.autochooser_modern_skin_url !== undefined ?
                editor.settings.autochooser_modern_skin_url : undefined
            }
          };
        }
      })();

      // Warning: mutation. We could merge here, but I'm worried that "this" might be used on settings somewhere.
      Obj.each(theme.settings, function (v, k) {
        editor.settings[k] = v;
      });
      return theme.instance(editor);
    });

    return function () { };
  }
);
