import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

describe('browser.tinymce.core.keyboard.ArrowKeysCetContentEndpointNavigation', () => {
  if (!Env.browser.isFirefox()) {
    return;
  }

  const hook = TinyHooks.bddSetupLight<Editor>({
    height: 200,
    base_url: '/project/tinymce/js/tinymce'
  }, [], true);

  it('TINY-12459: should move cursor to end of next paragraph when pressing down arrow at end of figcaption', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>First line</p>' +
      '<figure contenteditable="false">' +
      '<img src="https://www.google.com/logos/google.jpg">' +
      '<figcaption contenteditable="true">Figcaption</figcaption>' +
      '</figure>' +
      '<p>Last line</p>'
    );
    TinySelections.setCursor(editor, [ 1, 1, 0 ], 'Figcaption'.length);
    TinyContentActions.keydown(editor, Keys.down());

    TinyAssertions.assertCursor(editor, [ 2, 0 ], 'Last line'.length);
  });

  it('TINY-12459: should move cursor to end of previous paragraph when pressing up arrow at end of figcaption', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>First line</p>' +
      '<figure contenteditable="false">' +
      '<img src="https://www.google.com/logos/google.jpg">' +
      '<figcaption contenteditable="true">Figcaption</figcaption>' +
      '</figure>' +
      '<p>Last line</p>'
    );
    TinySelections.setCursor(editor, [ 1, 1, 0 ], 'Figcaption'.length);
    TinyContentActions.keydown(editor, Keys.up());

    TinyAssertions.assertCursor(editor, [ 0, 0 ], 'First line'.length);
  });

  it('TINY-12459: should move cursor to end of next paragraph when pressing down arrow with selection in figcaption', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>First line</p>' +
      '<figure contenteditable="false">' +
      '<img src="https://www.google.com/logos/google.jpg">' +
      '<figcaption contenteditable="true">Figcaption</figcaption>' +
      '</figure>' +
      '<p>Last line</p>'
    );
    TinySelections.setSelection(editor, [ 1, 1, 0 ], 0, [ 1, 1, 0 ], 'Fig'.length);
    TinyContentActions.keydown(editor, Keys.down());

    TinyAssertions.assertCursor(editor, [ 2, 0 ], 'Last line'.length);
  });

  it('TINY-12459: should move cursor to end of previous paragraph when pressing up arrow with selection in figcaption', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>First line</p>' +
      '<figure contenteditable="false">' +
      '<img src="https://www.google.com/logos/google.jpg">' +
      '<figcaption contenteditable="true">Figcaption</figcaption>' +
      '</figure>' +
      '<p>Last line</p>'
    );
    TinySelections.setSelection(editor, [ 1, 1, 0 ], 0, [ 1, 1, 0 ], 'Fig'.length);
    TinyContentActions.keydown(editor, Keys.up());

    TinyAssertions.assertCursor(editor, [ 0, 0 ], 'First line'.length);
  });

  it('TINY-12459: should move cursor to previous paragraph when pressing up arrow with selection across inner contenteditable paragraphs', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>Line above</p>' +
      '<div contenteditable="false">' +
      '<div contenteditable="true">' +
      '<p>#1 Inner content</p>' +
      '<p>#2 Inner content</p>' +
      '</div>' +
      '</div>' +
      '<p>Line below</p>'
    );
    TinySelections.setSelection(editor, [ 1, 0, 0, 0 ], '#1 Inner '.length, [ 1, 0, 1, 0 ], '#2 Inner'.length);
    TinyContentActions.keydown(editor, Keys.up());

    TinyAssertions.assertCursor(editor, [ 0, 0 ], 'Line abo'.length);
  });

  it('TINY-12459: should move cursor to next paragraph when pressing down arrow with selection across inner contenteditable paragraphs', () => {
    const editor = hook.editor();
    editor.setContent(
      '<p>Line above</p>' +
      '<div contenteditable="false">' +
      '<div contenteditable="true">' +
      '<p>#1 Inner content</p>' +
      '<p>#2 Inner content</p>' +
      '</div>' +
      '</div>' +
      '<p>Line below</p>'
    );
    TinySelections.setSelection(editor, [ 1, 0, 0, 0 ], '#1 Inner '.length, [ 1, 0, 1, 0 ], '#2 Inner'.length);
    TinyContentActions.keydown(editor, Keys.down());

    TinyAssertions.assertCursor(editor, [ 2, 0 ], 'Line bel'.length);
  });
});
