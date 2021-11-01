import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import { clickOnButton, makeCell, pClickOnMenuItem } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableColumnHeaderUiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      table: { title: 'Table', items: 'tablecolheader' },
    },
    menubar: 'table',
    toolbar: 'tablecolheader',
    indent: false,
  }, [ Plugin ], true);

  const setEditorAndSelectionForOn = (editor: Editor, type: 'th' | 'td') => {
    editor.setContent(
      '<table>' +
        '<tbody>' +
          '<tr>' +
            makeCell(type, '0-0', 'none', 'selectionStart') +
            makeCell(type, '0-1', 'none', 'selectionEnd') +
          '</tr>' +
          '<tr>' +
            makeCell(type, '1-0', 'none') +
            makeCell(type, '1-1', 'none') +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );

    TinySelections.setCursor(editor, [ 0, 0, 0, 1 ], 0);
  };

  const getStructure = (type: 'th' | 'td') => {
    const scope = type === 'th' ? 'row' : 'none';
    return (
      '<table>' +
        '<tbody>' +
          '<tr>' +
            makeCell(type, '0-0', scope) +
            makeCell(type, '0-1', scope) +
          '</tr>' +
          '<tr>' +
            makeCell(type, '1-0', scope) +
            makeCell(type, '1-1', scope) +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );
  };

  it('TINY-7481: Can toggle headers on with the toolbar button', () => {
    const editor = hook.editor();
    setEditorAndSelectionForOn(editor, 'td');

    clickOnButton(editor, 'Column header');
    TinyAssertions.assertContent(editor, getStructure('th'));
  });

  it('TINY-7481: Can toggle headers on with the menuitem', async () => {
    const editor = hook.editor();
    setEditorAndSelectionForOn(editor, 'td');

    await pClickOnMenuItem(editor, 'Column header');
    TinyAssertions.assertContent(editor, getStructure('th'));
  });

  it('TINY-7481: Can toggle headers off with the toolbar button', () => {
    const editor = hook.editor();
    setEditorAndSelectionForOn(editor, 'th');

    clickOnButton(editor, 'Column header');
    TinyAssertions.assertContent(editor, getStructure('td'));
  });

  it('TINY-7481: Can toggle headers off with the menuitem', async () => {
    const editor = hook.editor();
    setEditorAndSelectionForOn(editor, 'th');

    await pClickOnMenuItem(editor, 'Column header');
    TinyAssertions.assertContent(editor, getStructure('td'));
  });
});
