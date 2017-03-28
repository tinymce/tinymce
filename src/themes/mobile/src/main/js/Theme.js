define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.alloy.api.component.GuiFactory',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'global!Error',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.EditorManager',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.ui.Buttons',
    'tinymce.themes.mobile.ui.IosContainer'
  ],

  function (GuiFactory, Cell, Fun, Element, Error, window, DOMUtils, EditorManager, ThemeManager, Api, Styles, Buttons, IosContainer) {
    var fail = function (message) {
      throw new Error(message);
    };

    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var contentCssUrl = EditorManager.baseURL + editor.settings.content_css_url;

        editor.contentCSS.push(contentCssUrl + '/content.css');


        var ios = IosContainer();
        args.targetNode.ownerDocument.body.appendChild(ios.element().dom());

        var sink = GuiFactory.build({
          dom: {
            tag: 'div',
            classes: [ Styles.resolve('floating-layouts') ],
            styles: {
              'z-index': '100'
            }
          },
          behaviours: {
            positioning: {
              useFixed: true
            }
          }
        });

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
                })              ]
            },
            {
              label: 'the action group',
              scrollable: true,
              items: [
                Buttons.forToolbarCommand(editor, 'undo'),
                Buttons.forToolbarCommand(editor, 'bold'),
                Buttons.forToolbarCommand(editor, 'italic')
              ]
            },
            {
              label: 'The extra group',
              scrollable: false,
              items: [
                
              ]
            }
          ]);

          ios.setToolbarGroups(mainGroups.get());
          ios.system().add(sink);
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
