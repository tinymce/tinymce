import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderTextarea } from 'tinymce/themes/silver/ui/dialog/TextField';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.textarea.TextareaCustomIDTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderTextarea({
      name: 'textarea',
      // Note: in order for out custom id to not be overritten the label must not be set
      label: Optional.none(),
      placeholder: Optional.none(),
      maximized: false,
      enabled: true,
      id: Optional.some('textarea-custom-id')
    }, TestProviders, Optional.none())
  ));

  it('TINY-10971: Check if custom id is rendered', () => {
    Assertions.assertStructure(
      'Textarea should have custom id attribute',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__group') ],
        children: [
          s.element('div', {
            classes: [ arr.has('tox-textarea-wrap') ],
            children: [
              s.element('textarea', {
                classes: [ arr.has('tox-textarea') ],
                attrs: {
                  'data-alloy-tabstop': str.is('true'),
                  'id': str.is('textarea-custom-id')
                }
              })
            ]
          })
        ]
      })),
      hook.component().element
    );
  });
});
