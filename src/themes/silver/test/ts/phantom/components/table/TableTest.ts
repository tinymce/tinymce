import { UnitTest } from '@ephox/bedrock';
import { setupDemo } from 'tinymce/themes/silver/demo/components/DemoHelpers';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { renderTable } from 'tinymce/themes/silver/ui/dialog/Table';
import { Assertions, ApproxStructure } from '@ephox/agar';

UnitTest.asynctest('Table component Test', (success, failure) => {
  const helpers = setupDemo();
  const providers = helpers.extras.backstage.shared.providers;

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderTable({
          type: 'table',
          header: [ 'one', 'two', 'three'],
          cells: [
            [ 'a', 'b', 'c'],
            [ 'd', 'e', 'f']
          ]
        }, providers)
      );
    }, (doc, body, gui, component, store) => {
      return [
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
      ];
    },
    () => {
      helpers.destroy();
      success();
    },
    failure
  );
});