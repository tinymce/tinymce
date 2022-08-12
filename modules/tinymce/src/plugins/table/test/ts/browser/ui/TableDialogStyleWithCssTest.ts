import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj, Type } from '@ephox/katamari';
import { Attribute, Css, Html, SelectorFilter, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

interface TableSpec {
  readonly cellPaddingAttr?: string;
  readonly cellPaddingStyle?: string;

  readonly cellSpacingAttr?: string;
  readonly cellSpacingStyle?: string;
}

describe('browser.tinymce.plugins.table.ui.TableCellDialogStyleWithCssTest', () => {
  const generalSelectors = {
    cellspacing: 'label.tox-label:contains(Cell spacing) + input.tox-textfield',
    cellpadding: 'label.tox-label:contains(Cell padding) + input.tox-textfield'
  };

  const setDialogValues = (data: Record<string, string>) => TableTestUtils.setDialogValues(data, false, generalSelectors);
  const assertDialogValues = (data: Record<string, string>) => TableTestUtils.assertDialogValues(data, false, generalSelectors);

  const initializeTable = (editor: Editor, table: TableSpec) => {
    const { cellPaddingAttr, cellPaddingStyle, cellSpacingAttr, cellSpacingStyle } = table;
    const defaultTable = SugarElement.fromHtml<HTMLTableElement>(
      '<table>' +
      '<tbody>' +
      '<tr>' +
      '<td><p>Hello</p></td>' +
      '<td><p>Next cell</p></td>' +
      '</tr>' +
      '<tr>' +
      '<td><p>Cell 3</p></td>' +
      '<td><p>Last one</p></td>' +
      '</tr>' +
      '</tbody>' +
      '</table>'
    );

    if (Type.isNonNullable(cellPaddingAttr)) {
      Attribute.set(defaultTable, 'cellpadding', cellPaddingAttr);
    }
    if (Type.isNonNullable(cellSpacingAttr)) {
      Attribute.set(defaultTable, 'cellspacing', cellSpacingAttr);
    }
    if (Type.isNonNullable(cellSpacingStyle)) {
      Css.set(defaultTable, 'border-spacing', cellSpacingStyle);
    }
    if (Type.isNonNullable(cellPaddingStyle)) {
      Arr.each(SelectorFilter.descendants(defaultTable, 'td,th'), (cell) => Css.set(cell, 'padding', cellPaddingStyle));
    }

    editor.setContent(Html.getOuter(defaultTable));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
  };

  const assertTable = (editor: Editor, spec: TableSpec) => {
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, _arr) => {
      const transformMap = (record: Record<string, undefined | string>) => {
        const definedOnly = Obj.filter(record, Type.isNonNullable) as Record<string, string>;
        return Obj.map(definedOnly, (val) => val !== '' ? str.is(val) : str.none());
      };
      const cell = s.element('td', { styles: transformMap({ padding: spec.cellPaddingStyle }) });

      const row = s.element('tr', { children: [ cell, cell ] });
      const tbody = s.element('tbody', { children: [ row, row ] });

      const tableAttributes = {
        cellspacing: spec.cellSpacingAttr,
        cellpadding: spec.cellPaddingAttr
      };

      const tableStyles = { 'border-spacing': spec.cellSpacingStyle };

      const table = s.element('table', {
        children: [ tbody ],
        attrs: transformMap(tableAttributes),
        styles: transformMap(tableStyles)
      });

      return s.element('body', { children: [ table, s.theRest() ] });
    }));
  };

  Arr.each([
    { title: 'attributes', style_by_css: false },
    { title: 'styles', style_by_css: true }
  ], (spec) => {
    context(`Table layout using ${spec.title}`, () => {
      const hook = TinyHooks.bddSetup<Editor>({
        plugins: 'table',
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'tableprops',
        table_style_by_css: spec.style_by_css
      }, [ Plugin ]);

      it('TINY-4926: falls back to cellpadding attribute if no CSS is defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellPaddingAttr: '20' });

        await TableTestUtils.pOpenTableDialog(editor);

        assertDialogValues({
          cellspacing: '',
          cellpadding: '20'
        });

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('TINY-4926: falls back to td padding styles if no cellpadding attribute is defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellPaddingStyle: '20px' });

        await TableTestUtils.pOpenTableDialog(editor);

        assertDialogValues({
          cellspacing: '',
          cellpadding: '20px'
        });

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('TINY-4926: uses the integrators preference when both td "padding" style and cellpadding attribute are defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellPaddingAttr: '20', cellPaddingStyle: '30px' });

        await TableTestUtils.pOpenTableDialog(editor);

        assertDialogValues({
          cellspacing: '',
          cellpadding: spec.style_by_css ? '30px' : '20'
        });

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('sets either td "padding" style or cellpadding attribute, based on integrator preference', async () => {
        const editor = hook.editor();
        initializeTable(editor, {});

        await TableTestUtils.pOpenTableDialog(editor);

        setDialogValues({
          cellspacing: '',
          cellpadding: '30'
        });

        await TableTestUtils.pClickDialogButton(editor, true);

        if (spec.style_by_css) {
          assertTable(editor, { cellPaddingAttr: '', cellPaddingStyle: '30px' });
        } else {
          assertTable(editor, { cellPaddingAttr: '30', cellPaddingStyle: '' });
        }
      });

      it('TINY-4926: falls back to cellspacing attribute if no CSS is defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellSpacingAttr: '5' });

        await TableTestUtils.pOpenTableDialog(editor);

        assertDialogValues({
          cellspacing: '5',
          cellpadding: ''
        });

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('TINY-4926: falls back to table border-spacing style if no cellspacing attribute is defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellSpacingStyle: '5px' });

        await TableTestUtils.pOpenTableDialog(editor);

        assertDialogValues({
          cellspacing: '5px',
          cellpadding: ''
        });

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('TINY-4926: uses the integrators preference when both table "border-spacing" style and cellspacing attribute are defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellSpacingAttr: '5', cellSpacingStyle: '10px' });

        await TableTestUtils.pOpenTableDialog(editor);

        assertDialogValues({
          cellspacing: spec.style_by_css ? '10px' : '5',
          cellpadding: ''
        });

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('sets either table "border-spacing" style or cellspacing attribute, based on integrator preference', async () => {
        const editor = hook.editor();
        initializeTable(editor, {});

        await TableTestUtils.pOpenTableDialog(editor);

        setDialogValues({
          cellspacing: '5',
          cellpadding: ''
        });

        await TableTestUtils.pClickDialogButton(editor, true);

        if (spec.style_by_css) {
          assertTable(editor, { cellSpacingAttr: '', cellSpacingStyle: '5px' });
        } else {
          assertTable(editor, { cellSpacingAttr: '5', cellSpacingStyle: '' });
        }
      });
    });
  });
});
