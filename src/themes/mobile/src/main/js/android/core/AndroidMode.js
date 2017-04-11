define(
  'tinymce.themes.mobile.android.core.AndroidMode',

  [
    'ephox.katamari.api.Singleton',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'global!window',
    'tinymce.themes.mobile.android.core.AndroidEvents',
    'tinymce.themes.mobile.android.core.AndroidSetup',
    'tinymce.themes.mobile.ios.core.PlatformEditor',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.view.MetaViewport'
  ],

  function (Singleton, DomEvent, Element, Class, Css, window, AndroidEvents, AndroidSetup, PlatformEditor, Styles, MetaViewport) {
    var create = function (platform, mask) {

      var meta = MetaViewport.tag();
      var androidApi = Singleton.api();

      var androidEvents = Singleton.api();

      var enter = function () {
        mask.hide();

        Class.add(platform.container, Styles.resolve('fullscreen-maximized'));
        Class.add(platform.container, Styles.resolve('android-maximized'));
        // Thor.clobberStyles(platform.container, editorApi.body());
        meta.maximize();

        // Css.set(platform.socket, 'overflow', 'scroll');
        // Css.set(platform.socket, '-webkit-overflow-scrolling', 'touch');

        androidApi.set(
          AndroidSetup.setup(window, PlatformEditor.getWin(platform.editor).getOrDie('no'))
        );

        PlatformEditor.getActiveApi(platform.editor).each(function (editorApi) {
          androidEvents.set(
            AndroidEvents.initEvents(editorApi, platform.toolstrip)
          );
        });
      };

      var exit = function () {
        meta.restore();
        mask.show();
        Class.remove(platform.container, Styles.resolve('fullscreen-maximized'));
        Class.remove(platform.container, Styles.resolve('android-maximized'));

        androidEvents.clear();

        // Css.remove(platform.socket, 'overflow'/*, 'scroll'*/);
        // Css.remove(platform.socket, '-webkit-overflow-scrolling'/*, 'touch'*/);

        androidApi.clear();
      };

      return {
        enter: enter,
        exit: exit
      };
    };

    return {
      create: create
    };
  }
);
