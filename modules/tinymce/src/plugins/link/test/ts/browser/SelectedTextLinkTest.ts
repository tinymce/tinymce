import { FocusTools, Keys, UiFinder } from '@ephox/agar';
import { describe, it, before, after } from '@ephox/bedrock-client';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.SelectedTextLinkTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: '',
    setup: (editor: Editor) => {
      // Simulate comments being enabled
      editor.on('GetContent', (e) => {
        if (e.selection) {
          e.content += '<!-- TinyComments -->';
        }
      });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  const doc = SugarDocument.getDocument();

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  const pOpenDialog = async (editor: Editor, textToDisplayVisible: boolean = true) => {
    editor.execCommand('mcelink');
    await TinyUiActions.pWaitForDialog(editor);
    const existence = textToDisplayVisible ? UiFinder.exists : UiFinder.notExists;
    existence(SugarBody.body(), '.tox-label:contains("Text to display")');
  };

  it('TINY-5205: basic text selection with existing link should preserve the text when changing URL', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://oldlink/">word</a></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await pOpenDialog(editor);
    FocusTools.setActiveValue(doc, 'http://something');
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 1,
      'p:contains(word)': 1,
      'p': 1
    });
  });

  it('TBA: complex selections across paragraphs should preserve the text', async () => {
    const editor = hook.editor();
    editor.setContent('<p><strong>word</strong></p><p><strong>other</strong></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 1 ], 1);
    await pOpenDialog(editor, false);
    FocusTools.setActiveValue(doc, 'http://something');
    TinyUiActions.keydown(editor, Keys.enter());
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 2,
      'p:contains(word)': 1,
      'p:contains(other)': 1,
      'p': 2
    });
  });

  it('TINY-5205: complex selections with existing link should preserve the text when changing URL', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://oldlink/"><strong>word</strong><em>other</em></a></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await pOpenDialog(editor);
    FocusTools.setActiveValue(doc, 'http://something');
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 1,
      'strong:contains(word)': 1,
      'em:contains(other)': 1,
      'p': 1
    });
  });

  it('TINY-5205: complex selections with existing link should replace the text when changing text', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://oldlink/"><strong>word</strong><em>other</em></a></p>');
    TinySelections.setSelection(editor, [ 0 ], 0, [ 0 ], 1);
    await pOpenDialog(editor);
    FocusTools.setActiveValue(doc, 'http://something');
    TinyUiActions.keydown(editor, Keys.tab());
    FocusTools.setActiveValue(doc, 'new text');
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 1,
      'a:contains(new text)': 1,
      'strong': 0,
      'em': 0,
      'p': 1
    });
  });

  it('TINY-5205: collapsed selection in complex structure should preserve the text when changing URL', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://oldlink/"><strong>word</strong><em>other</em></a></p>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 2);
    await pOpenDialog(editor);
    FocusTools.setActiveValue(doc, 'http://something');
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 1,
      'strong:contains(word)': 1,
      'em:contains(other)': 1,
      'p': 1
    });
  });

  it('TINY-5205: Selection with link inside should replace link', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a <a href="http://www.google.com/">b</a> c</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 2 ], 2);
    await pOpenDialog(editor);
    FocusTools.setActiveValue(doc, 'http://something');
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://something"]': 1,
      'a': 1,
      'p': 1
    });
  });

  it('TINY-5205: Selection across partial link should split and replace link', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a href="http://www.google.com/">a b</a> c</p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 2, [ 0, 1 ], 2);
    await pOpenDialog(editor);
    FocusTools.setActiveValue(doc, 'http://something');
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href="http://www.google.com/"]': 1,
      'a[href="http://something"]': 1,
      'a': 2,
      'p': 1
    });
  });
});
