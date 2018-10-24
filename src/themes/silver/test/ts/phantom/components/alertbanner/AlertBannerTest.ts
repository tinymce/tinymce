import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory } from '@ephox/alloy';
import { UnitTest } from '@ephox/bedrock';

import { renderAlertBanner } from '../../../../../main/ts/ui/general/AlertBanner';
import { GuiSetup } from '../../../module/AlloyTestUtils';
import { Arr } from '@ephox/katamari';
import I18n from 'tinymce/core/api/util/I18n';

UnitTest.asynctest('AlertBanner component Test', (success, failure) => {
  const providers = {
    icons: () => <Record<string, string>> {
      'icon-helpA': 'icon-provided-for-help',
      'icon-close': 'icon-provided-for-close'
    },
    translate: I18n.translate
  };

  GuiSetup.setup(
    (store, doc, body) => {
      return GuiFactory.build(
        renderAlertBanner({
          level: 'warn',
          text: 'I am a banner',
          icon: 'helpA',
          actionLabel: 'Go'
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
                  html: str.is('icon-provided-for-help')
                }),

                s.element('div', {
                  classes: [ arr.has('tox-notification__body') ],
                  html: str.is('I am a banner')
                }),

                s.element('button', {
                  classes: Arr.map(
                    [ 'tox-notification__dismiss', 'tox-button', 'tox-button--naked', 'tox-button--icon' ],
                    arr.has
                  ),
                  html: str.is('icon-provided-for-close')
                })
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