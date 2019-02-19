import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';

import { renderHtmlPanel } from 'tinymce/themes/silver/ui/general/HtmlPanel';

UnitTest.asynctest('HtmlPanel component Test', (success, failure) => {
  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderHtmlPanel({
          type: 'htmlpanel',
          html: '<br /><br /><hr />'
        })
      );
    },
    (doc, body, gui, component, store) => {

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              children: [
                s.element('br', { }),
                s.element('br', { }),
                s.element('hr', { }),
              ]
            });
          }),
          component.element()
        )
      ];
    },
    success,
    failure
  );
});