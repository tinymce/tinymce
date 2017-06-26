define(
  'tinymce.themes.autochooser.Theme',

  [
    'ephox.katamari.api.Obj',
    'ephox.sand.api.PlatformDetection',
    'tinymce.core.EditorManager',
    'tinymce.core.ThemeManager',
    'tinymce.themes.mobile.Theme',
    'tinymce.themes.modern.Theme'
  ],

  function (Obj, PlatformDetection, EditorManager, ThemeManager, MobileTheme, ModernTheme) {
    MobileTheme();
    ModernTheme();

    var platform = PlatformDetection.detect();

    // Warning: mutation. We could merge here, but I'm worried that "this" might be used on settings somewhere.
    var extendSettings = function (settings, theme) {
      Obj.each(theme.settings, function (v, k) {
        settings[k] = v;
      });
    };

    ThemeManager.add('autochooser', function (editor, themeUrl) {
      var theme = (function () {
        var skin = editor.settings.skin !== false ? editor.settings.skin || 'lightgray' : false;
        if (platform.deviceType.isTouch()) {
          return {
            instance: ThemeManager.get('mobile'),
            settings: {
              mobile_skin_url: editor.settings.autochooser_mobile_skin_url !== undefined ?
                editor.settings.autochooser_mobile_skin_url : EditorManager.baseURL + '/skins/' + skin
            }
          };
        } else {
          return {
            instance: ThemeManager.get('modern'),
            settings: {
              skin_url: editor.settings.autochooser_modern_skin_url !== undefined ?
                editor.settings.autochooser_modern_skin_url : undefined
            }
          };
        }
      })();

      extendSettings(editor.settings, theme);
      return theme.instance(editor);
    });

    return function () { };
  }
);