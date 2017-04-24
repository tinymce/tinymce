asynctest(
  'browser.tinymce.core.keyboard.TypeTextAtCef',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyActions',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.node.Element',
    'tinymce.core.test.TypeText',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Keys, Logger, Pipeline, Step, TinyActions, TinyApis, TinyLoader, Element, TypeText, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);
      var tinyActions = TinyActions(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Type text before cef inline element', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><span contenteditable="false">a</span></p>'),
          tinyApis.sSelect('p', [0]),
          tinyActions.sContentKeystroke(Keys.left(), {}),
          TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'bc'),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2),
          tinyApis.sAssertContent('<p>bc<span contenteditable="false">a</span></p>')
        ])),
        Logger.t('Type after cef inline element', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><span contenteditable="false">a</span></p>'),
          tinyApis.sSelect('p', [0]),
          tinyActions.sContentKeystroke(Keys.right(), {}),
          TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'bc'),
          tinyApis.sAssertSelection([0, 1], 3, [0, 1], 3),
          tinyApis.sAssertContent('<p><span contenteditable="false">a</span>bc</p>')
        ]))
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);