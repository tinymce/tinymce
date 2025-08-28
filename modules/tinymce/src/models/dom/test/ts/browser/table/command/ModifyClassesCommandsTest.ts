import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.models.dom.table.command.ModifyClassesCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    valid_styles: {
      '*': 'height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('TableModified', logEvent);
    }
  }, [], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  const setContentAndSelection = (editor: Editor, content: string, startCellOffset: number, endCellOffset: number) => {
    editor.setContent(content);
    TinySelections.setSelection(editor, [ 0, 0, 0 ], startCellOffset, [ 0, 0, 0 ], endCellOffset);
  };

  const setContentAndCursor = (editor: Editor, content: string) => {
    editor.setContent(content);
    TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
  };

  const execCmdAndAssertEvent = (editor: Editor, cmdName: string, data: string) => {
    assert.lengthOf(events, 0, 'Before executing the command');
    editor.execCommand(cmdName, false, data);
    assert.lengthOf(events, 1, 'Verifying after command, step 1');
    assert.equal(events[0].type, 'tablemodified', 'Verifying after command, step 2');
    assert.isFalse(events[0].structure, 'Verifying after command, step 3');
    assert.isTrue(events[0].style, 'Verifying after command, step 4');
    events = [];
  };

  context('Can use mceTableCellToggleClass to toggle the cell class', () => {
    context('When there is no class already on the cell', () => {
      const contentWithoutClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td>1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      const contentWithClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td class="a">1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      context('With a selection of one', () => {
        it('TINY-7163: Can be toggled on', () => {
          const editor = hook.editor();
          setContentAndSelection(editor, contentWithoutClass, 0, 1);

          execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', 'a');
          TinyAssertions.assertContent(editor, contentWithClass);
        });

        it('TINY-7163: Can be toggled off', () => {
          const editor = hook.editor();
          setContentAndSelection(editor, contentWithClass, 0, 1);

          execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', 'a');
          TinyAssertions.assertContent(editor, contentWithoutClass);
        });
      });

      context('With a selection of several cells', () => {
        const contentWithDoubleClass = (
          '<table>' +
            '<tbody>' +
              '<tr>' +
                '<td class="a">1</td>' +
                '<td class="a">2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>'
        );

        const contentWithoutClassDoubleSelection = (
          '<table>' +
            '<tbody>' +
              '<tr>' +
                '<td data-mce-first-selected="1" data-mce-selected="1">1</td>' +
                '<td data-mce-last-selected="1" data-mce-selected="1">2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>'
        );

        const contentWithMixedClassDoubleSelection = (
          '<table>' +
            '<tbody>' +
              '<tr>' +
                '<td data-mce-first-selected="1" data-mce-selected="1" class="a">1</td>' +
                '<td data-mce-last-selected="1" data-mce-selected="1">2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>'
        );

        const contentWithClassDoubleSelection = (
          '<table>' +
            '<tbody>' +
              '<tr>' +
                '<td data-mce-first-selected="1" data-mce-selected="1" class="a">1</td>' +
                '<td data-mce-last-selected="1" data-mce-selected="1" class="a">2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>'
        );

        it('TINY-7691: Can be toggled on', () => {
          const editor = hook.editor();
          setContentAndCursor(editor, contentWithoutClassDoubleSelection);

          execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', 'a');
          TinyAssertions.assertContent(editor, contentWithDoubleClass);
        });

        it('TINY-7691: Can be toggled on while mixed', () => {
          const editor = hook.editor();
          setContentAndCursor(editor, contentWithMixedClassDoubleSelection);

          execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', 'a');
          TinyAssertions.assertContent(editor, contentWithDoubleClass);
        });

        it('TINY-7163: Can be toggled off', () => {
          const editor = hook.editor();
          setContentAndCursor(editor, contentWithClassDoubleSelection);

          execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', 'a');
          TinyAssertions.assertContent(editor, contentWithoutClass);
        });
      });
    });

    context('When there is already a class on the cell, which should not be deleted', () => {
      const contentWithoutClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td class="b">1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      const contentWithClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td class="b a">1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      it('TINY-7163: Can be toggled on', () => {
        const editor = hook.editor();
        setContentAndSelection(editor, contentWithoutClass, 0, 1);

        execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', 'a');
        TinyAssertions.assertContent(editor, contentWithClass);
      });

      it('TINY-7163: Can be toggled off', () => {
        const editor = hook.editor();
        setContentAndSelection(editor, contentWithClass, 0, 1);

        execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', 'a');
        TinyAssertions.assertContent(editor, contentWithoutClass);
      });
    });
  });

  context('Can use mceTableToggleClass to toggle the table class', () => {
    context('When there is no class already on the table', () => {
      const contentWithoutClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td>1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      const contentWithClass = (
        '<table class=" a">' +
          '<tbody>' +
            '<tr>' +
              '<td>1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      it('TINY-7163: Can be toggled on', () => {
        const editor = hook.editor();
        setContentAndSelection(editor, contentWithoutClass, 0, 1);

        execCmdAndAssertEvent(editor, 'mceTableToggleClass', 'a');
        TinyAssertions.assertContent(editor, contentWithClass);
      });

      it('TINY-7163: Can be toggled off', () => {
        const editor = hook.editor();
        setContentAndSelection(editor, contentWithClass, 0, 1);

        execCmdAndAssertEvent(editor, 'mceTableToggleClass', 'a');
        TinyAssertions.assertContent(editor, contentWithoutClass);
      });
    });

    context('When there is already a class on the table, which should not be deleted', () => {
      const contentWithoutClass = (
        '<table class="b">' +
          '<tbody>' +
            '<tr>' +
              '<td>1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      const contentWithClass = (
        '<table class="b a">' +
          '<tbody>' +
            '<tr>' +
              '<td>1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      context('Can be toggled on', () => {
        const testWithSelection = (startOffset: number, endOffset: number) => {
          const editor = hook.editor();
          setContentAndSelection(editor, contentWithoutClass, startOffset, endOffset);
          execCmdAndAssertEvent(editor, 'mceTableToggleClass', 'a');
          TinyAssertions.assertContent(editor, contentWithClass);
        };

        it('TINY-7163: When the first cell is selected', () => {
          testWithSelection(0, 1);
        });

        it('TINY-7163: When the second cell is selected', () => {
          testWithSelection(1, 2);
        });

        it('TINY-7163: When both cells are selected', () => {
          testWithSelection(0, 2);
        });
      });

      it('TINY-7163: Can be toggled off', () => {
        const editor = hook.editor();
        setContentAndSelection(editor, contentWithClass, 0, 1);
        execCmdAndAssertEvent(editor, 'mceTableToggleClass', 'a');
        TinyAssertions.assertContent(editor, contentWithoutClass);
      });
    });
  });

  it('TINY-9459: Should not apply mceTableToggleClass command on table in noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      const initalContent = '<table><tbody><tr><td>cell</td></tr></tbody></table>';
      editor.setContent(initalContent);
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      editor.execCommand('mceTableToggleClass', false, 'a');
      TinyAssertions.assertContent(editor, initalContent);
    });
  });
});
