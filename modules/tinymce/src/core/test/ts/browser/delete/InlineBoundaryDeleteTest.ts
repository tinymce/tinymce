import { ApproxStructure, Assertions, GeneralSteps, Keys, Logger, Pipeline, Step } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import BoundaryLocation from 'tinymce/core/keyboard/BoundaryLocation';
import InlineUtils from 'tinymce/core/keyboard/InlineUtils';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.delete.InlineBoundaryDeleteTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const locationName = function (location) {
    return location.fold(
      Fun.constant('before'),
      Fun.constant('start'),
      Fun.constant('end'),
      Fun.constant('after')
    );
  };

  const readLocation = function (editor) {
    const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
    return BoundaryLocation
      .readLocation(isInlineTarget, editor.getBody(), CaretPosition.fromRangeStart(editor.selection.getRng()))
      .map(locationName)
      .getOr('none');
  };

  const sTestDeleteOrBackspaceKey = function (editor, tinyApis, tinyActions, key) {
    return function (setupHtml, setupPath, setupOffset, expectedHtml, expectedLocation, expectedPath, expectedOffet) {
      return GeneralSteps.sequence([
        tinyApis.sSetContent(setupHtml),
        tinyApis.sSetCursor(setupPath, setupOffset),
        tinyApis.sNodeChanged,
        tinyActions.sContentKeystroke(key, { }),
        tinyApis.sAssertContent(expectedHtml),
        Step.sync(function () {
          Assertions.assertEq('Should be expected location', expectedLocation, readLocation(editor));
        }),
        tinyApis.sAssertSelection(expectedPath, expectedOffet, expectedPath, expectedOffet),
        sNormalizeBody(editor)
      ]);
    };
  };

  const sNormalizeBody = function (editor) {
    return Step.sync(function () {
      editor.getBody().normalize();
    });
  };

  const paragraphWithText = function (text) {
    return ApproxStructure.build(function (s, str, arr) {
      return s.element('body', {
        children: [s.element('p', { children: [s.text(str.is(text))] })]
      });
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);
    const sTestBackspace = sTestDeleteOrBackspaceKey(editor, tinyApis, tinyActions, Keys.backspace());
    const sTestDelete = sTestDeleteOrBackspaceKey(editor, tinyApis, tinyActions, 46);

    Pipeline.async({}, [
      tinyApis.sFocus,
      Logger.t('Backspace key on text', GeneralSteps.sequence([
        sTestBackspace('<p>a<a href="#">b</a>c</p>', [0, 2], 0, '<p>a<a href="#">b</a>c</p>', 'end', [0, 1, 0], 1),
        sTestBackspace('<p>a<a href="#">b</a>c</p>', [0, 1, 0], 0, '<p>a<a href="#">b</a>c</p>', 'before', [0, 0], 1),
        sTestBackspace('<p>a<a href="#">bc</a>d</p>', [0, 1, 0], 1, '<p>a<a href="#">c</a>d</p>', 'start', [0, 1, 0], 1)
      ])),
      Logger.t('Backspace key on image', GeneralSteps.sequence([
        sTestBackspace('<p>a<a href="#"><img src="#" /></a>c</p>', [0, 2], 0, '<p>a<a href="#"><img src="#" /></a>c</p>', 'end', [0, 1, 1], 0),
        sTestBackspace('<p>a<a href="#"><img src="#" /></a>c</p>', [0, 1], 0, '<p>a<a href="#"><img src="#" /></a>c</p>', 'before', [0, 0], 1),
        tinyApis.sExecCommand('SelectAll'), // Needed for IE 11 for some odd reason the selection api is in some odd state
        sTestBackspace('<p>a<a href="#"><img src="#" />c</a>d</p>', [0, 1], 1, '<p>a<a href="#">c</a>d</p>', 'start', [0, 1, 0], 1)
      ])),
      Logger.t('Delete key on text', GeneralSteps.sequence([
        sTestDelete('<p>a<a href="#">b</a>c</p>', [0, 0], 1, '<p>a<a href="#">b</a>c</p>', 'start', [0, 1, 0], 1),
        sTestDelete('<p>a<a href="#">b</a>c</p>', [0, 1, 0], 1, '<p>a<a href="#">b</a>c</p>', 'after', [0, 2], 1),
        sTestDelete('<p>a<a href="#">bc</a>d</p>', [0, 1, 0], 1, '<p>a<a href="#">b</a>d</p>', 'end', [0, 1, 0], 1)
      ])),
      Logger.t('Delete key on image', GeneralSteps.sequence([
        sTestDelete('<p>a<a href="#"><img src="#" /></a>c</p>', [0, 0], 1, '<p>a<a href="#"><img src="#" /></a>c</p>', 'start', [0, 1, 0], 1),
        sTestDelete('<p>a<a href="#"><img src="#" /></a>c</p>', [0, 1], 1, '<p>a<a href="#"><img src="#" /></a>c</p>', 'after', [0, 2], 1),
        sTestDelete('<p>a<a href="#">b<img src="#" /></a>d</p>', [0, 1, 0], 1, '<p>a<a href="#">b</a>d</p>', 'end', [0, 1, 0], 1)
      ])),
      Logger.t('Backspace/delete last character', GeneralSteps.sequence([
        sTestDelete('<p>a<a href="#">b</a>c</p>', [0, 1, 0], 0, '<p>ac</p>', 'none', [0, 0], 1),
        sTestDelete('<p><img src="#1" /><a href="#">b</a><img src="#2" /></p>', [0, 1, 0], 0, '<p><img src="#1" /><img src="#2" /></p>', 'none', [0], 1),
        sTestDelete('<p>a<a href="#">b</a>c</p>', [0, 1, 0], 0, '<p>ac</p>', 'none', [0, 0], 1),
        tinyApis.sAssertContentStructure(paragraphWithText('ac')),
        sTestBackspace('<p>a<a href="#">b</a>c</p>', [0, 1, 0], 1, '<p>ac</p>', 'none', [0, 0], 1),
        tinyApis.sAssertContentStructure(paragraphWithText('ac')),
        sTestDelete('<p>a<a href="#"><img src="#1" /></a>c</p>', [0, 1], 0, '<p>ac</p>', 'none', [0, 0], 1),
        sTestBackspace('<p>a<a href="#"><img src="#1" /></a>c</p>', [0, 1], 1, '<p>ac</p>', 'none', [0, 0], 1)
      ])),
      Logger.t('Backspace/delete between blocks', GeneralSteps.sequence([
        sTestBackspace('<p><a href="#">a</a></p><p><a href="#">b</a></p>', [1], 0, '<p><a href="#">a</a><a href="#">b</a></p>', 'end', [0, 0, 0], 1),
        sTestDelete('<p><a href="#">a</a></p><p><a href="#">b</a></p>', [0], 1, '<p><a href="#">a</a><a href="#">b</a></p>', 'end', [0, 0, 0], 1)
      ])),
      Logger.t('Backspace key inline_boundaries: false', GeneralSteps.sequence([
        tinyApis.sSetSetting('inline_boundaries', false),
        sTestBackspace('<p>a<a href="#">b</a>c</p>', [0, 2], 0, '<p>a<a href="#">b</a>c</p>', 'after', [0, 2], 0),
        tinyApis.sSetSetting('inline_boundaries', true)
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
