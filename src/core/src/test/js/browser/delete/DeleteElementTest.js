asynctest(
  'browser.tinymce.core.delete.DeleteElementTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.DeleteElement',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, Hierarchy, Element, DeleteElement, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sDeleteElementPath = function (editor, forward, path) {
      return Step.sync(function () {
        var element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie();
        DeleteElement.deleteElement(editor, forward, element);
      });
    };

    var sAssertCaretDirection = function (editor, expectedCaretData) {
      return Step.sync(function () {
        Assertions.assertEq('Should have the right caret data', expectedCaretData, editor.selection.getNode().getAttribute('data-mce-caret'));
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Delete image forwards', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1"></p>'),
          tinyApis.sSetCursor([0], 0),
          sDeleteElementPath(editor, true, [0, 0]),
          tinyApis.sAssertContent(''),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),
        Logger.t('Delete image backwards', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1"></p>'),
          tinyApis.sSetCursor([0], 1),
          sDeleteElementPath(editor, false, [0, 0]),
          tinyApis.sAssertContent(''),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),
        Logger.t('Delete first image forwards caret before', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1"><img src="#2"></p>'),
          tinyApis.sSetCursor([0], 0),
          sDeleteElementPath(editor, true, [0, 0]),
          tinyApis.sAssertContent('<p><img src="#2" /></p>'),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),
        Logger.t('Delete first image forwards caret after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1"><img src="#2"></p>'),
          tinyApis.sSetCursor([0], 1),
          sDeleteElementPath(editor, true, [0, 0]),
          tinyApis.sAssertContent('<p><img src="#2" /></p>'),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),
        Logger.t('Delete first image backwards', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1"><img src="#2"></p>'),
          tinyApis.sSetCursor([0], 2),
          sDeleteElementPath(editor, false, [0, 0]),
          tinyApis.sAssertContent('<p><img src="#2" /></p>'),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),
        Logger.t('Delete second image forwards caret before', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1"><img src="#2"></p>'),
          tinyApis.sSetCursor([0], 1),
          sDeleteElementPath(editor, true, [0, 1]),
          tinyApis.sAssertContent('<p><img src="#1" /></p>'),
          tinyApis.sAssertSelection([0], 1, [0], 1)
        ])),
        Logger.t('Delete second image forwards caret after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1"><img src="#2"></p>'),
          tinyApis.sSetCursor([0], 2),
          sDeleteElementPath(editor, true, [0, 1]),
          tinyApis.sAssertContent('<p><img src="#1" /></p>'),
          tinyApis.sAssertSelection([0], 1, [0], 1)
        ])),
        Logger.t('Delete second image backwards caret before', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1"><img src="#2"></p>'),
          tinyApis.sSetCursor([0], 1),
          sDeleteElementPath(editor, false, [0, 1]),
          tinyApis.sAssertContent('<p><img src="#1" /></p>'),
          tinyApis.sAssertSelection([0], 1, [0], 1)
        ])),
        Logger.t('Delete second image backwards caret after', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1"><img src="#2"></p>'),
          tinyApis.sSetCursor([0], 2),
          sDeleteElementPath(editor, false, [0, 1]),
          tinyApis.sAssertContent('<p><img src="#1" /></p>'),
          tinyApis.sAssertSelection([0], 1, [0], 1)
        ])),
        Logger.t('Delete forwards on paragraph to next paragraph with caret position (text)', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          sDeleteElementPath(editor, true, [0]),
          tinyApis.sAssertContent('<p>b</p>'),
          tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
        ])),
        Logger.t('Delete backwards on paragraph to previous paragraph with caret position (text)', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetCursor([1, 0], 0),
          sDeleteElementPath(editor, false, [1]),
          tinyApis.sAssertContent('<p>a</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('Delete forwards on paragraph to previous paragraph with caret position (text)', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetCursor([1, 0], 1),
          sDeleteElementPath(editor, true, [1]),
          tinyApis.sAssertContent('<p>a</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('Delete backwards on paragraph to next paragraph with caret position (text)', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a</p><p>b</p>'),
          tinyApis.sSetCursor([0, 0], 0),
          sDeleteElementPath(editor, false, [0]),
          tinyApis.sAssertContent('<p>b</p>'),
          tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
        ])),
        Logger.t('Delete forwards paragraph before paragraph with caret position (element)', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1" /></p><p><img src="#2" /></p>'),
          tinyApis.sSetCursor([0], 1),
          sDeleteElementPath(editor, true, [0]),
          tinyApis.sAssertContent('<p><img src="#2" /></p>'),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),
        Logger.t('Delete backwards paragraph after paragraph with caret position (element)', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><img src="#1" /></p><p><img src="#2" /></p>'),
          tinyApis.sSetCursor([1], 0),
          sDeleteElementPath(editor, false, [0]),
          tinyApis.sAssertContent('<p><img src="#2" /></p>'),
          tinyApis.sAssertSelection([0], 0, [0], 0)
        ])),
        Logger.t('Delete backwards on cef block between cef blocks', GeneralSteps.sequence([
          tinyApis.sSetContent('<p contenteditable="false">a</p><p contenteditable="false">b</p><p contenteditable="false">c</p>'),
          tinyApis.sSetSelection([], 1, [], 2),
          sDeleteElementPath(editor, false, [1]),
          tinyApis.sAssertContent('<p contenteditable="false">a</p><p contenteditable="false">c</p>'),
          tinyApis.sAssertSelection([1], 0, [1], 0),
          sAssertCaretDirection(editor, 'after')
        ])),
        Logger.t('Delete forwards on cef block between cef blocks', GeneralSteps.sequence([
          tinyApis.sSetContent('<p contenteditable="false">a</p><p contenteditable="false">b</p><p contenteditable="false">c</p>'),
          tinyApis.sSetSelection([], 1, [], 2),
          sDeleteElementPath(editor, true, [1]),
          tinyApis.sAssertContent('<p contenteditable="false">a</p><p contenteditable="false">c</p>'),
          tinyApis.sAssertSelection([1], 0, [1], 0),
          sAssertCaretDirection(editor, 'before')
        ])),
        Logger.t('Delete element adjacent text nodes forward', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<br>b</p>'),
          tinyApis.sSetCursor([0, 0], 1),
          sDeleteElementPath(editor, true, [0, 1]),
          tinyApis.sAssertContent('<p>ab</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('Delete element adjacent text nodes backwards', GeneralSteps.sequence([
          tinyApis.sSetContent('<p>a<br>b</p>'),
          tinyApis.sSetCursor([0, 2], 0),
          sDeleteElementPath(editor, false, [0, 1]),
          tinyApis.sAssertContent('<p>ab</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ]))
      ], onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      indent: false,
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);