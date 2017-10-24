asynctest(
  'browser.tinymce.core.init.InitEditorNoThemeInlineTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Traverse',
    'global!document'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, Element, SelectorFind, Traverse, document) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        Logger.t('Tests if the editor is responsive after setting theme to false', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p>'),
          tinyApis.sAssertContent('<p>a</p>')
        ])),
        Logger.t('Editor element properties', Step.sync(function () {
          var body = Element.fromDom(document.body);
          var targetElement = SelectorFind.descendant(body, '#' + editor.id).getOrDie('No elm');
          var nextElement = Traverse.nextSibling(targetElement);

          Assertions.assertEq('Should be null since inline has no editorContainer', null, editor.editorContainer);
          Assertions.assertDomEq('Should be expected editor body element', targetElement, Element.fromDom(editor.getBody()));
          Assertions.assertDomEq('Should be expected editor target element', targetElement, Element.fromDom(editor.getElement()));
          Assertions.assertEq('Should be undefined for inline mode', undefined, editor.contentAreaContainer);
          Assertions.assertEq('Should be no element after target', true, nextElement.isNone());
        }))
      ], onSuccess, onFailure);
    }, {
      theme: false,
      inline: true,
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      init_instance_callback: function (editor) {
        editor.fire('SkinLoaded');
      }
    }, success, failure);
  }
);