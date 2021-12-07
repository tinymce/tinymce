import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';

import { renderSpacer } from 'tinymce/themes/silver/ui/dialog/Spacer';

describe('headless.tinymce.themes.silver.components.spacer.SpacerTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(renderSpacer()));

  it('TINY-8304: Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-spacer') ],
        children: []
      })),
      hook.component().element
    );
  });
});
