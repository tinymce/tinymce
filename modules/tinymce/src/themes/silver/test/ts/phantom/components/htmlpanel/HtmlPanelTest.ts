import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';

import { renderHtmlPanel } from 'tinymce/themes/silver/ui/general/HtmlPanel';

UnitTest.asynctest('HtmlPanel component Test', (success, failure) => {
  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build(
      renderHtmlPanel({
        html: '<br /><br /><hr />',
        presets: 'presentation'
      })
    ),
    (_doc, _body, _gui, component, _store) => [
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, _arr) => s.element('div', {
          attrs: {
            role: str.is('presentation')
          },
          children: [
            s.element('br', { }),
            s.element('br', { }),
            s.element('hr', { })
          ]
        })),
        component.element()
      )
    ],
    success,
    failure
  );

  TestHelpers.GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build(
      renderHtmlPanel({
        html: '<br /><hr />',
        presets: 'document'
      })
    ),
    (_doc, _body, _gui, component, _store) => [
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, _arr) => s.element('div', {
          attrs: {
            role: str.is('document')
          },
          children: [
            s.element('br', { }),
            s.element('hr', { })
          ]
        })),
        component.element()
      )
    ],
    success,
    failure
  );
});
