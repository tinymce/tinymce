asynctest(
  'browser.tinymce.core.ClickContentEditableFalseTest',
  [
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.test.TypeText',
    'tinymce.themes.modern.Theme'
  ],
  function (GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, Hierarchy, Element, TypeText, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sClickMiddleOf = function (editor, elementPath) {
      return Step.sync(function () {
        var element = Hierarchy.follow(Element.fromDom(editor.getBody()), elementPath).getOrDie().dom();
        var rect = element.getBoundingClientRect();
        var clientX = (rect.left + rect.width / 2), clientY = (rect.top + rect.height / 2);

        editor.fire('mousedown', { target: element, clientX: clientX, clientY: clientY });
        editor.fire('mouseup', { target: element, clientX: clientX, clientY: clientY });
        editor.fire('click', { target: element, clientX: clientX, clientY: clientY });
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Click on content editable false', GeneralSteps.sequence([
          tinyApis.sSetContent('<p contenteditable="false">a</p>'),
          sClickMiddleOf(editor, [0]),
          tinyApis.sAssertSelection([], 0, [], 1)
        ])),
        Logger.t('Click on content editable false inside content editable true', GeneralSteps.sequence([
          tinyApis.sSetContent('<div contenteditable="true"><p contenteditable="false">a</p></div>'),
          sClickMiddleOf(editor, [0, 0]),
          tinyApis.sAssertSelection([0], 0, [0], 1)
        ])),
        Logger.t('Click on content editable true inside content editable false', GeneralSteps.sequence([
          tinyApis.sSetContent('<div contenteditable="false"><p contenteditable="true">a</p></div>'),
          sClickMiddleOf(editor, [0, 0]),
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ])),
        Logger.t('Click on content editable false inside content editable true and then on content editable true and type', GeneralSteps.sequence([
          tinyApis.sSetContent('<div contenteditable="true"><p contenteditable="false">a</p><p>b</p></div>'),
          sClickMiddleOf(editor, [0, 0]),
          sClickMiddleOf(editor, [0, 1]),
          tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1),
          TypeText.sTypeContentAtSelection(Element.fromDom(editor.getDoc()), 'c'),
          tinyApis.sAssertContent('<div contenteditable="true"><p contenteditable="false">a</p><p>bc</p></div>'),
          tinyApis.sAssertSelection([0, 1, 0], 2, [0, 1, 0], 2)
        ])),
        Logger.t('Click on content editable false then outside on content editable inherit', GeneralSteps.sequence([
          tinyApis.sSetContent('<p contenteditable="false">a</p><p>a</p>'),
          sClickMiddleOf(editor, [0]),
          sClickMiddleOf(editor, [1]),
          tinyApis.sAssertSelection([1, 0], 1, [1, 0], 1)
        ]))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      indent: false
    }, success, failure);
  }
);