import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, Memento, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';

import { UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';
import { renderLabel } from 'tinymce/themes/silver/ui/dialog/Label';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.label.LabelForTest', () => {
  const sharedBackstage = {
    providers: TestProviders,
    interpreter: Fun.identity as any
  } as UiFactoryBackstageShared;

  const items = [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-checkbox' ]
      }
    } as any
  ];

  const labelFor = Memento.record(renderLabel({
    label: 'This label has a for attribute',
    items,
    align: 'end',
    for: Optional.some('IDofSomeElement')
  }, sharedBackstage));

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build({
    dom: { tag: 'div' },
    components: [ labelFor.asSpec() ]
  }));

  it('TINY-10971: label should be rendered with for attribute', () => {
    const labelForComponent = labelFor.get(hook.component());
    Assertions.assertStructure(
      'Label should have for attribute',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('label', {
            classes: [ arr.has('tox-label') ],
            attrs: {
              for: str.is('IDofSomeElement')
            },
            children: [
              s.text(str.is('This label has a for attribute'))
            ]
          }),
          s.element('div', {
            classes: [ arr.has('tox-checkbox') ]
          })
        ]
      })),
      labelForComponent.element
    );
  });

});
