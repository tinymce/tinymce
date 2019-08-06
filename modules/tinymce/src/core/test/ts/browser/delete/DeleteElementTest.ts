import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Hierarchy, Element } from '@ephox/sugar';
import DeleteElement from 'tinymce/core/delete/DeleteElement';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.delete.DeleteElementTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sDeleteElementPath = function (editor, forward, path) {
    return Step.sync(function () {
      const element = Hierarchy.follow(Element.fromDom(editor.getBody()), path).getOrDie();
      DeleteElement.deleteElement(editor, forward, element);
    });
  };

  const sAssertCaretDirection = function (editor, expectedCaretData) {
    return Step.sync(function () {
      Assertions.assertEq('Should have the right caret data', expectedCaretData, editor.selection.getNode().getAttribute('data-mce-caret'));
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

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
      ])),
      Logger.t('Delete inline element adjacent text nodes forwards', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a <strong>b</strong> c</p>'),
        tinyApis.sSetCursor([0, 0], 2),
        sDeleteElementPath(editor, true, [0, 1]),
        tinyApis.sAssertContent('<p>a &nbsp;c</p>'),
        tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2)
      ])),
      Logger.t('Delete inline element adjacent text nodes backwards', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a&nbsp; <strong>b</strong> &nbsp;c</p>'),
        tinyApis.sSetCursor([0, 2], 0),
        sDeleteElementPath(editor, false, [0, 1]),
        tinyApis.sAssertContent('<p>a &nbsp; &nbsp;c</p>'),
        tinyApis.sAssertSelection([0, 0], 3, [0, 0], 3)
      ])),
      Logger.t('Delete inline element adjacent text nodes, single space', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a <strong>b</strong>c</p>'),
        tinyApis.sSetCursor([0, 1], 0),
        sDeleteElementPath(editor, false, [0, 1]),
        tinyApis.sAssertContent('<p>a c</p>'),
        tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2)
      ])),
      Logger.t('Delete inline element leading only text nodes', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a <strong>b</strong></p>'),
        tinyApis.sSetCursor([0, 1], 0),
        sDeleteElementPath(editor, false, [0, 1]),
        tinyApis.sAssertContent('<p>a&nbsp;</p>'),
        tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2)
      ])),
      Logger.t('Delete inline element trailing only text nodes', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><strong>a</strong> b</p>'),
        tinyApis.sSetCursor([0, 1], 0),
        sDeleteElementPath(editor, false, [0, 0]),
        tinyApis.sAssertContent('<p>&nbsp;b</p>'),
        tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
      ]))
    ], onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
