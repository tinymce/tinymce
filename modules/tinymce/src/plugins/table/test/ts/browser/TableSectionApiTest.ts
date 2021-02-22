import { UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks } from '@ephox/mcagar';
import { Selectors, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.TableSectionApiTest', () => {
  const bodyContent = `<table>
<tbody>
<tr id="one">
<td>text</td>
</tr>
<tr id="two">
<td>text</td>
</tr>
</tbody>
</table>`;

  const theadContent = `<table>
<thead>
<tr id="one">
<td scope="col">text</td>
</tr>
</thead>
<tbody>
<tr id="two">
<td>text</td>
</tr>
</tbody>
</table>`;

  const thsContent = `<table>
<tbody>
<tr id="one">
<th scope="col">text</th>
</tr>
<tr id="two">
<td>text</td>
</tr>
</tbody>
</table>`;

  const thsContentReversed = `<table>
<tbody>
<tr id="two">
<td>text</td>
</tr>
<tr id="one">
<th scope="col">text</th>
</tr>
</tbody>
</table>`;

  const theadThsContent = `<table>
<thead>
<tr id="one">
<th scope="col">text</th>
</tr>
</thead>
<tbody>
<tr id="two">
<td>text</td>
</tr>
</tbody>
</table>`;

  const tfootContent = `<table>
<tbody>
<tr id="two">
<td>text</td>
</tr>
</tbody>
<tfoot>
<tr id="one">
<td>text</td>
</tr>
</tfoot>
</table>`;

  const bodyContentReversed = `<table>
<tbody>
<tr id="two">
<td>text</td>
</tr>
<tr id="one">
<td>text</td>
</tr>
</tbody>
</table>`;

  const bodyColumnContent = `<table>
<tbody>
<tr id="one">
<td>text</td>
<td>text</td>
</tr>
<tr id="two">
<td>text</td>
<td>text</td>
</tr>
</tbody>
</table>`;

  const bodyMultipleChangesColumnContent = `<table>
<tbody>
<tr>
<td>text</td>
<td>text</td>
</tr>
<tr>
<td>text</td>
<td>text</td>
</tr>
</tbody>
</table>`;

  const headerColumnContent = `<table>
<tbody>
<tr id="one">
<th scope="row">text</th>
<td>text</td>
</tr>
<tr id="two">
<th scope="row">text</th>
<td>text</td>
</tr>
</tbody>
</table>`;

  const headerMultipleChangesColumnContent = `<table>
<tbody>
<tr>
<th scope="row">text</th>
<th scope="row">text</th>
</tr>
<tr>
<th scope="row">text</th>
<th scope="row">text</th>
</tr>
</tbody>
</table>`;

  const headerCellContent = `<table>
<tbody>
<tr id="one">
<th>text</th>
</tr>
<tr id="two">
<td>text</td>
</tr>
</tbody>
</table>`;

  let events = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push({
      type: event.type,
      structure: event.structure,
      style: event.style,
    });
  };

  const clearEvents = () => events = [];
  const assertEvents = (label: string, expectedEvents: string[]) => {
    assert.deepEqual(Arr.map(events, (event) => event.type), expectedEvents, label);
    if (Arr.contains(expectedEvents, 'tablemodified')) {
      const tableModifiedEvents = Arr.filter(events, (event) => event.type === 'tablemodified');
      assert.lengthOf(tableModifiedEvents, 1, 'TINY-6629: Assert table modified events length');
      assert.isTrue(tableModifiedEvents[0].structure, 'TINY-6643: Should have structure modified');
      assert.isFalse(tableModifiedEvents[0].style, 'TINY-6643: Should not have style modified');
    }
  };

  const selectAllCells = (editor: Editor, type: 'td' | 'th') => {
    const searchingForType = type === 'th' ? 'td' : 'th';
    const cells = Selectors.all(searchingForType, TinyDom.body(editor));
    selectRangeXY(editor, cells[0].dom, cells[cells.length - 1].dom);
  };

  const selectRangeXY = (editor: Editor, startTd: EventTarget, endTd: EventTarget) => {
    editor.fire('mousedown', { target: startTd, button: 0 } as MouseEvent);
    editor.fire('mouseover', { target: endTd, button: 0 } as MouseEvent);
    editor.fire('mouseup', { target: endTd, button: 0 } as MouseEvent);
  };

  const defaultEvents = [ 'tablemodified' ];
  const switchType = (editor: Editor, startContent: string, expectedContent: string, command: string, type: string, expectedEvents: string[] = defaultEvents, selector = 'tr#one td') => {
    editor.setContent(startContent);
    const row = UiFinder.findIn(SugarElement.fromDom(editor.getBody()), selector).getOrDie();
    editor.selection.select(row.dom);
    clearEvents();
    editor.execCommand(command, false, { type });
    assertEvents('TINY-6629: Assert table modified events', expectedEvents);
    TinyAssertions.assertContent(editor, expectedContent);
  };

  const switchMultipleColumnsType = (editor: Editor, startContent: string, expectedContent: string, command: string, type: 'td' | 'th', expectedEvents: string[] = defaultEvents) => {
    editor.setContent(startContent);
    selectAllCells(editor, type);
    clearEvents();
    editor.execCommand(command, false, { type });
    assertEvents('TINY-6692: Assert table modified events', expectedEvents);
    TinyAssertions.assertContent(editor, expectedContent);
  };

  const assertGetType = (editor: Editor, content: string, command: string, expected: string, selector = 'tr#one td') => {
    editor.setContent(content);
    const row = UiFinder.findIn(TinyDom.body(editor), selector).getOrDie();
    editor.selection.select(row.dom);
    const value = editor.queryCommandValue(command);
    assert.equal(value, expected, `Assert query value is ${expected}`);
  };

  const defaultSettings = {
    plugins: 'table',
    base_url: '/project/tinymce/js/tinymce',
    setup: (ed: Editor) => {
      ed.on('tablemodified', logEvent);
      ed.on('newcell', logEvent);
    }
  };

  // Note: cases double up with SwitchTableSectionTest a lot, so not as in depth as that test for rows
  context('table_header_type="section"', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      ...defaultSettings,
      table_header_type: 'section'
    }, [ Plugin, Theme ]);

    it('TINY-6150: Switch from body to header row', () =>
      switchType(hook.editor(), bodyContent, theadContent, 'mceTableRowType', 'header')
    );

    it('TINY-6150: Switch from footer to header row', () =>
      switchType(hook.editor(), tfootContent, theadContent, 'mceTableRowType', 'header')
    );
  });

  context('table_header_type="cells"', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      ...defaultSettings,
      table_header_type: 'cells'
    }, [ Plugin, Theme ]);

    it('TINY-6150: Switch from body to header row', () =>
      switchType(hook.editor(), bodyContent, thsContent, 'mceTableRowType', 'header', [ 'newcell', 'tablemodified' ])
    );

    it('TINY-6150: Switch from footer to header row', () =>
      switchType(hook.editor(), tfootContent, thsContentReversed, 'mceTableRowType', 'header', [ 'newcell', 'tablemodified' ])
    );
  });

  context('table_header_type="sectionCells"', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      ...defaultSettings,
      table_header_type: 'sectionCells'
    }, [ Plugin, Theme ]);

    it('TINY-6150: Switch from body to header row', () =>
      switchType(hook.editor(), bodyContent, theadThsContent, 'mceTableRowType', 'header', [ 'newcell', 'tablemodified' ])
    );

    it('TINY-6150: Switch from footer to header row', () =>
      switchType(hook.editor(), tfootContent, theadThsContent, 'mceTableRowType', 'header', [ 'newcell', 'tablemodified' ])
    );
  });

  context('table_header_type=invalid', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      ...defaultSettings,
      table_header_type: 'foo'
    }, [ Plugin, Theme ]);

    it('TINY-6150: Switch from body to header row', () =>
      switchType(hook.editor(), bodyContent, theadContent, 'mceTableRowType', 'header')
    );
  });

  context('Basic tests', () => {
    const hook = TinyHooks.bddSetupLight<Editor>(defaultSettings, [ Plugin, Theme ]);

    context('Switch row types', () => {
      it('TINY-6150: Switch header row to body row', () =>
        switchType(hook.editor(), theadContent, bodyContent, 'mceTableRowType', 'body')
      );

      it('TINY-6150: Switch footer row to body row', () =>
        switchType(hook.editor(), tfootContent, bodyContentReversed, 'mceTableRowType', 'body')
      );

      it('TINY-6150: Switch body row to footer row', () =>
        switchType(hook.editor(), bodyContent, tfootContent, 'mceTableRowType', 'footer')
      );

      it('TINY-6150: Switch footer row to header row', () =>
        switchType(hook.editor(), tfootContent, theadContent, 'mceTableRowType', 'header')
      );
    });

    context('Switch column types', () => {
      it('TINY-6150: Switch body column to header column', () =>
        switchType(hook.editor(), bodyColumnContent, headerColumnContent, 'mceTableColType', 'th', [ 'newcell', 'newcell', 'tablemodified' ])
      );

      it('TINY-6326: Switch multiple body columns to header columns', () =>
        switchMultipleColumnsType(hook.editor(), bodyMultipleChangesColumnContent, headerMultipleChangesColumnContent, 'mceTableColType', 'th', [ 'newcell', 'newcell', 'newcell', 'newcell', 'tablemodified' ])
      );

      it('TINY-6150: Switch header column to body column', () =>
        switchType(hook.editor(), headerColumnContent, bodyColumnContent, 'mceTableColType', 'td', [ 'newcell', 'newcell', 'tablemodified' ], 'tr#one th')
      );

      it('TINY-6326: Switch multiple header columns to body columns', () =>
        switchMultipleColumnsType(hook.editor(), headerMultipleChangesColumnContent, bodyMultipleChangesColumnContent, 'mceTableColType', 'td', [ 'newcell', 'newcell', 'newcell', 'newcell', 'tablemodified' ])
      );
    });

    context('Switch cell types', () => {
      it('TINY-6150: Switch body cell to header cell', () =>
        switchType(hook.editor(), bodyContent, headerCellContent, 'mceTableCellType', 'th', [ 'newcell', 'tablemodified' ])
      );

      it('TINY-6150: Switch header cell to body cell', () =>
        switchType(hook.editor(), headerCellContent, bodyContent, 'mceTableCellType', 'td', [ 'newcell', 'tablemodified' ], 'tr#one th')
      );
    });

    context('Get row types', () => {
      it('TINY-6150: Get type of body row', () =>
        assertGetType(hook.editor(), bodyContent, 'mceTableRowType', 'body')
      );

      it('TINY-6150: Get type of section header row', () =>
        assertGetType(hook.editor(), theadContent, 'mceTableRowType', 'header')
      );

      it('TINY-6150: Get type of cells header row', () =>
        assertGetType(hook.editor(), thsContent, 'mceTableRowType', 'header', 'tr#one th')
      );

      it('TINY-6150: Get type of sectionCells header row', () =>
        assertGetType(hook.editor(), theadThsContent, 'mceTableRowType', 'header', 'tr#one th')
      );

      it('TINY-6150: Get type of footer row', () =>
        assertGetType(hook.editor(), tfootContent, 'mceTableRowType', 'footer')
      );
    });

    context('Get column types', () => {
      it('TINY-6150: Get type of body column', () =>
        assertGetType(hook.editor(), bodyColumnContent, 'mceTableColType', 'td')
      );

      it('TINY-6150: Get type of header column', () =>
        assertGetType(hook.editor(), headerColumnContent, 'mceTableColType', 'th', 'tr#one th')
      );

      it('TINY-6150: Get type of header cell', () =>
        assertGetType(hook.editor(), headerCellContent, 'mceTableColType', '', 'tr#one th')
      );
    });

    context('Get cell types', () => {
      it('TINY-6150: Get type of body cell', () =>
        assertGetType(hook.editor(), bodyContent, 'mceTableCellType', 'td')
      );

      it('TINY-6150: Get type of header cell', () =>
        assertGetType(hook.editor(), headerCellContent, 'mceTableCellType', 'th', 'tr#one th')
      );
    });
  });
});
