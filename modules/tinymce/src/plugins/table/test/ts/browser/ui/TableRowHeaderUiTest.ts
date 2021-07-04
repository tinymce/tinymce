import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

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
  }, [ Plugin, Theme ], true);

  const setEditorContentAndSelection = (editor: Editor, headBody: string) => {
    editor.setContent(
      '<table>' +
        `<t${headBody}>` +
          '<tr>' +
            makeCell('td', '0-0') +
            makeCell('td', '0-1', false, true, true) +
          '</tr>' +
          '<tr>' +
            makeCell('td', '1-0') +
            makeCell('td', '1-1', false, true, false, true) +
          '</tr>' +
        `</t${headBody}>` +
      '</table>'
    );

    TinySelections.setCursor(editor, [ 0, 0, 0, 1 ], 0);
  };

  const resultForOn = (
    '<table>' +
      '<thead>' +
        '<tr>' +
          makeCell('td', '0-0', true) +
          makeCell('td', '0-1', true) +
        '</tr>' +
        '<tr>' +
          makeCell('td', '1-0', true) +
          makeCell('td', '1-1', true) +
        '</tr>' +
      '</thead>' +
    '</table>'
  );

  const resultForOff = (
    '<table>' +
      '<tbody>' +
        '<tr>' +
          makeCell('td', '1-0') +
          makeCell('td', '1-1') +
        '</tr>' +
        '<tr>' +
          makeCell('td', '0-0') +
          makeCell('td', '0-1') +
        '</tr>' +
      '</tbody>' +
    '</table>'
  );

  it('TINY-7481: Can toggle headers on with toolbar button', () => {
    const editor = hook.editor();
    setEditorContentAndSelection(editor, 'body');

    clickOnButton(editor, 'Row header');

    TinyAssertions.assertContent(editor, resultForOn);
  });

  it('TINY-7481: Can toggle headers on with menuitem', async () => {
    const editor = hook.editor();
    setEditorContentAndSelection(editor, 'body');

    await pClickOnMenuItem(editor, 'Row header');

    TinyAssertions.assertContent(editor, resultForOn);
  });

  it('TINY-7481: Can toggle headers off with toolbar button', () => {
    const editor = hook.editor();
    setEditorContentAndSelection(editor, 'head');

    clickOnButton(editor, 'Row header');

    TinyAssertions.assertContent(editor, resultForOff);
  });

  it('TINY-7481: Can toggle headers off with menuitem', async () => {
    const editor = hook.editor();
    setEditorContentAndSelection(editor, 'head');

    await pClickOnMenuItem(editor, 'Row header');

    TinyAssertions.assertContent(editor, resultForOff);
  });
});
