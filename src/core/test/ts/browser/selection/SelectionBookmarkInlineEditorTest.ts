import { Assertions, Cursors, GeneralSteps, Logger, Pipeline, Step, Waiter } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { Hierarchy, Element, Html } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest(
  'browser.tinymce.core.selection.SelectionBookmarkInlineEditorTest',
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

    const sWaitForBookmark = function (editor, startPath, startOffset, endPath, endOffset) {
      return Waiter.sTryUntil('wait for selection', Step.sync(function () {
        assertBookmark(editor, startPath, startOffset, endPath, endOffset);
      }), 100, 3000);
    };

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
      Assertions.assertEq('Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
      Assertions.assertEq('Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
    };

    const assertSelection = function (editor, startPath, soffset, finishPath, foffset) {
      const actual = editor.selection.getRng();
      const root = Element.fromDom(editor.getBody());
      assertPath('start', root, startPath, soffset, actual.startContainer, actual.startOffset);
      assertPath('finish', root, finishPath, foffset, actual.endContainer, actual.endOffset);
    };

    const assertBookmark = function (editor, startPath, soffset, finishPath, foffset) {
      const actual = editor.bookmark.getOrDie('no bookmark');
      const root = Element.fromDom(editor.getBody());
      assertPath('start', root, startPath, soffset, actual.start().dom(), actual.soffset());
      assertPath('finish', root, finishPath, foffset, actual.finish().dom(), actual.foffset());
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const browser = PlatformDetection.detect().browser;

      Pipeline.async({}, browser.isIE() || browser.isEdge() ? [ // On edge and ie it restores on focusout only
        sAddTestDiv,
        Logger.t('restore even without second nodechange, restores on focusout', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0, 0], 0, [0, 0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          focusDiv();

          assertSelection(editor, [0, 0], 0, [0, 0], 0);
        })),
        Logger.t('restore with second nodechange, restores on focusout', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0, 0], 0, [0, 0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          editor.nodeChanged();
          focusDiv();

          assertSelection(editor, [1, 0], 1, [1, 0], 1);
        })),
        sRemoveTestDiv
      ] : [ // On the other browsers we test for bookmark saved on nodechange, keyup, mouseup and touchend events
        Logger.t('assert selection after no nodechanged, should not restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');
          editor.undoManager.add();
          // In FireFox blurring the editor adds an undo level that triggers a nodechange that creates a bookmark,
          // so by adding an undo level first we keep it from adding a bookmark because the undo manager
          // does not add a new undolevel if it is the same as the previous level.

          setSelection(editor, [0, 0], 0, [0, 0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          assertBookmark(editor, [0, 0], 0, [0, 0], 0);
        })),
        Logger.t('assert selection after nodechanged, should restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0, 0], 0, [0, 0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          editor.nodeChanged();
          assertBookmark(editor, [1, 0], 1, [1, 0], 1);
        })),
        Logger.t('assert selection after keyup, should restore', Step.sync(function () {
          editor.setContent('<p>a</p><p>b</p>');

          setSelection(editor, [0, 0], 0, [0, 0], 0);
          editor.nodeChanged();

          setSelection(editor, [1, 0], 1, [1, 0], 1);
          editor.fire('keyup', { });
          assertBookmark(editor, [1, 0], 1, [1, 0], 1);
        })),
        Logger.t('assert selection after touchend, should restore', GeneralSteps.sequence([
          Step.sync(function () {
            editor.setContent('<p>a</p><p>b</p>');

            setSelection(editor, [0, 0], 0, [0, 0], 0);
            editor.nodeChanged();

            setSelection(editor, [1, 0], 1, [1, 0], 1);
            editor.fire('mouseup', { });
          }),
          sWaitForBookmark(editor, [1, 0], 1, [1, 0], 1)
        ])),
        Logger.t('assert selection after touchend, should restore', GeneralSteps.sequence([
          Step.sync(function () {
            editor.setContent('<p>a</p><p>b</p>');

            setSelection(editor, [0, 0], 0, [0, 0], 0);
            editor.nodeChanged();

            setSelection(editor, [1, 0], 1, [1, 0], 1);
            editor.fire('touchend', { });
          }),
          sWaitForBookmark(editor, [1, 0], 1, [1, 0], 1)
        ])),
        Logger.t('selection with mouseup outside editor body', GeneralSteps.sequence([
          Step.sync(function () {
            editor.setContent('<p>ab</p>');
            setSelection(editor, [0, 0], 0, [0, 0], 1);
            DOMUtils.DOM.fire(document, 'mouseup');
          }),
          sWaitForBookmark(editor, [0, 0], 0, [0, 0], 1)
        ])),
        Logger.t('getSelectionRange event should fire on bookmarked ranges', GeneralSteps.sequence([
          sAddTestDiv,
          Step.sync(() => {
            const modifyRange = (e) => {
              const newRng = document.createRange();
              newRng.selectNodeContents(editor.getBody().lastChild);
              e.range = newRng;
            };

            editor.setContent('<p>a</p><p>b</p>');
            setSelection(editor, [0, 0], 0, [0, 0], 1);
            editor.nodeChanged();
            focusDiv();

            editor.on('GetSelectionRange', modifyRange);
            const elm = editor.selection.getNode();
            editor.off('GetSelectedRange', modifyRange);

            Assertions.assertEq('Expect event to change the selection from a to b', 'b', elm.innerHTML);
          }),
          sRemoveTestDiv
        ]))
      ], onSuccess, onFailure);
    }, {
      inline: true,
      indent: false,
      plugins: '',
      toolbar: '',
      base_url: '/project/tinymce/js/tinymce'
    }, function () {
      success();
    }, failure);
  }
);
