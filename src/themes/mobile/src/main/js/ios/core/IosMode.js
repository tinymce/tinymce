define(
  'tinymce.themes.mobile.ios.core.IosMode',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Singleton',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Css',
    'global!document',
    'tinymce.themes.mobile.ios.core.IosEvents',
    'tinymce.themes.mobile.ios.core.IosSetup',
    'tinymce.themes.mobile.ios.core.PlatformEditor',
    'tinymce.themes.mobile.ios.scroll.Scrollables',
    'tinymce.themes.mobile.ios.view.IosKeyboard',
    'tinymce.themes.mobile.util.Thor',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.scroll.Scrollable',
    'tinymce.themes.mobile.touch.view.MetaViewport'
  ],

  function (
    Fun, Singleton, Struct, Focus, Element, Class, Css, document, IosEvents, IosSetup,
    PlatformEditor, Scrollables, IosKeyboard, Thor, Styles, Scrollable, MetaViewport
  ) {
    var create = function (platform, mask) {
      var meta = MetaViewport.tag();

      var priorState = Singleton.value();
      var scrollEvents = Singleton.value();

      var iosApi = Singleton.api();
      var iosEvents = Singleton.api();

      var enter = function () {
        mask.hide();
        var doc = Element.fromDom(document);
        PlatformEditor.getActiveApi(platform.editor).each(function (editorApi) {
          // TODO: Orientation changes.
          // orientation = Orientation.onChange();

          priorState.set({
            socketHeight: Css.getRaw(platform.socket, 'height'),
            iframeHeight: Css.getRaw(editorApi.frame(), 'height'),
            outerScroll: document.body.scrollTop
          });

          scrollEvents.set({
            // Allow only things that have scrollable class to be scrollable. Without this,
            // the toolbar scrolling gets prevented
            exclusives: Scrollables.exclusive(doc, '.' + Scrollable.scrollable())
          });

          Class.add(platform.container, Styles.resolve('fullscreen-maximized'));
          Thor.clobberStyles(platform.container, editorApi.body());
          meta.maximize();

          /* NOTE: Making the toolbar scrollable is now done when the middle group is created */

          Css.set(platform.socket, 'overflow', 'scroll');
          Css.set(platform.socket, '-webkit-overflow-scrolling', 'touch');

          Focus.focus(editorApi.body());

          var setupBag = Struct.immutableBag([
            'cWin',
            'ceBody',
            'socket',
            'toolstrip',
            'toolbar',
            'dropup',
            'contentElement',
            'cursor',
            'keyboardType',
            'isScrolling',
            'outerWindow',
            'outerBody'
          ], []);

          iosApi.set(
            IosSetup.setup(setupBag({
              'cWin': editorApi.win(),
              'ceBody': editorApi.body(),
              'socket': platform.socket,
              'toolstrip': platform.toolstrip,
              'toolbar': platform.toolbar,
              'dropup': platform.dropup.element(),
              'contentElement': editorApi.frame(),
              'cursor': Fun.noop,
              'outerBody': platform.body,
              'outerWindow': platform.win,
              'keyboardType': IosKeyboard.stubborn,
              'isScrolling': function () {
                return scrollEvents.get().exists(function (s) {
                  return s.socket.isScrolling();
                });
              }
            }))
          );

          iosApi.run(function (api) {
            api.syncHeight();
          });


          iosEvents.set(
            IosEvents.initEvents(editorApi, iosApi, platform.toolstrip, platform.socket, platform.dropup)
          );
        });
      };

      var exit = function () {
        meta.restore();
        iosEvents.clear();
        iosApi.clear();

        mask.show();

        priorState.on(function (s) {
          s.socketHeight.each(function (h) {
            Css.set(platform.socket, 'height', h);
          });
          s.iframeHeight.each(function (h) {
            Css.set(platform.editor.getFrame(), 'height', h);
          });
          document.body.scrollTop = s.scrollTop;
        });
        priorState.clear();

        scrollEvents.on(function (s) {
          s.exclusives.unbind();
        });
        scrollEvents.clear();

        Class.remove(platform.container, Styles.resolve('fullscreen-maximized'));
        Thor.restoreStyles();
        Scrollable.deregister(platform.toolbar);

        Css.remove(platform.socket, 'overflow'/*, 'scroll'*/);
        Css.remove(platform.socket, '-webkit-overflow-scrolling'/*, 'touch'*/);

        // Hide the keyboard and remove the selection so there isn't a blue cursor in the content
        // still even once exited.
        Focus.blur(platform.editor.getFrame());

        PlatformEditor.getActiveApi(platform.editor).each(function (editorApi) {
          editorApi.clearSelection();
        });
      };

      // dropup
      var refreshStructure = function () {
        iosApi.run(function (api) {
          api.refreshStructure();
        });
      };

      return {
        enter: enter,
        refreshStructure: refreshStructure,
        exit: exit
      };
    };

    return {
      create: create
    };
  }
);
