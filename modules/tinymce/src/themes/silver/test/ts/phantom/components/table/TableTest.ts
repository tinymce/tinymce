import { UnitTest } from '@ephox/bedrock-client';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { renderTable } from 'tinymce/themes/silver/ui/dialog/Table';
import { Assertions, ApproxStructure } from '@ephox/agar';
import TestProviders from '../../../module/TestProviders';

UnitTest.asynctest('Table component Test', (success, failure) => {

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => GuiFactory.build(
      renderTable({
        header: [ 'one', 'two', 'three' ],
        cells: [
          [ 'a', 'b', 'c' ],
          [ 'd', 'e', 'f' ]
        ]
      }, TestProviders)
    ), (doc, body, gui, component, store) => [
      Assertions.sAssertStructure(
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
        component.element()
      )
    ],
    success,
    failure
  );
});
