asynctest(
  'browser.tinymce.core.init.InitEditorThemeFunctionInlineTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorFind',
    'global!document'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, Insert, Element, SelectorFind, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Tests if the editor is responsive after setting theme to a function', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sAssertContent('<p>a</p>')
        ])),
        Logger.t('Editor element properties', Step.sync(function () {
          var body = Element.fromDom(document.body);
          var targetElement = SelectorFind.descendant(body, '#' + editor.id).getOrDie('No elm');
          var editorElement = SelectorFind.descendant(body, '#' + editor.id + '_parent').getOrDie('No elm');

          Assertions.assertDomEq('Should be expected editor container element', editorElement, Element.fromDom(editor.editorContainer));
          Assertions.assertDomEq('Should be expected editor body element', targetElement, Element.fromDom(editor.getBody()));
          Assertions.assertDomEq('Should be expected editor target element', targetElement, Element.fromDom(editor.getElement()));
          Assertions.assertEq('Should be undefined for inline mode', undefined, editor.contentAreaContainer);
        }))
      ], onSuccess, onFailure);
    }, {
      theme: function (editor, target) {
        var elm = Element.fromHtml('<div><button>B</button><div></div></div>');

        Insert.after(Element.fromDom(target), elm);

        return {
          editorContainer: elm.dom()
        };
      },
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      inline: true,
      init_instance_callback: function (editor) {
        editor.fire('SkinLoaded');
      }
    }, success, failure);
  }
);