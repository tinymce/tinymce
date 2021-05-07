import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/mcagar';
import { assert } from 'chai';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.command.ModifiyClassesCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, [ Plugin, Theme ], true);

  const cleanTableHtml = (html: string) =>
    html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  const execCmdAndAssertEvent = (label: string, editor: Editor, cmdName: string, ui?: boolean, data?: string) => {
    assert.lengthOf(events, 0, label + ', events not zero');
    editor.execCommand(cmdName, ui, data);
    assert.lengthOf(events, 1, label + ', events not one');
    assert.equal(events[0].type, 'tablemodified', label + ', event not tablemodified');
    assert.isTrue(events[0].structure, label + ', structure is not true');
    assert.isFalse(events[0].style, label + ', style is not false');
    events = [];
  };

  context('TINY-7163: Modify cell class', () => {
    context('Can use mceTableCellToggleClass to toggle the cell class', () => {
      context('When there is no class already on the cell', () => {
        const getContentWithoutClass = () => {
          return (
            '<table>' +
              '<tbody>' +
                '<tr>' +
                  '<td class="">1</td>' +
                  '<td>2</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>'
          );
        };

        const getContentWithClass = () => {
          return (
            '<table>' +
              '<tbody>' +
                '<tr>' +
                  '<td class="a">1</td>' +
                  '<td>2</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>'
          );
        };

        it('Can be toggled on', () => {
          const editor = hook.editor();
          editor.setContent(getContentWithoutClass());

          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

          execCmdAndAssertEvent('TINY-7163', editor, 'mceTableCellToggleClass', false, 'a');

          assert.equal(cleanTableHtml(editor.getContent()), getContentWithClass());
        });

        it('Can be toggled off', () => {
          const editor = hook.editor();
          editor.setContent(getContentWithClass());

          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

          execCmdAndAssertEvent('TINY-7163', editor, 'mceTableCellToggleClass', false, 'a');

          assert.equal(cleanTableHtml(editor.getContent()), getContentWithoutClass());
        });
      });

      context('When there is already a class on the cell, which should not be deleted', () => {
        const getContentWithoutClass = () => {
          return (
            '<table>' +
              '<tbody>' +
                '<tr>' +
                  '<td class="b">1</td>' +
                  '<td>2</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>'
          );
        };

        const getContentWithClass = () => {
          return (
            '<table>' +
              '<tbody>' +
                '<tr>' +
                  '<td class="b a">1</td>' +
                  '<td>2</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>'
          );
        };

        it('Can be toggled on', () => {
          const editor = hook.editor();
          editor.setContent(getContentWithoutClass());

          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

          execCmdAndAssertEvent('TINY-7163', editor, 'mceTableCellToggleClass', false, 'a');

          assert.equal(cleanTableHtml(editor.getContent()), getContentWithClass());
        });

        it('Can be toggled off', () => {
          const editor = hook.editor();
          editor.setContent(getContentWithClass());

          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

          execCmdAndAssertEvent('TINY-7163', editor, 'mceTableCellToggleClass', false, 'a');

          assert.equal(cleanTableHtml(editor.getContent()), getContentWithoutClass());
        });
      });
    });

    context('Can use mceTableToggleClass to toggle the table class', () => {
      context('When there is no class already on the cell', () => {
        const getContentWithoutClass = () => {
          return (
            '<table>' +
              '<tbody>' +
                '<tr>' +
                  '<td>1</td>' +
                  '<td>2</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>'
          );
        };

        const getContentWithClass = () => {
          return (
            '<table class=" a">' +
              '<tbody>' +
                '<tr>' +
                  '<td>1</td>' +
                  '<td>2</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>'
          );
        };

        it('Can be toggled on', () => {
          const editor = hook.editor();
          editor.setContent(getContentWithoutClass());

          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

          execCmdAndAssertEvent('TINY-7163', editor, 'mceTableToggleClass', false, 'a');

          assert.equal(cleanTableHtml(editor.getContent()), getContentWithClass());
        });

        it('Can be toggled off', () => {
          const editor = hook.editor();
          editor.setContent(getContentWithClass());

          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

          execCmdAndAssertEvent('TINY-7163', editor, 'mceTableToggleClass', false, 'a');

          assert.equal(cleanTableHtml(editor.getContent()), getContentWithoutClass());
        });
      });

      context('When there is already a class on the cell, which should not be deleted', () => {
        const getContentWithoutClass = () => {
          return (
            '<table class="b">' +
              '<tbody>' +
                '<tr>' +
                  '<td>1</td>' +
                  '<td>2</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>'
          );
        };

        const getContentWithClass = () => {
          return (
            '<table class="b a">' +
              '<tbody>' +
                '<tr>' +
                  '<td>1</td>' +
                  '<td>2</td>' +
                '</tr>' +
              '</tbody>' +
            '</table>'
          );
        };

        it('Can be toggled on', () => {
          const editor = hook.editor();
          editor.setContent(getContentWithoutClass());

          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

          execCmdAndAssertEvent('TINY-7163', editor, 'mceTableToggleClass', false, 'a');

          assert.equal(cleanTableHtml(editor.getContent()), getContentWithClass());
        });

        it('Can be toggled off', () => {
          const editor = hook.editor();
          editor.setContent(getContentWithClass());

          TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1, true);

          execCmdAndAssertEvent('TINY-7163', editor, 'mceTableToggleClass', false, 'a');

          assert.equal(cleanTableHtml(editor.getContent()), getContentWithoutClass());
        });
      });
    });
  });
});
