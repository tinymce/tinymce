import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Strings } from '@ephox/katamari';
import { TinyHooks, TinySelections } from '@ephox/mcagar';
import { SugarBody, TextContent } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.FontSelectCustomTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'fontsizeselect fontselect',
    content_style: [
      '.mce-content-body { font-family: Helvetica; font-size: 42px; }',
      '.mce-content-body p { font-family: Arial; font-size: 12px; }',
      '.mce-content-body h1 { font-family: Arial; font-size: 32px; }'
    ].join(''),
    font_formats: 'Arial=arial; Arial Black=arial black; Arial Narrow=arial narrow; Bauhaus 93="bauhaus 93"; Bookman Old Style=bookman old style; Bookshelf Symbol 7=bookshelf symbol 7; Times New Roman=times new roman, times;',
    fontsize_formats: '8pt=1 12pt 12.75pt 13pt 24pt 32pt'
  }, [ Theme ]);

  const assertSelectBoxDisplayValue = (editor, title, expectedValue) => {
    const selectBox = UiFinder.findIn(SugarBody.body(), '*[title="' + title + '"]').getOrDie();
    const value = Fun.compose(Strings.trim, TextContent.get)(selectBox);
    assert.equal(value, expectedValue, 'Should be the expected display value');
  };

  it('Font family and font size on initial page load', () => {
    const editor = hook.editor();
    assertSelectBoxDisplayValue(editor, 'Font sizes', '12px');
    assertSelectBoxDisplayValue(editor, 'Fonts', 'Arial');
  });

  it('Font family with spaces and numbers in the name with legacy font elements', () => {
    const editor = hook.editor();
    editor.setContent(`<p><font face="'bookshelf symbol 7'" size="1">a</font></p>`, { format: 'raw' });
    editor.focus();
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
    editor.nodeChanged();
    assertSelectBoxDisplayValue(editor, 'Font sizes', '8pt');
    assertSelectBoxDisplayValue(editor, 'Fonts', 'Bookshelf Symbol 7');
  });

  it('Font family with spaces and numbers in the name', () => {
    const editor = hook.editor();
    editor.setContent(`<p style="font-family: 'bookshelf symbol 7';"></p>`);
    editor.focus();
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.nodeChanged();
    assertSelectBoxDisplayValue(editor, 'Font sizes', '12px');
    assertSelectBoxDisplayValue(editor, 'Fonts', 'Bookshelf Symbol 7');
  });

  it('Font family with quoted font names', () => {
    const editor = hook.editor();
    editor.setContent(`<p style="font-family: 'bauhaus 93';"></p>`);
    editor.focus();
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    editor.nodeChanged();
    assertSelectBoxDisplayValue(editor, 'Font sizes', '12px');
    assertSelectBoxDisplayValue(editor, 'Fonts', 'Bauhaus 93');
  });
});
