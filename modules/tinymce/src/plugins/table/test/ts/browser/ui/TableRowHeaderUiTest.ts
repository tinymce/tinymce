import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import { clickOnButton, makeCell, pClickOnMenuItem } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.ui.TableRowHeaderUiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    menu: {
      table: { title: 'Table', items: 'tablerowheader' },
    },
    menubar: 'table',
    toolbar: 'tablerowheader',
    indent: false,
  }, [ Plugin ], true);

  const setEditorContentAndSelection = (editor: Editor, tableSection: 'thead' | 'tbody') => {
    editor.setContent(
      '<table>' +
        `<${tableSection}>` +
          '<tr>' +
            makeCell('td', '0-0', 'none') +
            makeCell('td', '0-1', 'none', 'selectionStart') +
          '</tr>' +
          '<tr>' +
            makeCell('td', '1-0', 'none') +
            makeCell('td', '1-1', 'none', 'selectionEnd') +
          '</tr>' +
        `</${tableSection}>` +
      '</table>'
    );

    TinySelections.setCursor(editor, [ 0, 0, 0, 1 ], 0);
  };

  const tableWithRowHeaders = (
    '<table>' +
      '<thead>' +
        '<tr>' +
          makeCell('td', '0-0', 'none') +
          makeCell('td', '0-1', 'none') +
        '</tr>' +
        '<tr>' +
          makeCell('td', '1-0', 'none') +
          makeCell('td', '1-1', 'none') +
        '</tr>' +
      '</thead>' +
    '</table>'
  );

  const tableWithoutRowHeaders = (
    '<table>' +
      '<tbody>' +
        '<tr>' +
          makeCell('td', '0-0', 'none') +
          makeCell('td', '0-1', 'none') +
        '</tr>' +
        '<tr>' +
          makeCell('td', '1-0', 'none') +
          makeCell('td', '1-1', 'none') +
        '</tr>' +
      '</tbody>' +
    '</table>'
  );

  it('TINY-7481: Can toggle headers on with toolbar button', () => {
    const editor = hook.editor();
    setEditorContentAndSelection(editor, 'tbody');

    clickOnButton(editor, 'Row header');

    TinyAssertions.assertContent(editor, tableWithRowHeaders);
  });

  it('TINY-7481: Can toggle headers on with menuitem', async () => {
    const editor = hook.editor();
    setEditorContentAndSelection(editor, 'tbody');

    await pClickOnMenuItem(editor, 'Row header');

    TinyAssertions.assertContent(editor, tableWithRowHeaders);
  });

  it('TINY-7481: Can toggle headers off with toolbar button', () => {
    const editor = hook.editor();
    setEditorContentAndSelection(editor, 'thead');

    clickOnButton(editor, 'Row header');

    TinyAssertions.assertContent(editor, tableWithoutRowHeaders);
  });

  it('TINY-7481: Can toggle headers off with menuitem', async () => {
    const editor = hook.editor();
    setEditorContentAndSelection(editor, 'thead');

    await pClickOnMenuItem(editor, 'Row header');

    TinyAssertions.assertContent(editor, tableWithoutRowHeaders);
  });
});
