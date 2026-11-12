import { Assertions } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { Attribute, SelectorFind, type SugarElement, TextContent } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { AppearanceField } from 'tinymce/plugins/table/api/Options';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

interface TableState {
  readonly attrs: Record<string, string>;
  readonly styles: Record<string, string>;
  readonly cellStyles: Record<string, string>;
  readonly caption: string | null;
}

describe('browser.tinymce.plugins.table.TableAppearanceOptionsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    table_advtab: false
  }, [ Plugin ], true);

  const fieldLabels: Record<string, string> = {
    cellspacing: 'Cell spacing',
    cellpadding: 'Cell padding',
    borderwidth: 'Border width',
    caption: 'Caption'
  };

  afterEach(() => {
    hook.editor().options.unset('table_appearance_options');
    hook.editor().options.unset('table_style_by_css');
    hook.editor().options.unset('table_default_styles');
    hook.editor().options.unset('table_default_attributes');
  });

  const pOpenDialog = async (editor: Editor, html: string) => {
    editor.setContent(html);
    TinySelections.select(editor, 'td', [ 0 ]);
    editor.execCommand('mceTableProps');
    return TinyUiActions.pWaitForDialog(editor);
  };

  const pAssertHiddenFields = async (editor: Editor, hiddenFields: string[]) => {
    const dialog = await pOpenDialog(editor, '<table><tbody><tr><td>x</td></tr></tbody></table>');
    const expected: Record<string, number> = {};
    Obj.each(fieldLabels, (label, field) => {
      expected[`label:contains("${label}")`] = Arr.contains(hiddenFields, field) ? 0 : 1;
    });
    Assertions.assertPresence('Appearance fields', expected, dialog);
    await TableTestUtils.pClickDialogButton(editor, false);
  };

  const tableHtml = '<table><tbody><tr><td>x</td></tr></tbody></table>';

  context('Boolean form', () => {
    it('TBA: test that settings for appearance can be disabled', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', false);
      editor.setContent(tableHtml);
      TinySelections.select(editor, 'table td', [ 0 ]);
      editor.execCommand('mceTableProps');
      const dialog = await TinyUiActions.pWaitForDialog(editor);
      Assertions.assertPresence(
        'assert presence of spacing, padding, border and caption inputs',
        {
          'label:contains("Cell spacing")': 0,
          'label:contains("Cell padding")': 0,
          'label:contains("Border")': 0,
          'label:contains("Caption")': 0
        },
        dialog
      );
      await TableTestUtils.pClickDialogButton(editor, false);
    });

    it('TBA: test that settings for appearance can be enabled', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', true);
      editor.setContent(tableHtml);
      TinySelections.select(editor, 'table td', [ 0 ]);
      editor.execCommand('mceTableProps');
      const dialog = await TinyUiActions.pWaitForDialog(editor);
      Assertions.assertPresence(
        'assert presence of spacing, padding, border and caption inputs',
        {
          'label:contains("Cell spacing")': 1,
          'label:contains("Cell padding")': 1,
          'label:contains("Border")': 1,
          'label:contains("Caption")': 1
        },
        dialog
      );
      await TableTestUtils.pClickDialogButton(editor, false);
    });
  });

  context('Field visibility', () => {
    it('TINYMCE-11998: All appearance fields are shown when every key is true', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { cellspacing: true, cellpadding: true, borderwidth: true, caption: true });
      await pAssertHiddenFields(editor, []);
    });

    it('TINYMCE-11998: Keys set to true are shown alongside keys set to false', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { cellspacing: false, caption: true });
      await pAssertHiddenFields(editor, [ 'cellspacing' ]);
    });

    it('TINYMCE-11998: All appearance fields are shown when the object has no keys', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', {});
      await pAssertHiddenFields(editor, []);
    });

    it('TINYMCE-11998: Only the Cell spacing field is hidden when cellspacing is false', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { cellspacing: false });
      await pAssertHiddenFields(editor, [ 'cellspacing' ]);
    });

    it('TINYMCE-11998: Only the Cell padding field is hidden when cellpadding is false', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { cellpadding: false });
      await pAssertHiddenFields(editor, [ 'cellpadding' ]);
    });

    it('TINYMCE-11998: Only the Border width field is hidden when borderwidth is false', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { borderwidth: false });
      await pAssertHiddenFields(editor, [ 'borderwidth' ]);
    });

    it('TINYMCE-11998: Only the Caption field is hidden when caption is false', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { caption: false });
      await pAssertHiddenFields(editor, [ 'caption' ]);
    });

    it('TINYMCE-11998: Several fields can be hidden at once', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { cellspacing: false, borderwidth: false });
      await pAssertHiddenFields(editor, [ 'cellspacing', 'borderwidth' ]);
    });
  });

  context('Normalisation and validation', () => {
    const allVisible: Record<AppearanceField, boolean> = { cellspacing: true, cellpadding: true, borderwidth: true, caption: true };

    it('TINYMCE-11998: The default is normalised to every field visible', () => {
      assert.deepEqual<Record<AppearanceField, boolean>>(hook.editor().options.get('table_appearance_options'), allVisible);
    });

    it('TINYMCE-11998: A boolean is normalised to every field', () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', false);
      assert.deepEqual<Record<AppearanceField, boolean>>(editor.options.get('table_appearance_options'), { cellspacing: false, cellpadding: false, borderwidth: false, caption: false });
    });

    it('TINYMCE-11998: A partial object is normalised with missing fields visible', () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { caption: false });
      assert.deepEqual<Record<AppearanceField, boolean>>(editor.options.get('table_appearance_options'), { ...allVisible, caption: false });
    });

    it('TINYMCE-11998: Unknown keys are ignored and known keys are applied', () => {
      const editor = hook.editor();
      assert.isTrue(editor.options.set('table_appearance_options', { caption: false, cellSpacing: false }));
      assert.deepEqual<Record<AppearanceField, boolean>>(editor.options.get('table_appearance_options'), { ...allVisible, caption: false });
    });

    it('TINYMCE-11998: A non-boolean field value is rejected and the default is kept', () => {
      const editor = hook.editor();
      assert.isFalse(editor.options.set('table_appearance_options', { caption: 'no' }));
      assert.deepEqual<Record<AppearanceField, boolean>>(editor.options.get('table_appearance_options'), allVisible);
    });

    it('TINYMCE-11998: An array is rejected and the default is kept', () => {
      const editor = hook.editor();
      assert.isFalse(editor.options.set('table_appearance_options', [ 'caption' ]));
      assert.deepEqual<Record<AppearanceField, boolean>>(editor.options.get('table_appearance_options'), allVisible);
    });
  });

  context('TINYMCE-15197: Hidden fields keep the existing values on save', () => {
    const getAttrs = (elm: SugarElement<Element>): Record<string, string> =>
      Obj.filter(Attribute.clone(elm), (_value, key) => key !== 'style' && !key.startsWith('data-mce-'));

    const getStyles = (editor: Editor, elm: SugarElement<Element>): Record<string, string> =>
      editor.dom.parseStyle(editor.dom.getAttrib(elm.dom, 'style'));

    const getTableState = (editor: Editor): TableState => {
      const table = SelectorFind.descendant(TinyDom.body(editor), 'table').getOrDie();
      const cell = SelectorFind.descendant(table, 'td').getOrDie();
      return {
        attrs: getAttrs(table),
        styles: getStyles(editor, table),
        cellStyles: getStyles(editor, cell),
        caption: SelectorFind.child(table, 'caption').map(TextContent.get).getOrNull()
      };
    };

    const pSaveWithNewWidth = async (editor: Editor, html: string): Promise<void> => {
      await pOpenDialog(editor, html);
      TableTestUtils.setInputValue('Width', '50%');
      await TableTestUtils.pClickDialogButton(editor, true);
    };

    it('TINYMCE-15197: border-spacing is kept when cellspacing is hidden', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { cellspacing: false });
      await pSaveWithNewWidth(editor, '<table style="width: 100%; border-spacing: 5px;"><tbody><tr><td>x</td></tr></tbody></table>');
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { border: '1' },
        styles: { 'width': '50%', 'border-spacing': '5px', 'border-collapse': 'collapse' },
        cellStyles: {},
        caption: null
      });
    });

    it('TINYMCE-15197: table border width and border attribute are kept when borderwidth is hidden', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { borderwidth: false });
      await pSaveWithNewWidth(editor, '<table style="width: 100%; border-width: 3px;" border="3"><tbody><tr><td>x</td></tr></tbody></table>');
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { border: '3' },
        styles: { 'width': '50%', 'border-width': '3px', 'border-collapse': 'collapse' },
        cellStyles: {},
        caption: null
      });
    });

    it('TINYMCE-15197: caption is kept when caption is hidden', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { caption: false });
      await pSaveWithNewWidth(editor, '<table style="width: 100%;"><caption>Caption</caption><tbody><tr><td>x</td></tr></tbody></table>');
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { border: '1' },
        styles: { 'width': '50%', 'border-collapse': 'collapse' },
        cellStyles: {},
        caption: 'Caption'
      });
    });

    it('TINYMCE-15197: cell padding is kept when cellpadding is hidden', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { cellpadding: false });
      await pSaveWithNewWidth(editor, '<table style="width: 100%;"><tbody><tr><td style="padding: 4px;">x</td></tr></tbody></table>');
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { border: '1' },
        styles: { 'width': '50%', 'border-collapse': 'collapse' },
        cellStyles: { padding: '4px' },
        caption: null
      });
    });

    it('TINYMCE-15197: cellspacing attribute is kept when cellspacing is hidden', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', { cellspacing: false });
      await pSaveWithNewWidth(editor, '<table style="width: 100%;" cellspacing="4"><tbody><tr><td>x</td></tr></tbody></table>');
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { border: '1', cellspacing: '4' },
        styles: { 'width': '50%', 'border-collapse': 'collapse' },
        cellStyles: {},
        caption: null
      });
    });

    it('TINYMCE-15197: every appearance value is kept when all fields are hidden', async () => {
      const editor = hook.editor();
      editor.options.set('table_appearance_options', false);
      await pSaveWithNewWidth(editor,
        '<table style="width: 100%; border-spacing: 5px; border-width: 3px;" border="3" cellspacing="4">' +
        '<caption>Caption</caption><tbody><tr><td style="padding: 4px;">x</td></tr></tbody></table>'
      );
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { border: '3', cellspacing: '4' },
        styles: { 'width': '50%', 'border-spacing': '5px', 'border-width': '3px', 'border-collapse': 'collapse' },
        cellStyles: { padding: '4px' },
        caption: 'Caption'
      });
    });

    it('TINYMCE-15197: border, cellpadding and cellspacing attributes are kept when all fields are hidden and table_style_by_css is false', async () => {
      const editor = hook.editor();
      editor.options.set('table_style_by_css', false);
      editor.options.set('table_appearance_options', false);
      await pSaveWithNewWidth(editor, '<table width="100%" border="3" cellpadding="4" cellspacing="5"><tbody><tr><td>x</td></tr></tbody></table>');
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { width: '50%', border: '3', cellpadding: '4', cellspacing: '5' },
        styles: { 'border-collapse': 'collapse' },
        cellStyles: {},
        caption: null
      });
    });

    it('TINYMCE-15197: configured default styles do not overwrite border-width and border-spacing when all fields are hidden', async () => {
      const editor = hook.editor();
      editor.options.set('table_default_styles', { 'border-collapse': 'collapse', 'border-width': '1px', 'border-spacing': '2px' });
      editor.options.set('table_appearance_options', false);
      await pSaveWithNewWidth(editor, '<table style="width: 100%; border-spacing: 5px; border-width: 3px;" border="3"><tbody><tr><td>x</td></tr></tbody></table>');
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { border: '3' },
        styles: { 'width': '50%', 'border-spacing': '5px', 'border-width': '3px', 'border-collapse': 'collapse' },
        cellStyles: {},
        caption: null
      });
    });

    it('TINYMCE-15197: configured default attributes do not overwrite border, cellpadding and cellspacing when all fields are hidden', async () => {
      const editor = hook.editor();
      editor.options.set('table_style_by_css', false);
      editor.options.set('table_default_attributes', { border: '1', cellpadding: '1', cellspacing: '2' });
      editor.options.set('table_appearance_options', false);
      await pSaveWithNewWidth(editor, '<table width="100%" border="3" cellpadding="4" cellspacing="5"><tbody><tr><td>x</td></tr></tbody></table>');
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { width: '50%', border: '3', cellpadding: '4', cellspacing: '5' },
        styles: { 'border-collapse': 'collapse' },
        cellStyles: {},
        caption: null
      });
    });

    it('TINYMCE-15197: configured default attributes are still applied when the fields are shown', async () => {
      const editor = hook.editor();
      editor.options.set('table_default_attributes', { border: '1', cellpadding: '1', cellspacing: '2' });
      await pSaveWithNewWidth(editor, '<table style="width: 100%;"><tbody><tr><td>x</td></tr></tbody></table>');
      assert.deepEqual<TableState>(getTableState(editor), {
        attrs: { border: '1', cellpadding: '1', cellspacing: '2' },
        styles: { 'width': '50%', 'border-collapse': 'collapse' },
        cellStyles: {},
        caption: null
      });
    });
  });
});
