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
    'tinymce.core.ui.Api'
  ],

  function (Fun, Insert, Body, Element, Error, window, DOMUtils, EditorManager, ThemeManager, Api) {
    var fail = function (message) {
      throw new Error(message);
    };

    ThemeManager.add('mobile', function (editor) {
      
      var renderUI = function () {
        var skinUrl = EditorManager.baseURL + editor.settings.skin_url;
        DOMUtils.DOM.styleSheetLoader.load(skinUrl + '/skin.min.css', Fun.noop);
        
        var editorContainer = Element.fromTag('div');
        var iframeContainer = Element.fromTag('div');

        Insert.append(editorContainer, iframeContainer);

        Insert.append(Body.body(), editorContainer);

        return {
          iframeContainer: iframeContainer.dom(),
          editorContainer: editorContainer.dom()
        };

      };
      // renderUI: function (args) {


      //       var fireSkinLoaded = function () {
      //         if (ed.initialized) {
      //           ed.fire('SkinLoaded');
      //         } else {
      //           ed.on('init', function() { 
      //             ed.fire('SkinLoaded');
      //           });
      //         }
      //       };

      //       ed.on('SkinLoaded', function () {
      //         // var mode = ViewModes.enter(container.gui().element(), function () {
      //         //   return Option.from(
      //         //     Element.fromDom(content.element().dom().querySelector('iframe').contentWindow.document.body)
      //         //   );
      //         // });
      //       });

      //       var container = IosContainer({
      //         lazySink: lazySink,
      //         onTap: function () {
      //           // if (ed.initialized) {
      //           //   onTap();
      //           // } else {
      //           //   ed.on('init', onTap);
      //           // }
      //         }
      //       });

      //       var skinUrl = EditorManager.baseURL + '/skins/' + 'lightgray';
      //       DOM.styleSheetLoader.load(skinUrl + '/skin.min.css', fireSkinLoaded);

      return {
        renderUI: renderUI
      };
    });

    Api.appendTo(window.tinymce ? window.tinymce : {});

    return function () { };

  }
);
