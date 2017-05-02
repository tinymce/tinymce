define(
  'tinymce.themes.mobile.android.core.AndroidMode',

  [
    'ephox.katamari.api.Singleton',
    'ephox.sugar.api.properties.Class',
    'global!window',
    'tinymce.themes.mobile.android.core.AndroidEvents',
    'tinymce.themes.mobile.android.core.AndroidSetup',
    'tinymce.themes.mobile.ios.core.PlatformEditor',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.view.MetaViewport'
  ],

  function (Singleton, Class, window, AndroidEvents, AndroidSetup, PlatformEditor, Styles, MetaViewport) {
    var create = function (platform, mask) {

      var meta = MetaViewport.tag();
      var androidApi = Singleton.api();

      var androidEvents = Singleton.api();

      var enter = function () {
        mask.hide();

        Class.add(platform.container, Styles.resolve('fullscreen-maximized'));
        Class.add(platform.container, Styles.resolve('android-maximized'));
        meta.maximize();

        /// TM-48 Prevent browser refresh by swipe/scroll on android devices
        Class.add(platform.editor.getBody(), Styles.resolve('android-scroll-reload'));

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

        /// TM-48 re-enable swipe/scroll browser refresh on android
        Class.remove(platform.editor.getBody(), Styles.resolve('android-scroll-reload'));

        androidEvents.clear();

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
