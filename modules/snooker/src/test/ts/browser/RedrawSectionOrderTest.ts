import { ApproxStructure, Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Unicode } from '@ephox/katamari';
import { Compare, Element, Traverse } from '@ephox/sugar';
import * as Structs from 'ephox/snooker/api/Structs';
import * as Transitions from 'ephox/snooker/model/Transitions';
import { Warehouse } from 'ephox/snooker/model/Warehouse';
import * as Redraw from 'ephox/snooker/operate/Redraw';
import * as Bridge from 'ephox/snooker/test/Bridge';

UnitTest.asynctest('Redraw Section Order Test', (success, failure) => {

  const getRowData = (table: Element) => {
    const findRow = (details: Structs.DetailNew[]) => {
      const rowOfCells = Arr.findMap(details, (detail) =>
        Traverse.parent(detail.element()).map((row) =>
          Structs.elementnew(row, false)));
      return rowOfCells.getOrThunk(() => Structs.elementnew(Bridge.generators.row(), true));
    };

    const warehouse = Warehouse.fromTable(table);
    const model = Transitions.toGrid(warehouse, Bridge.generators, false);
    const rendered = Transitions.toDetails(model, Compare.eq);

    return Arr.map(rendered, (details) => {
      const row = findRow(details.details());
      return Structs.rowdatanew(row.element(), details.details(), details.section(), row.isNew());
    });
  };

  const changeTableSections = (table: Element<any>, rowIndex: number, newSection: Structs.Section) => {
    const updatedModelData = Arr.map(getRowData(table), (row, i) =>
      i === rowIndex ? Structs.rowdatanew(row.element(), row.cells(), newSection, row.isNew()) : row);
    Redraw.render(table, updatedModelData);
  };

  const basicRowStructure = (s: any, str: any, text: string) => s.element('tr', {
    children: [
      s.element('td', {
        children: [ s.text(str.is(text)) ]
      }),
      s.element('td', {
        children: [ s.text(str.is(Unicode.nbsp)) ]
      }),
      s.element('td', {
        children: [ s.text(str.is(Unicode.nbsp)) ]
      })
    ]
  });

  Pipeline.async({}, [
    Logger.t('Assert that changing section types maintains correct section order', Step.sync(() => {
      const table = Element.fromHtml(`<table><tbody><tr><td>one</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>two</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>three</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>`);

      Assertions.assertStructure('Should be a basic table', ApproxStructure.build((s, str, _arr) => s.element('table', {
        children: [
          s.element('tbody', {
            children: [
              basicRowStructure(s, str, 'one'),
              basicRowStructure(s, str, 'two'),
              basicRowStructure(s, str, 'three')
            ]
          })
        ]
      })), table);

      changeTableSections(table, 1, 'thead');

      Assertions.assertStructure('Should be a table with a thead', ApproxStructure.build((s, str, _arr) => s.element('table', {
        children: [
          s.element('thead', {
            children: [
              basicRowStructure(s, str, 'two')
            ]
          }),
          s.element('tbody', {
            children: [
              basicRowStructure(s, str, 'one'),
              basicRowStructure(s, str, 'three')
            ]
          })
        ]
      })), table);

      changeTableSections(table, 1, 'tfoot');

      Assertions.assertStructure('Should be a table with a thead and a tfoot', ApproxStructure.build((s, str, _arr) => s.element('table', {
        children: [
          s.element('thead', {
            children: [
              basicRowStructure(s, str, 'two')
            ]
          }),
          s.element('tbody', {
            children: [
              basicRowStructure(s, str, 'three')
            ]
          }),
          s.element('tfoot', {
            children: [
              basicRowStructure(s, str, 'one')
            ]
          })
        ]
      })), table);

      changeTableSections(table, 0, 'tbody');

      Assertions.assertStructure('Thead should have become top row of tbody', ApproxStructure.build((s, str, _arr) => s.element('table', {
        children: [
          s.element('tbody', {
            children: [
              basicRowStructure(s, str, 'two'),
              basicRowStructure(s, str, 'three')
            ]
          }),
          s.element('tfoot', {
            children: [
              basicRowStructure(s, str, 'one')
            ]
          })
        ]
      })), table);
    })),
    Logger.t('Assert that theads go after colgroup elements', Step.sync(() => {
      const table = Element.fromHtml(`<table><colgroup><col style="width: 50%"><col style="width: 50%"></colgroup><tbody><tr><td>one</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>`);

      Assertions.assertStructure('Should be a basic table with a colgroup', ApproxStructure.build((s, str, _arr) => s.element('table', {
        children: [
          s.element('colgroup', {
            children: [
              s.element('col', { styles: { width: str.is('50%') }}),
              s.element('col', { styles: { width: str.is('50%') }})
            ]
          }),
          s.element('tbody', {
            children: [
              basicRowStructure(s, str, 'one')
            ]
          })
        ]
      })), table);

      changeTableSections(table, 0, 'thead');

      Assertions.assertStructure('Should be a table with a colgroup and a thead', ApproxStructure.build((s, str, _arr) => s.element('table', {
        children: [
          s.element('colgroup', {
            children: [
              s.element('col', { styles: { width: str.is('50%') }}),
              s.element('col', { styles: { width: str.is('50%') }})
            ]
          }),
          s.element('thead', {
            children: [
              basicRowStructure(s, str, 'one')
            ]
          })
        ]
      })), table);
    })),
    Logger.t('Assert that theads go after caption elements', Step.sync(() => {
      const table = Element.fromHtml(`<table><caption>some caption</caption<tbody><tr><td>one</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>`);

      Assertions.assertStructure('Should be a basic table with a caption', ApproxStructure.build((s, str, _arr) => s.element('table', {
        children: [
          s.element('caption', {
            children: [
              s.text(str.is('some caption'))
            ]
          }),
          s.element('tbody', {
            children: [
              basicRowStructure(s, str, 'one')
            ]
          })
        ]
      })), table);

      changeTableSections(table, 0, 'thead');

      Assertions.assertStructure('Should be a table with a caption and a thead', ApproxStructure.build((s, str, _arr) => s.element('table', {
        children: [
          s.element('caption', {
            children: [
              s.text(str.is('some caption'))
            ]
          }),
          s.element('thead', {
            children: [
              basicRowStructure(s, str, 'one')
            ]
          })
        ]
      })), table);
    }))
  ], success, failure);
});
