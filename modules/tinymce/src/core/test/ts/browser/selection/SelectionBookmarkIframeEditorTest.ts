import { Assertions, Cursors, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Hierarchy, Html, SugarElement } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest(
  'browser.tinymce.core.selection.SelectionBookmarkIframeEditorTest',
  (success, failure) => {

    Theme();
    const testDivId = 'testDiv1234';

    const sRemoveTestDiv = Step.sync(() => {
      const input = document.querySelector('#' + testDivId);
      input.parentNode.removeChild(input);
    });

    const sAddTestDiv = Step.sync(() => {
      const div = document.createElement('div');
      div.innerHTML = 'xxx';
      div.contentEditable = 'true';
      div.id = testDivId;
      document.body.appendChild(div);
    });

    const focusDiv = () => {
      const input: any = document.querySelector('#' + testDivId);
      input.focus();
    };

    const setSelection = (editor, start, soffset, finish, foffset) => {
      const sc = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), start).getOrDie();
      const fc = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), start).getOrDie();

      const rng = document.createRange();
      rng.setStart(sc.dom, soffset);
      rng.setEnd(fc.dom, foffset);

      editor.selection.setRng(rng);
    };

    const assertPath = (label, root, expPath, expOffset, actElement, actOffset) => {
      const expected = Cursors.calculateOne(root, expPath);
      const message = () => {
        const actual = SugarElement.fromDom(actElement);
        const actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
        return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
      };
      Assertions.assertEq(() => 'Assert incorrect for ' + label + '.\n' + message(), true, expected.dom === actElement);
      Assertions.assertEq(() => 'Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
    };

    const assertSelection = (editor, startPath, soffset, finishPath, foffset) => {
      const actual = editor.selection.getRng();
      const root = SugarElement.fromDom(editor.getBody());
      assertPath('start', root, startPath, soffset, actual.startContainer, actual.startOffset);
      assertPath('finish', root, finishPath, foffset, actual.endContainer, actual.endOffset);
    };

    TinyLoader.setupLight((editor, onSuccess, onFailure) => {
      const browser = PlatformDetection.detect().browser;
      Pipeline.async({}, browser.isIE() ? [ // Only run on IE
        sAddTestDiv,
        Logger.t('assert selection after no nodechanged, should not restore', Step.sync(() => {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
          editor.nodeChanged();

          setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
          focusDiv();

          assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 0);
        })),
        Logger.t('assert selection after nodechanged, should restore', Step.sync(() => {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [ 0 ], 0, [ 0 ], 0);
          editor.nodeChanged();

          setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
          editor.nodeChanged();
          focusDiv();

          assertSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
        })),
        Logger.t('assert selection after keyup, should restore', Step.sync(() => {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [ 0 ], 0, [ 0 ], 0);
          editor.nodeChanged();

          setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
          editor.fire('keyup', { });
          focusDiv();

          assertSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
        })),
        Logger.t('assert selection after mouseup, should restore', Step.sync(() => {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [ 0 ], 0, [ 0 ], 0);
          editor.nodeChanged();

          setSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
          editor.fire('mouseup', { });
          focusDiv();

          assertSelection(editor, [ 1, 0 ], 1, [ 1, 0 ], 1);
        })),
        sRemoveTestDiv
      ] : [], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      base_url: '/project/tinymce/js/tinymce'
    }, success, failure);
  }
);
