import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Css, Dimension, SelectorFilter, SelectorFind, SugarElement } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

interface PartialTableModifiedEvent {
  readonly type: string;
  readonly structure: boolean;
  readonly style: boolean;
}

interface MergeCellTest {
  readonly before: string;
  readonly after: string;
  readonly expectedEvents: PartialTableModifiedEvent[];
}

describe('browser.tinymce.models.dom.table.command.MergeCellCommandTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false,
    setup: (ed: Editor) => ed.on('TableModified', logModifiedEvent),
  }, []);

  let modifiedEvents: PartialTableModifiedEvent[] = [];
  const logModifiedEvent = (event: PartialTableModifiedEvent) => {
    modifiedEvents.push({
      type: event.type,
      structure: event.structure,
      style: event.style,
    });
  };

  const clearEvents = () => modifiedEvents = [];
  const defaultEvent: PartialTableModifiedEvent = { type: 'tablemodified', structure: true, style: false };

  const testMerge = (editor: Editor, test: MergeCellTest) => {
    clearEvents();
    editor.setContent(test.before);
    editor.selection.select(editor.dom.select('td[data-mce-selected]')[0], true);
    editor.selection.collapse(true);
    editor.execCommand('mceTableMergeCells');
    assert.equal(cleanTableHtml(editor.getContent()), test.after);
    assert.deepEqual(modifiedEvents, test.expectedEvents);
  };

  const cleanTableHtml = (html: string) => {
    return html.replace(/<p>(&nbsp;|<br[^>]+>)<\/p>$/, '');
  };

  const getWidth = (elem: SugarElement<Element>) =>
    Dimension.parse(Css.getRaw(elem, 'width').getOrDie(), [ 'relative' ]).getOrDie().value;

  it('TBA: Should merge all cells into one', () => {
    const editor = hook.editor();
    testMerge(editor, {
      before: (
        '<table>' +
          '<tbody>' +
          '<tr><td data-mce-selected="1" data-mce-first-selected="1">a1</td><td data-mce-selected="1">b1</td></tr>' +
          '<tr><td data-mce-selected="1">a2</td><td data-mce-selected="1" data-mce-last-selected="1">b2</td></tr>' +
          '</tbody>' +
          '</table>'
      ),
      after: (
        '<table>' +
          '<tbody>' +
          '<tr><td colspan="2" rowspan="2">' +
          'a1<br>b1<br>a2<br>b2' +
          '</td></tr><tr></tr>' +
          '</tbody>' +
          '</table>'
      ),
      expectedEvents: [ defaultEvent ],
    });
  });

  it('TBA: Should merge cells in two cols/rows into one cell with colspan', () => {
    const editor = hook.editor();
    testMerge(editor, {
      before: (
        '<table>' +
          '<tbody>' +
          '<tr><td data-mce-selected="1" data-mce-first-selected="1">a1</td><td data-mce-selected="1">b1</td></tr>' +
          '<tr><td data-mce-selected="1">a2</td><td data-mce-selected="1" data-mce-last-selected="1">b2</td></tr>' +
          '<tr><td>a3</td><td>b3</td></tr>' +
          '</tbody>' +
          '</table>'
      ),
      after: (
        '<table>' +
          '<tbody>' +
          '<tr><td colspan="2" rowspan="2">a1<br>b1<br>a2<br>b2</td></tr>' +
          '<tr></tr>' +
          '<tr><td>a3</td><td>b3</td></tr>' +
          '</tbody>' +
        '</table>'
      ),
      expectedEvents: [ defaultEvent ],
    });
  });

  it('TBA: Should merge b3+c3 but not reduce a2a3', () => {
    const editor = hook.editor();
    testMerge(editor, {
      before: (
        '<table>' +
            '<tbody>' +
              '<tr>' +
                '<td>a1</td>' +
                '<td>b1</td>' +
                '<td>c1</td>' +
              '</tr>' +
              '<tr>' +
                '<td rowspan="2">a2a3</td>' +
                '<td>b2</td>' +
                '<td>c2</td>' +
              '</tr>' +
              '<tr>' +
                '<td data-mce-selected="1" data-mce-first-selected="1">b3</td>' +
                '<td data-mce-selected="1" data-mce-last-selected="1">c3</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>'
      ),
      after: (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td>a1</td>' +
              '<td>b1</td>' +
            '<td>c1</td>' +
            '</tr>' +
            '<tr>' +
              '<td rowspan="2">a2a3</td>' +
              '<td>b2</td>' +
              '<td>c2</td>' +
            '</tr>' +
            '<tr>' +
              '<td colspan="2">b3<br>c3</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      ),
      expectedEvents: [ defaultEvent ],
    });
  });

  it('TINY-6901: Will apply correct size to cell with colspan after cell merge', () => {
    const editor = hook.editor();
    const before = (
      '<table style="width: 25.4582%;">' +
        '<tbody>' +
          '<tr>' +
            '<td style="width: 44.9721%;" data-mce-selected="1" data-mce-first-selected="1"></td>' +
            '<td style="width: 54.7486%;" data-mce-selected="1" data-mce-last-selected="1"></td>' +
          '</tr>' +
          '<tr>' +
            '<td style="width: 44.9721%;"></td>' +
            '<td style="width: 54.7486%;"></td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );

    editor.setContent(before);
    const cols = SelectorFilter.descendants(TinyDom.body(editor), 'td[data-mce-selected]');
    const totalColsWidth = Arr.foldl(cols, (acc, col) => acc + getWidth(col), 0);
    editor.selection.select(cols[0].dom, true);
    editor.selection.collapse(true);
    editor.execCommand('mceTableMergeCells');
    const colspan = SelectorFind.descendant(TinyDom.body(editor), 'td[colspan="2"]').getOrDie();
    assert.approximately(getWidth(colspan), totalColsWidth, 2, 'Check new cell is similar width the the two cells that were merged');
  });

  it('TINY-9459: Should not merge cells in table inside noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      testMerge(editor, {
        before: (
          '<table>' +
            '<tbody>' +
            '<tr><td data-mce-selected="1" data-mce-first-selected="1">a1</td><td data-mce-selected="1">b1</td></tr>' +
            '<tr><td data-mce-selected="1">a2</td><td data-mce-selected="1" data-mce-last-selected="1">b2</td></tr>' +
            '</tbody>' +
            '</table>'
        ),
        after: (
          '<table>' +
            '<tbody>' +
            '<tr><td>a1</td><td>b1</td></tr>' +
            '<tr><td>a2</td><td>b2</td></tr>' +
            '</tbody>' +
            '</table>'
        ),
        expectedEvents: [ ]
      });
    });
  });

  /*
      {
        message: 'Should remove all rowspans since the table is fully merged',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td rowspan="2" data-mce-selected="1" data-mce-first-selected="1">a1</td><td data-mce-selected="1">b1</td></tr>' +
          '<tr><td data-mce-selected="1" data-mce-last-selected="1">b2</td></tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td>a1</td><td>b1b2</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should remove all colspans since the table is fully merged',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td colspan="2">a1</td></tr>' +
          '<tr><td data-mce-selected="1" data-mce-first-selected="1">a2</td><td data-mce-selected="1" data-mce-last-selected="1">b2</td></tr>' +
          '</tbody>' +
          '</table>'
          ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td>a1</td></tr>' +
          '<tr><td>a2b2</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should reduce rowspans to 2 keep the colspan and remove one tr',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td colspan="2" rowspan="2">a1</td><td rowspan="3">b1</td><td data-mce-selected="1" data-mce-first-selected="1">c1</td></tr>' +
          '<tr><td data-mce-selected="1">c2</td></tr>' +
          '<tr><td>a3</td><td>b3</td><td data-mce-selected="1" data-mce-last-selected="1">c3</td></tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td colspan="2">a1</td><td rowspan="2">b1</td><td rowspan="2">c1c2c3</td></tr>' +
          '<tr><td>a3</td><td>b3</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should reduce colspans to 2 keep the rowspan',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr><td data-mce-selected="1">a1</td><td data-mce-selected="1">b1</td><td data-mce-selected="1">c1</td></tr>' +
          '<tr><td colspan="3">a2</td></tr>' +
          '<tr><td colspan="2" rowspan="2">a3</td><td>c3</td></tr>' +
          '<tr><td>c4</td></tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr><td colspan="2">a1b1c1</td></tr>' +
          '<tr><td colspan="2">a2</td></tr>' +
          '<tr><td rowspan="2">a3</td><td>c3</td></tr>' +
          '<tr><td>c4</td></tr>' +
          '</tbody>' +
          '</table>'
        )
      },
      */
  /*
      {
        message: 'Should merge b1+c1 and reduce a2',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td data-mce-selected="1" data-mce-first-selected="1">b1</td>' +
          '<td data-mce-selected="1" data-mce-last-selected="1">c1</td>' +
          '</tr>' +
          '<tr>' +
          '<td colspan="3">a2</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td>b1<br>c1</td>' +
          '</tr>' +
          '<tr>' +
          '<td colspan="2">a2</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        )
      },

      {
        message: 'Should merge a2+a3 and reduce b1',
        before: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td rowspan="3">b1</td>' +
          '</tr>' +
          '<tr>' +
          '<td data-mce-selected="1" data-mce-first-selected="1">a2</td>' +
          '</tr>' +
          '<tr>' +
          '<td data-mce-selected="1" data-mce-last-selected="1">a3</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        ),
        after: (
          '<table>' +
          '<tbody>' +
          '<tr>' +
          '<td>a1</td>' +
          '<td rowspan="2">b1</td>' +
          '</tr>' +
          '<tr>' +
          '<td>a2<br>a3</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        )
      }
     */
});
