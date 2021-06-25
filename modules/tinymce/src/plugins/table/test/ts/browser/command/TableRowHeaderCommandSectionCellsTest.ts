/* eslint-disable mocha/no-exclusive-tests */
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { clickOnButton, makeCell } from '../../module/test/TableModifiersTestUtils';

describe('browser.tinymce.plugins.table.command.TableRowHeaderCommandSectionCellsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    toolbar: 'tablerowheader',
    table_header_type: 'sectionCells',
    base_url: '/project/tinymce/js/tinymce',
  }, [ Plugin, Theme ], true);

  const clickButton = (editor: Editor) =>
    clickOnButton(editor, 'Row header');

  const setEditorContentTableAndSelection = (editor: Editor, level: number, row: number, column: number, content: string) => {
    editor.setContent(content);

    TinySelections.setCursor(editor, [ 0, level, row, column ], 0);
  };

  context('Row headers can be toggled on', () => {
    context('When there are no other header rows', () => {
      it('TINY-7481: Top cell is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 0, 0, 0, (
          '<table>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '0-0', false, true, true, true) +
                makeCell('th', '0-1') +
              '</tr>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('th', '0-0', true) +
                makeCell('th', '0-1', true) +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));
      });

      it('TINY-7481: Top row is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 0, 0, 0, (
          '<table>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '0-0', false, true, true) +
                makeCell('th', '0-1', false, true, false, true) +
              '</tr>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('th', '0-0', true) +
                makeCell('th', '0-1', true) +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));
      });

      it('TINY-7481: Bottom row is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 0, 1, 0, (
          '<table>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
              '<tr>' +
                makeCell('td', '1-0', false, true, true) +
                makeCell('th', '1-1', false, true, false, true) +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('th', '1-0', true) +
                makeCell('th', '1-1', true) +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));
      });

      it('TINY-7481: Whole column is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 0, 0, 1, (
          '<table>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1', false, true, true) +
              '</tr>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1', false, true, false, true) +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('th', '0-0', true) +
                makeCell('th', '0-1', true) +
              '</tr>' +
              '<tr>' +
                makeCell('th', '1-0', true) +
                makeCell('th', '1-1', true) +
              '</tr>' +
            '</thead>' +
          '</table>'
        ));
      });
    });

    context('When there are other headers', () => {
      it('TINY-7481: Top cell is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 1, 0, 1, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1', false, true, true, true) +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
              '<tr>' +
                makeCell('th', '1-0', true) +
                makeCell('th', '1-1', true) +
              '</tr>' +
            '</thead>' +
          '</table>'
        ));
      });

      it('TINY-7481: A whole row is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 1, 0, 1, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '1-0', false, true, true) +
                makeCell('th', '1-1', false, true, false, true) +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
              '<tr>' +
                makeCell('th', '1-0', true) +
                makeCell('th', '1-1', true) +
              '</tr>' +
            '</thead>' +
          '</table>'
        ));
      });

      it('TINY-7481: Whole column is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 1, 0, 1, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1', false, true, true) +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1', false, true, false, true) +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('th', '0-0', true) +
                makeCell('th', '0-1', true) +
              '</tr>' +
              '<tr>' +
                makeCell('th', '1-0', true) +
                makeCell('th', '1-1', true) +
              '</tr>' +
            '</thead>' +
          '</table>'
        ));
      });
    });
  });

  context('Row headers can be toggled off', () => {
    context('When there are no other body rows', () => {
      it('TINY-7481: Top cell is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 0, 0, 0, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0', false, true, true, true) +
                makeCell('th', '0-1') +
              '</tr>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1') +
              '</tr>' +
            '</thead>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1') +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('td', '0-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));
      });

      it('TINY-7481: Top row is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 0, 0, 0, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0', false, true, true) +
                makeCell('th', '0-1', false, true, false, true) +
              '</tr>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1') +
              '</tr>' +
            '</thead>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1') +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('td', '0-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));
      });

      it('TINY-7481: Bottom row is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 0, 1, 0, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
              '<tr>' +
                makeCell('td', '1-0', false, true, true) +
                makeCell('th', '1-1', false, true, false, true) +
              '</tr>' +
            '</thead>' +
          '</table>'
        ));

        clickButton(editor);

        TinyAssertions.assertContent(editor, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('td', '1-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));
      });

      it('TINY-7481: Whole column is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 0, 0, 1, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1', false, true, true) +
              '</tr>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1', false, true, false, true) +
              '</tr>' +
            '</thead>' +
          '</table>'
        ));

        clickButton(editor);

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

    context('When there are other body rows', () => {
      it('TINY-7481: Top cell is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 1, 0, 1, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '1-0') +
                makeCell('th', '1-1', false, true, true, true) +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));

        clickButton(editor);

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

      it('TINY-7481: A whole row is selected', () => {
        const editor = hook.editor();
        setEditorContentTableAndSelection(editor, 1, 0, 1, (
          '<table>' +
            '<thead>' +
              '<tr>' +
                makeCell('td', '1-0', false, true, true) +
                makeCell('th', '1-1', false, true, false, true) +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              '<tr>' +
                makeCell('td', '0-0') +
                makeCell('th', '0-1') +
              '</tr>' +
            '</tbody>' +
          '</table>'
        ));

        clickButton(editor);

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
  });
});
