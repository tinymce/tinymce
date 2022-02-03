import { ApproxStructure, Assertions, Mouse } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { renderButton } from 'tinymce/themes/silver/ui/general/Button';

import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.dialogbutton.DialogButtonTest', () => {
  describe('primary style', () => {
    const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build(
      renderButton({
        name: 'test-button',
        text: 'Button<Text',
        enabled: true,
        primary: true,
        buttonType: Optional.some('primary'),
        icon: Optional.none(),
        borderless: false
      }, store.adder('button.action'), TestProviders)
    ));

    it('Check basic structure', () => {
      Assertions.assertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => s.element('button', {
          classes: [ arr.has('tox-button'), arr.not('tox-button--secondary'), arr.not('tox-tbtn') ],
          children: [
            s.text(str.is('Button<Text'))
          ]
        })),
        hook.component().element
      );
    });

    it('Check button events', () => {
      const store = hook.store();
      const gui = hook.gui();
      store.assertEq('No button action should have fired yet', []);
      Mouse.clickOn(gui.element, '.tox-button');
      store.assertEq('Button action should have fired', [ 'button.action' ]);
    });
  });

  describe('secondary style', () => {
    const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build(
      renderButton({
        name: 'test-button',
        text: 'ButtonText',
        enabled: true,
        primary: false,
        buttonType: Optional.some('secondary'),
        icon: Optional.none(),
        borderless: false
      }, store.adder('button.action'), TestProviders)
    ));

    it('Check basic structure', () => {
      Assertions.assertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => s.element('button', {
          classes: [ arr.has('tox-button'), arr.has('tox-button--secondary'), arr.not('tox-tbtn') ],
          children: [
            s.text(str.is('ButtonText'))
          ]
        })),
        hook.component().element
      );
    });
  });

  describe('toolbar style', () => {
    const hook = TestHelpers.GuiSetup.bddSetup((store, _doc, _body) => GuiFactory.build(
      renderButton({
        name: 'test-button',
        text: 'ButtonText',
        enabled: true,
        primary: false,
        buttonType: Optional.some('toolbar'),
        icon: Optional.none(),
        borderless: false
      }, store.adder('button.action'), TestProviders)
    ));

    it('TINY-8304: Check basic structure', () => {
      Assertions.assertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => s.element('button', {
          classes: [ arr.not('tox-button'), arr.not('tox-button--secondary'), arr.has('tox-tbtn') ],
          children: [
            s.text(str.is('ButtonText'))
          ]
        })),
        hook.component().element
      );
    });
  });
});
