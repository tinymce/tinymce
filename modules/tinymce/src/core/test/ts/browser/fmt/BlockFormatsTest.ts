import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.fmt.BlockFormatsTest', () => {
  context('Testing that the selection is still collapsed after a formatting operation', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      statusbar: false,
      menubar: false,
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    it('apply heading format at the end of paragraph should not expand selection', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.formatter.apply('h1');
      assert.isTrue(editor.selection.isCollapsed(), 'should still have a collapsed rng');
    });

    it('apply alignright format at the end of paragraph should not expand selection', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.formatter.apply('alignright');
      assert.isTrue(editor.selection.isCollapsed(), 'should still have a collapsed rng');
    });

    it('Using default style formats config, the Block formatting dropdown should show the correct format selection', async () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await UiFinder.pWaitFor('default setting - Check that formatter displays Paragraph', SugarBody.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Paragraph")');
      editor.formatter.apply('h1');
      await UiFinder.pWaitFor('default setting - Check that formatter displays Heading 1', SugarBody.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Heading 1")');
    });
  });

  context('When a user has defined style_formats, applying formatting should update the dropdown to show the correct content formatting', () => {
    const hook = TinyHooks.bddSetup<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'styles',
      statusbar: false,
      menubar: false,
      style_formats: [
        { title: 'Paragraph', block: 'p' },
        { title: 'Heading 1', block: 'h1' },
        { title: 'Heading 2', block: 'h2' },
        { title: 'Heading 3', block: 'h3' },
        { title: 'Heading 4', block: 'h4' },
        { title: 'Heading 5', block: 'h5' },
        { title: 'Heading 6', block: 'h6' },
        { title: 'Div', block: 'div' },
        { title: 'Pre', block: 'pre' }
      ]
    }, []);

    it('Using default style formats config, the Block formatting dropdown should show the correct format selection ', async () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      await UiFinder.pWaitFor('Check that formatter displays Paragraph', SugarBody.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Paragraph")');
      editor.formatter.apply('h1');
      await UiFinder.pWaitFor('Check that formatter displays Heading 1', SugarBody.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Heading 1")');
      editor.formatter.apply('pre');
      await UiFinder.pWaitFor('Check that formatter displays Pre', SugarBody.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Pre")');
      editor.formatter.apply('p');
      await UiFinder.pWaitFor('Check that formatter displays Paragraph', SugarBody.body(), 'button.tox-tbtn--select span.tox-tbtn__select-label:contains("Paragraph")');
    });
  });
});
