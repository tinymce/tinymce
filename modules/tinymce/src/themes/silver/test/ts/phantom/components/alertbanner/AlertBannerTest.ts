import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock-client';

import { renderAlertBanner } from 'tinymce/themes/silver/ui/general/AlertBanner';
import I18n from 'tinymce/core/api/util/I18n';

UnitTest.asynctest('AlertBanner component Test', (success, failure) => {
  const providers = {
    icons: () => <Record<string, string>> {
      helpA: 'provided-for-help',
      close: 'provided-for-close'
    },
    menuItems: () => <Record<string, any>> {},
    translate: I18n.translate
  };

  TestHelpers.GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderAlertBanner({
          level: 'warn',
          text: 'I am a banner',
          icon: 'helpA',
          iconTooltip: 'Go',
          url: ''
        }, providers)
      );
    },
    (doc, body, gui, component, store) => {
      return [
        Assertions.sAssertStructure(
          'Checking initial structure',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              attrs: {
                role: str.is('alert')
              },
              classes: [
                arr.has('tox-notification'),
                arr.has('tox-notification--in'),
                arr.has('tox-notification--warn')
              ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-notification__icon') ],
                  children: [
                    s.element('button', {
                      html: str.is('provided-for-help')
                    })
                  ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-notification__body') ],
                  html: str.is('I am a banner')
                }),
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
