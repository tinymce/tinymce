import { ApproxStructure, Assertions } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderFooterButton } from 'tinymce/themes/silver/ui/general/Button';

import TestBackstage from '../../../module/TestBackstage';

describe('headless.tinymce.themes.silver.components.dialogbutton.DialogFooterButtonTest', () => {
  const backstage = TestBackstage();
  describe('primary style', () => {
    const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderFooterButton({
        text: 'Submit>Text',
        name: 'Submit',
        enabled: true,
        primary: false,
        align: 'end',
        icon: Optional.none(),
        tooltip: Optional.some('Submit'),
        buttonType: Optional.some('primary'),
      }, 'submit', backstage)
    ));

    it('TINY-8582: buttonType property should take precendence over primary property', () => {
      Assertions.assertStructure(
        'Checking CSS of button',
        ApproxStructure.build((s, str, arr) => s.element('button', {
          classes: [ arr.has('tox-button'), arr.not('tox-button--secondary'), arr.not('tox-tbtn') ],
        })),
        hook.component().element
      );
    });
  });

  describe('secondary style', () => {
    const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderFooterButton({
        name: 'test-button',
        text: 'Cancel Button',
        enabled: true,
        primary: true,
        tooltip: Optional.some('Secondary button'),
        buttonType: Optional.some('secondary'),
        icon: Optional.none(),
        align: 'end',
      }, 'cancel', backstage)
    ));

    it('TINY-8582: buttonType property should take precendence over primary property', () => {
      Assertions.assertStructure(
        'Checking CSS of button',
        ApproxStructure.build((s, str, arr) => s.element('button', {
          classes: [ arr.has('tox-button'), arr.has('tox-button--secondary'), arr.not('tox-tbtn') ],
        })),
        hook.component().element
      );
    });
  });
});
