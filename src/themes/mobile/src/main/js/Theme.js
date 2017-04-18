define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.node.Element',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api',
    'tinymce.themes.mobile.style.Styles',
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
    Cell, Fun, PlatformDetection, Element, window, DOMUtils, ThemeManager, Api, Styles, AndroidRealm, Buttons, ColorSlider, FontSizeSlider, ImagePicker, IosRealm,
    LinkButton, CssUrls, FormatChangers, SkinLoaded
  ) {
    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var cssUrls = CssUrls.derive(editor);

        editor.contentCSS.push(cssUrls.content);
        DOMUtils.DOM.styleSheetLoader.load(cssUrls.ui, SkinLoaded.fireSkinLoaded(editor));

        var realm = PlatformDetection.detect().os.isAndroid() ? AndroidRealm() : IosRealm();
        args.targetNode.ownerDocument.body.appendChild(realm.element().dom());

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
                editor.on('scrollIntoView', function (evt) {
                  handler(evt);
                  evt.preventDefault();
                });

                var unbind = function () {
                  editor.off('scrollIntoView');
                };

                return {
                  unbind: unbind
                };
              },

              onTapContent: function () {
                realm.restoreToolbar();
              }
            },
            container: Element.fromDom(editor.editorContainer),
            socket: Element.fromDom(editor.contentAreaContainer),
            toolstrip: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolstrip'))),
            toolbar: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar')))
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
                }, { })
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
