import { Assertions } from '@ephox/agar';
import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { AppearanceField } from 'tinymce/plugins/table/api/Options';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

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
});
