import { Assertions, Cursors, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Hierarchy, Element, Html } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest(
  'browser.tinymce.core.selection.SelectionBookmarkIframeEditorTest',
  function () {
    const success = arguments[arguments.length - 2];
    const failure = arguments[arguments.length - 1];

    Theme();
    const testDivId = 'testDiv1234';

    const sRemoveTestDiv = Step.sync(function () {
      const input = document.querySelector('#' + testDivId);
      input.parentNode.removeChild(input);
    });

    const sAddTestDiv = Step.sync(function () {
      const div = document.createElement('div');
      div.innerHTML = 'xxx';
      div.contentEditable = 'true';
      div.id = testDivId;
      document.body.appendChild(div);
    });

    const focusDiv = function () {
      const input: any = document.querySelector('#' + testDivId);
      input.focus();
    };

    const setSelection = function (editor, start, soffset, finish, foffset) {
      const sc = Hierarchy.follow(Element.fromDom(editor.getBody()), start).getOrDie();
      const fc = Hierarchy.follow(Element.fromDom(editor.getBody()), start).getOrDie();

      const rng = document.createRange();
      rng.setStart(sc.dom(), soffset);
      rng.setEnd(fc.dom(), foffset);

      editor.selection.setRng(rng);
    };

    const assertPath = function (label, root, expPath, expOffset, actElement, actOffset) {
      const expected = Cursors.calculateOne(root, expPath);
      const message = function () {
        const actual = Element.fromDom(actElement);
        const actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
        return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
      };
      Assertions.assertEq(() => 'Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
      Assertions.assertEq(() => 'Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
    };

    const assertSelection = function (editor, startPath, soffset, finishPath, foffset) {
      const actual = editor.selection.getRng();
      const root = Element.fromDom(editor.getBody());
      assertPath('start', root, startPath, soffset, actual.startContainer, actual.startOffset);
      assertPath('finish', root, finishPath, foffset, actual.endContainer, actual.endOffset);
    };

    TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
      const browser = PlatformDetection.detect().browser;
      Pipeline.async({}, browser.isIE() ? [ // Only run on IE
        sAddTestDiv,
        Logger.t('assert selection after no nodechanged, should not restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0, 0], 0, [0, 0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          focusDiv();

          assertSelection(editor, [0, 0], 0, [0, 0], 0);
        })),
        Logger.t('assert selection after nodechanged, should restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0], 0, [0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          editor.nodeChanged();
          focusDiv();

          assertSelection(editor, [1, 0], 1, [1, 0], 1);
        })),
        Logger.t('assert selection after keyup, should restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0], 0, [0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          editor.fire('keyup', { });
          focusDiv();

          assertSelection(editor, [1, 0], 1, [1, 0], 1);
        })),
        Logger.t('assert selection after mouseup, should restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0], 0, [0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          editor.fire('mouseup', { });
          focusDiv();

          assertSelection(editor, [1, 0], 1, [1, 0], 1);
        })),
        sRemoveTestDiv
      ] : [], onSuccess, onFailure);
    }, {
      plugins: '',
      toolbar: '',
      base_url: '/project/tinymce/js/tinymce'
    }, function () {
      success();
    }, failure);
  }
);
