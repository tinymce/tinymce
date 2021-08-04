import { ApproxStructure } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { Attribute, Css, Html, SelectorFilter, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.tinymce.plugins.table.ui.TableCellDialogTest', () => {
  const generalSelectors = {
    cellspacing: 'label.tox-label:contains(Cell spacing) + input.tox-textfield',
    cellpadding: 'label.tox-label:contains(Cell padding) + input.tox-textfield'
  };

  const initializeTable = (editor: Editor, tableAttributes: Record<string, string>, tableStyles: Record<string, string>, cellStyles: Record<string, string>) => {
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

    Attribute.setAll(defaultTable, tableAttributes);
    Css.setAll(defaultTable, tableStyles);

    Arr.each(SelectorFilter.descendants(defaultTable, 'td,th'), (elem) => Css.setAll(elem, cellStyles));

    editor.setContent(Html.getOuter(defaultTable));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 0);
  };

  const assertTable = (editor: Editor, tableAttributes: Record<string, string>, tableStyles: Record<string, string>, cellStyles: Record<string, string>) => {
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, _arr) => {
      const cell = s.element('td', {
        styles: Obj.map(cellStyles, (val) => val === '' ? str.none() : str.is(val))
      });

      const row = s.element('tr', { children: [ cell, cell ] });
      const tbody = s.element('tbody', { children: [ row, row ] });

      const table = s.element('table', {
        children: [ tbody ],
        attrs: Obj.map(tableAttributes, (val) => val === '' ? str.none() : str.is(val)),
        styles: Obj.map(tableStyles, (val) => val === '' ? str.none() : str.is(val))
      });

      return s.element('body', { children: [ table ] });
    }));
  };

  Arr.each([
    { title: 'using attributes', style_by_css: false },
    { title: 'using styles', style_by_css: true }
  ], (spec) => {
    context(`Control table layout ${spec.title}`, () => {
      const hook = TinyHooks.bddSetup<Editor>({
        plugins: 'table',
        base_url: '/project/tinymce/js/tinymce',
        toolbar: 'tableprops',
        table_style_by_css: spec.style_by_css
      }, [ Plugin, Theme ]);

      it('falls back to cellpadding attribute if no CSS is defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellpadding: '20px' }, {}, {});

        await TableTestUtils.pOpenTableDialog(editor);

        TableTestUtils.assertDialogValues({
          cellspacing: 0,
          cellpadding: '20px'
        }, false, generalSelectors);

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('falls back to td padding styles if no cellpadding attribute is defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, {}, {}, { padding: '20px' });

        await TableTestUtils.pOpenTableDialog(editor);

        TableTestUtils.assertDialogValues({
          cellspacing: 0,
          cellpadding: '20px'
        }, false, generalSelectors);

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('uses the integrators preference when both td "padding" style and cellpadding attribute are defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellpadding: '20px' }, {}, { padding: '30px' });

        await TableTestUtils.pOpenTableDialog(editor);

        TableTestUtils.assertDialogValues({
          cellspacing: 0,
          cellpadding: spec.style_by_css ? '30px' : '20px'
        }, false, generalSelectors);

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('sets either td "padding" style or cellpadding attribute, based on integrator preference', async () => {
        const editor = hook.editor();
        initializeTable(editor, {}, {}, {});

        await TableTestUtils.pOpenTableDialog(editor);

        TableTestUtils.setDialogValues({
          cellspacing: 0,
          cellpadding: '30px'
        }, false, generalSelectors);

        await TableTestUtils.pClickDialogButton(editor, true);

        if (spec.style_by_css) {
          assertTable(editor, { cellpadding: '' }, {}, { padding: '30px' });
        } else {
          assertTable(editor, { cellpadding: '30px' }, {}, { padding: '' });
        }
      });

      it('falls back to cellspacing attribute if no CSS is defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellspacing: '5px' }, {}, {});

        await TableTestUtils.pOpenTableDialog(editor);

        TableTestUtils.assertDialogValues({
          cellspacing: '5px',
          cellpadding: 0
        }, false, generalSelectors);

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('falls back to table border-spacing style if no cellspacing attribute is defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, {}, { 'border-spacing': '5px' }, {});

        await TableTestUtils.pOpenTableDialog(editor);

        TableTestUtils.assertDialogValues({
          cellspacing: '5px',
          cellpadding: 0
        }, false, generalSelectors);

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('uses the integrators preference when both table "border-spacing" style and cellspacing attribute are defined', async () => {
        const editor = hook.editor();
        initializeTable(editor, { cellspacing: '5px' }, { 'border-spacing': '10px' }, {});

        await TableTestUtils.pOpenTableDialog(editor);

        TableTestUtils.assertDialogValues({
          cellspacing: spec.style_by_css ? '10px' : '5px',
          cellpadding: 0
        }, false, generalSelectors);

        await TableTestUtils.pClickDialogButton(editor, false);
      });

      it('sets either table "border-spacing" style or cellspacing attribute, based on integrator preference', async () => {
        const editor = hook.editor();
        initializeTable(editor, {}, {}, {});

        await TableTestUtils.pOpenTableDialog(editor);

        TableTestUtils.setDialogValues({
          cellspacing: '5px',
          cellpadding: 0
        }, false, generalSelectors);

        await TableTestUtils.pClickDialogButton(editor, true);

        if (spec.style_by_css) {
          assertTable(editor, { cellspacing: '' }, { 'border-spacing': '5px' }, {});
        } else {
          assertTable(editor, { cellspacing: '5px' }, { 'border-spacing': '' }, {});
        }
      });
    });
  });
});
