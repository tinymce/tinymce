import { ApproxStructure, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as BoundaryLocation from 'tinymce/core/keyboard/BoundaryLocation';
import * as InlineUtils from 'tinymce/core/keyboard/InlineUtils';

describe('browser.tinymce.core.delete.InlineBoundaryDeleteTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  const locationName = (location: BoundaryLocation.LocationAdt) => {
    return location.fold(
      Fun.constant('before'),
      Fun.constant('start'),
      Fun.constant('end'),
      Fun.constant('after')
    );
  };

  const readLocation = (editor: Editor) => {
    const isInlineTarget = Fun.curry(InlineUtils.isInlineTarget, editor);
    return BoundaryLocation
      .readLocation(isInlineTarget, editor.getBody(), CaretPosition.fromRangeStart(editor.selection.getRng()))
      .map(locationName)
      .getOr('none');
  };

  const testDeleteOrBackspaceKey = (key: number) => (
    setupHtml: string,
    setupPath: number[],
    setupOffset: number,
    expectedHtml: string,
    expectedLocation: 'before' | 'start' | 'end' | 'after' | 'none',
    expectedPath: number[],
    expectedOffset: number,
    expectInputEvents: boolean = true
  ) => {
    const editor = hook.editor();
    const inputEvents: string[] = [];
    const collect = (event: InputEvent) => {
      inputEvents.push(event.inputType);
    };

    editor.on('input', collect);
    editor.setContent(setupHtml);
    TinySelections.setCursor(editor, setupPath, setupOffset);
    editor.nodeChanged();
    TinyContentActions.keydown(editor, key);
    editor.off('input', collect);

    TinyAssertions.assertContent(editor, expectedHtml);
    assert.equal(readLocation(editor), expectedLocation, 'Should be expected location');
    TinyAssertions.assertSelection(editor, expectedPath, expectedOffset, expectedPath, expectedOffset);

    if (expectInputEvents) {
      assert.deepEqual(inputEvents, [ key === Keys.backspace() ? 'deleteContentBackward' : 'deleteContentForward' ]);
    }

    normalizeBody(editor);
  };

  const normalizeBody = (editor: Editor) => editor.getBody().normalize();

  const paragraphWithText = (text: string) => ApproxStructure.build((s, str, _arr) => {
    return s.element('body', {
      children: [ s.element('p', { children: [ s.text(str.is(text)) ] }) ]
    });
  });

  const testBackspace = testDeleteOrBackspaceKey(Keys.backspace());
  const testDelete = testDeleteOrBackspaceKey(Keys.delete());

  it('Backspace key on text', () => {
    testBackspace('<p>a<a href="#">b</a>c</p>', [ 0, 2 ], 0, '<p>a<a href="#">b</a>c</p>', 'end', [ 0, 1, 0 ], 1);
    testBackspace('<p>a<a href="#">b</a>c</p>', [ 0, 1, 0 ], 0, '<p>a<a href="#">b</a>c</p>', 'before', [ 0, 0 ], 1);
    testBackspace('<p>a<a href="#">bc</a>d</p>', [ 0, 1, 0 ], 1, '<p>a<a href="#">c</a>d</p>', 'start', [ 0, 1, 0 ], 1);
  });

  it('Backspace key on image', () => {
    testBackspace('<p>a<a href="#"><img src="#" /></a>c</p>', [ 0, 2 ], 0, '<p>a<a href="#"><img src="#"></a>c</p>', 'end', [ 0, 1, 1 ], 0);
    testBackspace('<p>a<a href="#"><img src="#" /></a>c</p>', [ 0, 1 ], 0, '<p>a<a href="#"><img src="#"></a>c</p>', 'before', [ 0, 0 ], 1);
    testBackspace('<p>a<a href="#"><img src="#" />c</a>d</p>', [ 0, 1 ], 1, '<p>a<a href="#">c</a>d</p>', 'start', [ 0, 1, 0 ], 1);
  });

  it('Delete key on text', () => {
    testDelete('<p>a<a href="#">b</a>c</p>', [ 0, 0 ], 1, '<p>a<a href="#">b</a>c</p>', 'start', [ 0, 1, 0 ], 1);
    testDelete('<p>a<a href="#">b</a>c</p>', [ 0, 1, 0 ], 1, '<p>a<a href="#">b</a>c</p>', 'after', [ 0, 2 ], 1);
    testDelete('<p>a<a href="#">bc</a>d</p>', [ 0, 1, 0 ], 1, '<p>a<a href="#">b</a>d</p>', 'end', [ 0, 1, 0 ], 1);
  });

  it('Delete key on image', () => {
    testDelete('<p>a<a href="#"><img src="#" /></a>c</p>', [ 0, 0 ], 1, '<p>a<a href="#"><img src="#"></a>c</p>', 'start', [ 0, 1, 0 ], 1);
    testDelete('<p>a<a href="#"><img src="#" /></a>c</p>', [ 0, 1 ], 1, '<p>a<a href="#"><img src="#"></a>c</p>', 'after', [ 0, 2 ], 1);
    testDelete('<p>a<a href="#">b<img src="#" /></a>d</p>', [ 0, 1, 0 ], 1, '<p>a<a href="#">b</a>d</p>', 'end', [ 0, 1, 0 ], 1);
  });

  it('Backspace/delete last character', () => {
    const editor = hook.editor();
    testDelete('<p>a<a href="#">b</a>c</p>', [ 0, 1, 0 ], 0, '<p>ac</p>', 'none', [ 0, 0 ], 1);
    testDelete('<p><img src="#1" /><a href="#">b</a><img src="#2" /></p>', [ 0, 1, 0 ], 0, '<p><img src="#1"><img src="#2"></p>', 'none', [ 0 ], 1);
    testDelete('<p>a<a href="#">b</a>c</p>', [ 0, 1, 0 ], 0, '<p>ac</p>', 'none', [ 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, paragraphWithText('ac'));
    testBackspace('<p>a<a href="#">b</a>c</p>', [ 0, 1, 0 ], 1, '<p>ac</p>', 'none', [ 0, 0 ], 1);
    TinyAssertions.assertContentStructure(editor, paragraphWithText('ac'));
    testDelete('<p>a<a href="#"><img src="#1" /></a>c</p>', [ 0, 1 ], 0, '<p>ac</p>', 'none', [ 0, 0 ], 1);
    testBackspace('<p>a<a href="#"><img src="#1" /></a>c</p>', [ 0, 1 ], 1, '<p>ac</p>', 'none', [ 0, 0 ], 1);
  });

  it('Backspace/delete between blocks', () => {
    testBackspace('<p><a href="#">a</a></p><p><a href="#">b</a></p>', [ 1 ], 0, '<p><a href="#">a</a><a href="#">b</a></p>', 'end', [ 0, 0, 0 ], 1);
    testDelete('<p><a href="#">a</a></p><p><a href="#">b</a></p>', [ 0 ], 1, '<p><a href="#">a</a><a href="#">b</a></p>', 'end', [ 0, 0, 0 ], 1);
  });

  it('Backspace key inline_boundaries: false', () => {
    const editor = hook.editor();
    editor.options.set('inline_boundaries', false);
    testBackspace('<p>a<a href="#">b</a>c</p>', [ 0, 2 ], 0, '<p>a<a href="#">b</a>c</p>', 'after', [ 0, 2 ], 0, false);
    editor.options.unset('inline_boundaries');
  });
});
