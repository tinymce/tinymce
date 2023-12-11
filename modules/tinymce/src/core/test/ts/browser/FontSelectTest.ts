import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Strings } from '@ephox/katamari';
import { SugarBody, TextContent } from '@ephox/sugar';
import { TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.FontSelectTest', () => {
  const assertSelectBoxDisplayValue = (title: string, expectedValue: string) => {
    const selectBox = UiFinder.findIn(SugarBody.body(), `*[title^="${title}"]`).getOrDie();
    const value = Strings.trim(TextContent.get(selectBox) ?? '');
    assert.equal(value, expectedValue, 'Should be the expected display value');
  };

  context('Default font stack', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'fontfamily fontsize',
      content_style: [
        '.mce-content-body { font-family: Helvetica; font-size: 42px; }',
        '.mce-content-body p { font-family: Arial; font-size: 12px; }',
        '.mce-content-body h1 { font-family: Arial; font-size: 32px; }'
      ].join(''),
      font_size_formats: '8pt=1 12pt 12.75pt 13pt 24pt 32pt'
    }, [], true);

    const systemFontStackVariants = [
      `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;`, // Oxide
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";', // Bootstrap
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;' // Wordpress
    ];

    it('TBA: Font family and font size on initial page load', () => {
      assertSelectBoxDisplayValue('Font size', '12px');
      assertSelectBoxDisplayValue('Font', 'Arial');
    });

    it('TBA: Font family and font size on paragraph with no styles', () => {
      const editor = hook.editor();
      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.nodeChanged();
      // p content style is 12px which does not match any pt values in the font size select values
      assertSelectBoxDisplayValue('Font size', '12px');
      assertSelectBoxDisplayValue('Font', 'Arial');
    });

    it('TBA: Font family and font size on heading with no styles', () => {
      const editor = hook.editor();
      editor.setContent('<h1>a</h1>');
      editor.focus();
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.nodeChanged();
      // h1 content style is 32px which matches 24pt in the font size select values so it should be converted
      assertSelectBoxDisplayValue('Font size', '24pt');
      assertSelectBoxDisplayValue('Font', 'Arial');
    });

    it('TBA: Font family and font size on paragraph with styles that do match font size select values', () => {
      const editor = hook.editor();
      editor.setContent('<p style="font-family: Times; font-size: 17px;">a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.nodeChanged();
      // the following should be converted and pick up 12.75pt, although there's a rounded 13pt in the dropdown as well
      assertSelectBoxDisplayValue('Font size', '12.75pt');
      assertSelectBoxDisplayValue('Font', 'Times');
    });

    it('TBA: Font family and font size on paragraph with styles that do not match font size select values', () => {
      const editor = hook.editor();
      editor.setContent('<p style="font-family: Times; font-size: 18px;">a</p>');
      editor.focus();
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.nodeChanged();
      // the following should stay as 18px because there's no matching pt value in the font size select values
      assertSelectBoxDisplayValue('Font size', '18px');
      assertSelectBoxDisplayValue('Font', 'Times');
    });

    it('TBA: Font family and font size on paragraph with legacy font elements', () => {
      const editor = hook.editor();
      editor.setContent('<p><font face="Times" size="1">a</font></p>', { format: 'raw' });
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
      editor.nodeChanged();
      assertSelectBoxDisplayValue('Font size', '8pt');
      assertSelectBoxDisplayValue('Font', 'Times');
    });

    // https://websemantics.uk/articles/font-size-conversion/
    it('TINY-6291: Font size on paragraph with keyword font size is translated to default size', () => {
      const editor = hook.editor();
      editor.setContent('<p style="font-family: Times; font-size: medium;">a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.nodeChanged();
      assertSelectBoxDisplayValue('Font size', '12pt');
      assertSelectBoxDisplayValue('Font', 'Times');
    });

    it('TINY-6291: xx-small will fall back to showing raw font size due to missing 7pt fontsize_format', () => {
      const editor = hook.editor();
      editor.setContent('<p style="font-family: Times; font-size: xx-small;">a</p>');
      editor.focus();
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.nodeChanged();
      assertSelectBoxDisplayValue('Font size', 'xx-small');
      assertSelectBoxDisplayValue('Font', 'Times');
    });

    it('TBA: System font stack variants on a paragraph show "System Font" as the font name', () => {
      const editor = hook.editor();
      editor.setContent(Arr.foldl(systemFontStackVariants, (acc, font) => acc + '<p style="font-family: ' + font.replace(/"/g, `'`) + '"></p>', ''));
      Arr.each(systemFontStackVariants, (_, idx) => {
        TinySelections.setCursor(editor, [ idx, 0 ], 0);
        editor.nodeChanged();
        assertSelectBoxDisplayValue('Font', 'System Font');
      });
    });

    it('TINY-10290: Should not display "System Font" since Arial is not part of the default stack', () => {
      const editor = hook.editor();
      editor.setContent('<p style="font-family: -apple-system, Arial;">a</p>');
      editor.focus();
      TinySelections.setCursor(editor, [ 0, 0 ], 0);
      editor.nodeChanged();
      assertSelectBoxDisplayValue('Font', '-apple-system,Arial');
    });
  });

  context('Custom default font stack', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      toolbar: 'fontfamily fontsize',
      content_style: [
        '.mce-content-body { font-family: -apple-system, Arial; }',
        '.mce-content-body h1 { font-family: Helvetica; }',
        '.mce-content-body h2 { font-family: Arial; }'
      ].join(''),
      default_font_stack: [ '-apple-system', 'Arial' ]
    }, []);

    const testCustomStack = (testCase: { html: string; path: number[]; offset: 0; expectedValue: string }) => {
      const editor = hook.editor();
      editor.setContent(testCase.html);
      TinySelections.setCursor(editor, testCase.path, testCase.offset);
      editor.nodeChanged();
      assertSelectBoxDisplayValue('Font', testCase.expectedValue);
    };

    it('TINY-10290: Should show System Font for the specified custom stack', () => testCustomStack({
      html: '<p>foo</p>',
      path: [ 0, 0 ],
      offset: 0,
      expectedValue: 'System Font'
    }));

    it('TINY-10290: Should show Helvetica since H1 is not using the system font stack', () => testCustomStack({
      html: '<h1>foo</h1>',
      path: [ 0, 0 ],
      offset: 0,
      expectedValue: 'Helvetica'
    }));

    it('TINY-10290: Should show Arial since the H2 is not using the system font stack', () => testCustomStack({
      html: '<h2>foo</h2>',
      path: [ 0, 0 ],
      offset: 0,
      expectedValue: 'Arial'
    }));
  });
});
