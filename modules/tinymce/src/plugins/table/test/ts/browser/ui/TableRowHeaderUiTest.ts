/* eslint-disable mocha/no-exclusive-tests */
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { clickOnButton, pClickOnMenuItem } from '../../module/test/TableModifiersTestUtils';

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

  const makeCell = (type: string, content: string, hasScope?: boolean, isSelected?: boolean, isStart?: boolean, isEnd?: boolean) => {
    const getSelection = () => {
      const attributes: string[] = [ '' ];

      if (isSelected) {
        if (isStart) {
          attributes.push('data-mce-first-selected="1"');
        }

        if (isEnd) {
          attributes.push('data-mce-last-selected="1"');
        }

        attributes.push('data-mce-selected="1"');
      }

      return attributes.join(' ');
    };

    const getScope = () => {
      if (hasScope) {
        return ' scope="col"';
      } else {
        return '';
      }
    };

    return `<${type}${getScope()}${getSelection()}>Cell ${content}</${type}>`;
  };

  const setEditorContentTableAndSelection = (editor: Editor, level: number, row: number, column: number, content: string) => {
    editor.setContent(content);

    TinySelections.setCursor(editor, [ 0, level, row, column ], 0);
  };

  it('TINY-7481: Can toggle headers on with toolbar button', () => {
    const editor = hook.editor();
    setEditorContentTableAndSelection(editor, 0, 0, 1, (
      '<table>' +
        '<tbody>' +
          '<tr>' +
            makeCell('td', '0-0') +
            makeCell('td', '0-1', false, true, true) +
          '</tr>' +
          '<tr>' +
            makeCell('td', '1-0') +
            makeCell('td', '1-1', false, true, false, true) +
          '</tr>' +
        '</tbody>' +
      '</table>'
    ));

    clickOnButton(editor, 'Row header');

    TinyAssertions.assertContent(editor, (
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
    ));
  });

  it('TINY-7481: Can toggle headers on with menuitem', async () => {
    const editor = hook.editor();
    setEditorContentTableAndSelection(editor, 0, 0, 1, (
      '<table>' +
        '<tbody>' +
          '<tr>' +
            makeCell('td', '0-0') +
            makeCell('td', '0-1', false, true, true) +
          '</tr>' +
          '<tr>' +
            makeCell('td', '1-0') +
            makeCell('td', '1-1', false, true, false, true) +
          '</tr>' +
        '</tbody>' +
      '</table>'
    ));

    await pClickOnMenuItem(editor, 'Row header');

    TinyAssertions.assertContent(editor, (
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
    ));
  });

  it('TINY-7481: Can toggle headers off with toolbar button', () => {
    const editor = hook.editor();
    setEditorContentTableAndSelection(editor, 0, 0, 1, (
      '<table>' +
        '<thead>' +
          '<tr>' +
            makeCell('td', '0-0') +
            makeCell('td', '0-1', false, true, true) +
          '</tr>' +
          '<tr>' +
            makeCell('td', '1-0') +
            makeCell('td', '1-1', false, true, false, true) +
          '</tr>' +
        '</thead>' +
      '</table>'
    ));

    clickOnButton(editor, 'Row header');

    TinyAssertions.assertContent(editor, (
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
    ));
  });

  it('TINY-7481: Can toggle headers off with menuitem', async () => {
    const editor = hook.editor();
    setEditorContentTableAndSelection(editor, 0, 0, 1, (
      '<table>' +
        '<thead>' +
          '<tr>' +
            makeCell('td', '0-0') +
            makeCell('td', '0-1', false, true, true) +
          '</tr>' +
          '<tr>' +
            makeCell('td', '1-0') +
            makeCell('td', '1-1', false, true, false, true) +
          '</tr>' +
        '</thead>' +
      '</table>'
    ));

    await pClickOnMenuItem(editor, 'Row header');

    TinyAssertions.assertContent(editor, (
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
    ));
  });
});
