import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';

import { renderTable } from 'tinymce/themes/silver/ui/dialog/Table';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.table.TableTest', () => {
  context('Table structure without classes', () => {
    const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderTable({
        classes: [],
        header: [ 'one', 'two', 'three' ],
        cells: [
          [ 'a', 'b', 'c' ],
          [ 'd', 'e', 'f' ]
        ]
      }, TestProviders)
    ));

    it('Check basic structure', () => {
      Assertions.assertStructure(
        'Assert table structure',
        ApproxStructure.fromHtml((
          '<table class="tox-dialog__table">' +
          '<thead>' +
          '<tr>' +
          '<th>one</th>' +
          '<th>two</th>' +
          '<th>three</th>' +
          '</tr>' +
          '</thead>' +
          '<tbody>' +
          '<tr>' +
          '<td>a</td>' +
          '<td>b</td>' +
          '<td>c</td>' +
          '</tr>' +
          '<tr>' +
          '<td>d</td>' +
          '<td>e</td>' +
          '<td>f</td>' +
          '</tr>' +
          '</tbody>' +
          '</table>'
        )),
        hook.component().element
      );
    });
  });

  context('Table structure with classes', () => {
    const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderTable({
        classes: [ 'test-table' ],
        header: [ 'one', 'two', 'three' ],
        cells: [
          [ 'a', 'b', 'c' ],
          [ 'd', 'e', 'f' ]
        ]
      }, TestProviders)
    ));

    it('TINY-9180: Check table structure with classes', () => {
      Assertions.assertStructure(
        'Assert table structure',
        ApproxStructure.build((s, str, __) =>
          s.element('table', {
            exactClasses: [ 'tox-dialog__table', 'test-table' ],
            children: [
              s.element('thead', {
                children: [
                  s.element('tr', {
                    children: [
                      s.element('th', {
                        children: [
                          s.text(str.is('one'))
                        ]
                      }),
                      s.element('th', {
                        children: [
                          s.text(str.is('two'))
                        ]
                      }),
                      s.element('th', {
                        children: [
                          s.text(str.is('three'))
                        ]
                      }),
                    ]
                  })
                ]
              }),
              s.element('tbody', {
                children: [
                  s.element('tr', {
                    children: [
                      s.element('td', {
                        children: [
                          s.text(str.is('a'))
                        ]
                      }),
                      s.element('td', {
                        children: [
                          s.text(str.is('b'))
                        ]
                      }),
                      s.element('td', {
                        children: [
                          s.text(str.is('c'))
                        ]
                      }),
                    ]
                  }),
                  s.element('tr', {
                    children: [
                      s.element('td', {
                        children: [
                          s.text(str.is('d'))
                        ]
                      }),
                      s.element('td', {
                        children: [
                          s.text(str.is('e'))
                        ]
                      }),
                      s.element('td', {
                        children: [
                          s.text(str.is('f'))
                        ]
                      }),
                    ]
                  })
                ]
              })
            ]
          })),
        hook.component().element
      );
    });
  });
});
