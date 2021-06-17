import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import { renderLabel } from 'tinymce/themes/silver/ui/dialog/Label';

import TestProviders from '../../../module/TestProviders';

describe('phantom.tinymce.themes.silver.components.label.LabelTest', () => {
  const sharedBackstage = {
    providers: TestProviders,
    interpreter: Fun.identity
  };

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderLabel({
      label: 'Group of Options',
      items: [
        {
          dom: {
            tag: 'label',
            classes: [ 'tox-checkbox' ]
          }
        } as any
      ]
    }, sharedBackstage)
  ));

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('label', {
            children: [
              s.text(str.is('Group of Options'))
            ]
          }),
          s.element('label', {
            classes: [ arr.has('tox-checkbox') ]
          })
        ]
      })),
      hook.component().element
    );
  });
});
