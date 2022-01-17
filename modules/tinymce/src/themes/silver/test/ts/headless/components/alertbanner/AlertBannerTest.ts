import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';

import { renderAlertBanner } from 'tinymce/themes/silver/ui/general/AlertBanner';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.alertbanner.AlertBannerTest', () => {
  const providers = {
    ...TestProviders,
    icons: (): Record<string, string> => ({
      helpa: 'provided-for-help',
      close: 'provided-for-close'
    })
  };

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderAlertBanner({
      level: 'warn',
      text: 'I am a banner',
      icon: 'helpA',
      iconTooltip: 'Go',
      url: ''
    }, providers)
  ));

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
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
          })
        ]
      })),
      hook.component().element
    );
  });
});
