import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';

import { renderHtmlPanel } from 'tinymce/themes/silver/ui/general/HtmlPanel';

UnitTest.asynctest('HtmlPanel component Test', (success, failure) => {
  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderHtmlPanel({
          html: '<br /><br /><hr />',
          presets: 'presentation'
        })
      );
    },
    (doc, body, gui, component, store) => {

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              attrs: {
                role: str.is('presentation')
              },
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

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderHtmlPanel({
          html: '<br /><hr />',
          presets: 'document'
        })
      );
    },
    (doc, body, gui, component, store) => {

      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              attrs: {
                role: str.is('document')
              },
              children: [
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
