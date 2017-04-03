define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'global!Error',
    'global!window',
    'tinymce.core.EditorManager',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.FontSizeSlider',
    'tinymce.themes.mobile.ui.IosContainer',
    'tinymce.themes.mobile.util.FormatChangers'
  ],

  function (Cell, Fun, Element, Error, window, EditorManager, ThemeManager, Api, Styles, Buttons, FontSizeSlider, IosContainer, FormatChangers) {
    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var contentCssUrl = EditorManager.baseURL + editor.settings.content_css_url;

        editor.contentCSS.push(contentCssUrl + '/content.css');


        var ios = IosContainer();
        args.targetNode.ownerDocument.body.appendChild(ios.element().dom());

        editor.on('init', function () {
          ios.init({
            editor: {
              getFrame: function () {
                return Element.fromDom(editor.contentAreaContainer.querySelector('iframe'));
              },

              onDomChanged: function () {
                return {
                  unbind: Fun.noop
                };
              },

              onTapContent: function () {
                ios.restoreToolbar();
              }
            },
            container: Element.fromDom(editor.editorContainer),
            socket: Element.fromDom(editor.contentAreaContainer),
            toolstrip: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolstrip'))),
            toolbar: Element.fromDom(editor.editorContainer.querySelector('.' + Styles.resolve('toolbar')))
          });

          var mainGroups = Cell([
            {
              label: 'The first group',
              scrollable: false,
              items: [
                Buttons.forToolbar('back', function (btn) {
                  ios.exit();
                }, { }, { })
              ]
            },
            {
              label: 'the action group',
              scrollable: true,
              items: [
                Buttons.forToolbarCommand(editor, 'undo', { }, { }),
                Buttons.forToolbarStateCommand(editor, 'bold'),
                Buttons.forToolbarStateCommand(editor, 'italic'),
                FontSizeSlider.sketch(ios, editor)
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

          ios.setToolbarGroups(mainGroups.get());

          // Investigate ways to keep in sync with the ui
          FormatChangers.init(ios, editor);
        });

        return {
          iframeContainer: ios.socket().element().dom(),
          editorContainer: ios.element().dom()
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
