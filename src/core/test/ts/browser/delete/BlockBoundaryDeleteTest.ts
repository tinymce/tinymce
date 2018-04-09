import { ApproxStructure, Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import BlockBoundaryDelete from 'tinymce/core/delete/BlockBoundaryDelete';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.delete.BlockBoundaryDeleteTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sDelete = function (editor) {
    return Step.sync(function () {
      const returnVal = BlockBoundaryDelete.backspaceDelete(editor, true);
      Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
    });
  };

  const sDeleteNoop = function (editor) {
    return Step.sync(function () {
      const returnVal = BlockBoundaryDelete.backspaceDelete(editor, true);
      Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
    });
  };

  const sBackspace = function (editor, forward?) {
    return Step.sync(function () {
      const returnVal = BlockBoundaryDelete.backspaceDelete(editor, false);
      Assertions.assertEq('Should return true since the operation should have done something', true, returnVal);
    });
  };

  const sBackspaceNoop = function (editor, forward?) {
    return Step.sync(function () {
      const returnVal = BlockBoundaryDelete.backspaceDelete(editor, false);
      Assertions.assertEq('Should return false since the operation is a noop', false, returnVal);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Logger.t('Backspace in same block should remain unchanged', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([0, 0], 1),
        sBackspaceNoop(editor),
        tinyApis.sAssertContent('<p>a</p>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Delete in same block should remain unchanged', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p>'),
        tinyApis.sSetCursor([0, 0], 1),
        sDeleteNoop(editor),
        tinyApis.sAssertContent('<p>a</p>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Backspace between blocks with different parents should not merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><div><p>b</p></div>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        sBackspaceNoop(editor),
        tinyApis.sAssertContent('<p>a</p><div><p>b</p></div>'),
        tinyApis.sAssertSelection([1, 0, 0], 0, [1, 0, 0], 0)
      ])),
      Logger.t('Delete between blocks with different parents should not merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><div><p>b</p></div>'),
        tinyApis.sSetCursor([0, 0], 1),
        sDeleteNoop(editor),
        tinyApis.sAssertContent('<p>a</p><div><p>b</p></div>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Backspace between textblock and non text block should not merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><ul><li>b</li></ul>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        sBackspaceNoop(editor),
        tinyApis.sAssertContent('<p>a</p><ul><li>b</li></ul>'),
        tinyApis.sAssertSelection([1, 0, 0], 0, [1, 0, 0], 0)
      ])),
      Logger.t('Delete between textblock and non text block should not merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><ul><li>b</li></ul>'),
        tinyApis.sSetCursor([0, 0], 1),
        sDeleteNoop(editor),
        tinyApis.sAssertContent('<p>a</p><ul><li>b</li></ul>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Backspace on range between blocks should not merge (handled elsewhere)', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><p>b</p>'),
        tinyApis.sSetSelection([0, 0], 1, [1, 0], 0),
        sBackspaceNoop(editor),
        tinyApis.sAssertContent('<p>a</p><p>b</p>'),
        tinyApis.sAssertSelection([0, 0], 1, [1, 0], 0)
      ])),
      Logger.t('Delete on range between blocks should not merge (handled elsewhere)', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><p>b</p>'),
        tinyApis.sSetSelection([0, 0], 1, [1, 0], 0),
        sDeleteNoop(editor),
        tinyApis.sAssertContent('<p>a</p><p>b</p>'),
        tinyApis.sAssertSelection([0, 0], 1, [1, 0], 0)
      ])),
      Logger.t('Backspace between simple blocks should merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><p>b</p>'),
        tinyApis.sSetCursor([1, 0], 0),
        sBackspace(editor),
        tinyApis.sAssertContent('<p>ab</p>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Delete between simple blocks should merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a</p><p>b</p>'),
        tinyApis.sSetCursor([0, 0], 1),
        sDelete(editor),
        tinyApis.sAssertContent('<p>ab</p>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Backspace between complex blocks should merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>a<em>b</em></p><p><em>c</em>d</p>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        sBackspace(editor),
        tinyApis.sAssertContent('<p>a<em>b</em><em>c</em>d</p>'),
        tinyApis.sAssertSelection([0, 1, 0], 1, [0, 1, 0], 1)
      ])),
      Logger.t('Delete between complex blocks should merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><em>a</em>b</p><p>c<em>d</em></p>'),
        tinyApis.sSetCursor([0, 1], 1),
        sDelete(editor),
        tinyApis.sAssertContent('<p><em>a</em>bc<em>d</em></p>'),
        tinyApis.sAssertSelection([0, 1], 1, [0, 1], 1)
      ])),
      Logger.t('Backspace from red span to h1 should merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<h1>a</h1><p><span style="color: red;">b</span></p>'),
        tinyApis.sSetCursor([1, 0, 0], 0),
        sBackspace(editor),
        tinyApis.sAssertContent('<h1>a<span style="color: red;">b</span></h1>'),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Delete from red span to h1 should merge', GeneralSteps.sequence([
        tinyApis.sSetContent('<p><span style="color: red;">a</span></p><h1>b</h1>'),
        tinyApis.sSetCursor([0, 0, 0], 1),
        sDelete(editor),
        tinyApis.sAssertContent('<p><span style="color: red;">a</span>b</p>'),
        tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
      ])),
      Logger.t('Backspace from block into block with trailing br should merge', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p>a<br></p><p>b</p>'),
        tinyApis.sSetCursor([1, 0], 0),
        sBackspace(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a')),
                    s.text(str.is('b'))
                  ]
                })
              ]
            });
          })
        ),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Delete from block into block with trailing br should merge', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p>a<br></p><p>b</p>'),
        tinyApis.sSetCursor([0, 0], 1),
        sDelete(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a')),
                    s.text(str.is('b'))
                  ]
                })
              ]
            });
          })
        ),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Backspace from empty block into content block should merge', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p>a</p><p><br></p>'),
        tinyApis.sSetCursor([1], 0),
        sBackspace(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a'))
                  ]
                })
              ]
            });
          })
        ),
        tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Delete from empty block into content block should merge', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><br></p><p>a</p>'),
        tinyApis.sSetCursor([0], 0),
        sDelete(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.text(str.is('a'))
                  ]
                })
              ]
            });
          })
        ),
        tinyApis.sAssertSelection([0, 0], 0, [0, 0], 0)
      ])),
      Logger.t('Backspace between empty blocks should merge', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><br></p><p><br></p>'),
        tinyApis.sSetCursor([1], 0),
        sBackspace(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('br', {})
                  ]
                })
              ]
            });
          })
        ),
        tinyApis.sAssertSelection([0], 0, [0], 0)
      ])),
      Logger.t('Delete between empty blocks should merge', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><br></p><p><br></p>'),
        tinyApis.sSetCursor([0], 0),
        sDelete(editor),
        tinyApis.sAssertContentStructure(
          ApproxStructure.build(function (s, str, arr) {
            return s.element('body', {
              children: [
                s.element('p', {
                  children: [
                    s.element('br', {})
                  ]
                })
              ]
            });
          })
        ),
        tinyApis.sAssertSelection([0], 0, [0], 0)
      ]))
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',
    indent: false
  }, success, failure);
});
