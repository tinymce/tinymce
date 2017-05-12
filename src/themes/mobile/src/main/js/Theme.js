define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.touch.view.Orientation',
    'tinymce.themes.mobile.ui.AndroidRealm',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.ColorSlider',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.ui.ImagePicker',
    'tinymce.themes.mobile.ui.IosRealm',
    'tinymce.themes.mobile.ui.LinkButton',
    'tinymce.themes.mobile.util.CssUrls',
    'tinymce.themes.mobile.util.FormatChangers',
    'tinymce.themes.mobile.util.SkinLoaded'
  ],


  function (
    SystemEvents, Cell, Fun, PlatformDetection, Focus, Element, Node, window, DOMUtils, ThemeManager, Api, Styles, Orientation, AndroidRealm, Buttons, ColorSlider,
    FontSizeSlider, ImagePicker, IosRealm, LinkButton, CssUrls, FormatChangers, SkinLoaded
  ) {
    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var cssUrls = CssUrls.derive(editor);

        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, SkinLoaded.fireSkinLoaded(editor));

        var realm = PlatformDetection.detect().os.isAndroid() ? AndroidRealm() : IosRealm();
        args.targetNode.ownerDocument.body.appendChild(realm.element().dom());

        var findFocusIn = function (elem) {
          return Focus.search(elem).bind(function (focused) {
            return realm.system().getByDom(focused).toOption();
          });
        };

        var orientation = Orientation.onChange({
          onChange: function () {
            var alloy = realm.system();
            alloy.broadcastOn(['orientation.change'], { width: Orientation.getActualWidth() });
          },
          onReady: Fun.noop
        });

        editor.on('init', function () {
          realm.init({
            editor: {
              getFrame: function () {
                return Element.fromDom(editor.contentAreaContainer.querySelector('iframe'));
              },

              onDomChanged: function () {
                return {
                  unbind: Fun.noop
                };
              },

              onScrollToCursor: function (handler) {
                editor.on('scrollIntoView', function (tinyEvent) {
                  handler(tinyEvent);
                });

                var unbind = function () {
                  editor.off('scrollIntoView');
                  orientation.destroy();
                };

                return {
                  unbind: unbind
                };
              },

              onTouchContent: function () {
                var toolbar = Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar')));
                // If something in the toolbar had focus, fire an execute on it (execute on tap away)
                // Perhaps it will be clearer later what is a better way of doing this.
                findFocusIn(toolbar).each(function (input) {
                  input.getSystem().triggerEvent(SystemEvents.execute(), input.element(), {
                    target: Fun.constant(input.element())
                  });
                });
                realm.restoreToolbar();
              },

              onTapContent: function (evt) {
                // If the user has tapped (touchstart, touchend without movement) on an image, select it.
                if (Node.name(evt.target()) === 'img') {
                  editor.selection.select(evt.target().dom());
                  // Prevent the default behaviour from firing so that the image stays selected
                  evt.kill();
                }
              }
            },
            container: Element.fromDom(editor.editorContainer),
            socket: Element.fromDom(editor.contentAreaContainer),
            toolstrip: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolstrip'))),
            toolbar: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar'))),
            alloy: realm.system()
          });

          var createHeadingButton = function (level) {
            return Buttons.forToolbarStateAction(editor, level, level, function () {
              editor.execCommand('FormatBlock', null, level);
            });
          };

          var mainGroups = Cell([
            {
              label: 'The first group',
              scrollable: false,
              items: [
                Buttons.forToolbar('back', function (/* btn */) {
                  realm.exit();
                }, {})
              ]
            },
            {
              label: 'the action group',
              scrollable: true,
              items: [
                Buttons.forToolbarCommand(editor, 'undo'),
                Buttons.forToolbarStateCommand(editor, 'bold'),
                Buttons.forToolbarStateCommand(editor, 'italic'),
                createHeadingButton('h1'),
                createHeadingButton('h2'),
                createHeadingButton('h3'),
                // NOTE: Requires "lists" plugin.
                Buttons.forToolbarStateAction(editor, 'unordered-list', 'ul', function () {
                  editor.execCommand('InsertUnorderedList', null, false);
                }),
                LinkButton.sketch(realm, editor),
                ImagePicker.sketch(editor),
                FontSizeSlider.sketch(realm, editor),
                ColorSlider.sketch(realm, editor)
              ]
            },
            {
              label: 'The extra group',
              scrollable: false,
              items: [
                // This is where the "add button" button goes.
              ]
            }
          ]);

          realm.setToolbarGroups(mainGroups.get());

          // Investigate ways to keep in sync with the ui
          FormatChangers.init(realm, editor);
        });

        return {
          iframeContainer: realm.socket().element().dom(),
          editorContainer: realm.element().dom()
        };
      };

      return {
        renderUI: renderUI
      };
    });

    Api.appendTo(window.tinymce ? window.tinymce : {});

    return function () { };

  }
);
