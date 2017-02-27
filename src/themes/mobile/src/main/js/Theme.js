define(
  'tinymce.themes.mobile.Theme',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'global!Error',
    'global!window',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.EditorManager',
    'tinymce.core.ThemeManager',
    'tinymce.core.ui.Api',
    'tinymce.themes.mobile.ui.IosContainer'
  ],

  function (
    Fun, Insert, Body, Element, Error, window, DOMUtils, EditorManager, ThemeManager, Api,
    IosContainer
  ) {
    var fail = function (message) {
      throw new Error(message);
    };

    ThemeManager.add('mobile', function (editor) {
      var renderUI = function (args) {
        var skinUrl = EditorManager.baseURL + editor.settings.skin_url;
        DOMUtils.DOM.styleSheetLoader.load(skinUrl + '/skin.min.css', Fun.noop);

        var container = IosContainer();
        args.targetNode.ownerDocument.body.appendChild(container.element().dom());

        return {
          iframeContainer: container.socket().element().dom(),
          editorContainer: container.element().dom()
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
