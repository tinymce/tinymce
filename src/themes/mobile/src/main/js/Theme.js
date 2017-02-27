define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Element',
    'global!Error',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.EditorManager',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api',
    'tinymce.themes.mobile.ui.IosContainer'
  ],

  function (Fun, Element, Error, window, DOMUtils, EditorManager, ThemeManager, Api, IosContainer) {
    var fail = function (message) {
      throw new Error(message);
    };

    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var skinUrl = EditorManager.baseURL + editor.settings.skin_url;
        var contentCssUrl = EditorManager.baseURL + editor.settings.content_css_url;

        DOMUtils.DOM.styleSheetLoader.load(skinUrl + '/skin.min.css', Fun.noop);

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
              }
            },
            container: Element.fromDom(editor.editorContainer),
            socket: Element.fromDom(editor.contentAreaContainer),
            toolstrip: Element.fromDom(editor.editorContainer.querySelector('.mce-toolbar-grp')),
            toolbar: Element.fromDom(editor.editorContainer.querySelector('.mce-toolbar'))
          });
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
