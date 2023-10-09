import { HsvColour, Transformations } from '@ephox/acid';
import { UiControls, UiFinder, Waiter } from '@ephox/agar';
import { AlloyComponent, GuiFactory, TestHelpers } from '@ephox/alloy';
import { describe, it, context } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert, expect } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { renderColorPicker } from 'tinymce/themes/silver/ui/dialog/ColorPicker';

import * as RepresentingUtils from '../../../module/RepresentingUtils';
import TestProviders from '../../../module/TestProviders';

describe('headless.tinymce.themes.silver.components.colorpicker.ColorPickerTest', () => {
  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderColorPicker({
      label: Optional.some('ColorPicker label'),
      name: 'col1'
    }, TestProviders, Optional.none())
  ));

  const fireEvent = (elem: SugarElement<Node>, event: string) => {
    const evt = new Event(event, {
      bubbles: true,
      cancelable: true
    });
    elem.dom.dispatchEvent(evt);
  };

  const pAssertColour = (component: AlloyComponent, expected: string, labelText: string) =>
    Waiter.pTryUntil(
      'Waiting until hex updates the other fields',
      () => {
        const input = UiFinder.findIn<HTMLInputElement>(component.element, `label:contains("${labelText}") + input`).getOrDie();
        const value = UiControls.getValue(input);
        assert.equal(value, expected, 'Checking value in input');
      }
    );

  const setRgbValue = (component: AlloyComponent, value: string, colour: 'R' | 'G' | 'B') => {
    const input = UiFinder.findIn<HTMLInputElement>(component.element, `label:contains("${colour}") + input`).getOrDie();
    UiControls.setValue(input, value);
    fireEvent(input, 'input');
  };

  const setHexValue = (component: AlloyComponent, value: string) => {
    const input = UiFinder.findIn<HTMLInputElement>(component.element, `label:contains("#") + input`).getOrDie();
    UiControls.setValue(input, value);
    fireEvent(input, 'input');
  };

  const pAssertPaletteHue = (component: AlloyComponent, expected: number) => {
    return Waiter.pTryUntil('Assert hue of palette matches expected', () => {
      const canvas = UiFinder.findIn<HTMLCanvasElement>(component.element, 'canvas').getOrDie();
      // get 1px square from top right of palette canvas
      const canvasContext = canvas.dom.getContext('2d') as CanvasRenderingContext2D;
      const imageData = canvasContext.getImageData(100, 0, 1, 1).data;
      const rgb = { red: imageData[0], green: imageData[1], blue: imageData[2], alpha: (imageData[3] / 255) * 100 };
      const hsv = HsvColour.fromRgb(rgb);
      assert.equal(hsv.hue, expected);
    });
  };

  const pAssertPreviewBgColor = (component: AlloyComponent, expected: string) => {
    return Waiter.pTryUntil('Assert preview background color matches expected', () => {
      const preview = UiFinder.findIn<HTMLCanvasElement>(component.element, '.tox-rgba-preview').getOrDie();
      assert.equal(preview.dom.style.backgroundColor, expected);
    });
  };

  it('Representing state', async () => {
    const component = hook.component();
    RepresentingUtils.setComposedValue(
      component,
      '#ccaa33'
    );

    await pAssertColour(component, '204', 'R');
    await pAssertColour(component, '170', 'G');
    await pAssertColour(component, '51', 'B');
    await pAssertPaletteHue(component, 47);

    RepresentingUtils.assertComposedValue(
      component,
      '#ccaa33'
    );
  });

  it('TINY-6952: Updates palette hue on RGB field change', async () => {
    const component = hook.component();
    RepresentingUtils.setComposedValue(
      component,
      '#000000'
    );

    await pAssertColour(component, '0', 'R');
    await pAssertColour(component, '0', 'G');
    await pAssertColour(component, '0', 'B');
    await pAssertPaletteHue(component, 0);

    setRgbValue(component, '255', 'R');
    setRgbValue(component, '51', 'G');
    setRgbValue(component, '255', 'B');

    await pAssertColour(component, '255', 'R');
    await pAssertColour(component, '51', 'G');
    await pAssertColour(component, '255', 'B');
    await pAssertPaletteHue(component, 300);

    RepresentingUtils.assertComposedValue(
      component,
      '#FF33FF'
    );
  });

  it('TINY-6952: Updates palette hue and RGB fields on hex field change', async () => {
    const component = hook.component();
    RepresentingUtils.setComposedValue(
      component,
      '#000000'
    );

    await pAssertColour(component, '0', 'R');
    await pAssertColour(component, '0', 'G');
    await pAssertColour(component, '0', 'B');

    setHexValue(component, '00EEDD');

    await pAssertColour(component, '0', 'R');
    await pAssertColour(component, '238', 'G');
    await pAssertColour(component, '221', 'B');
    await pAssertPaletteHue(component, 176);

    RepresentingUtils.assertComposedValue(
      component,
      '#00EEDD'
    );
  });

  it('TINY-9457: Updates preview when hex field value prefixed with #', async () => {
    const component = hook.component();
    RepresentingUtils.setComposedValue(
      component,
      '#000000'
    );

    await pAssertColour(component, '0', 'R');
    await pAssertColour(component, '0', 'G');
    await pAssertColour(component, '0', 'B');

    setHexValue(component, '#00EEDD');

    await pAssertColour(component, '0', 'R');
    await pAssertColour(component, '238', 'G');
    await pAssertColour(component, '221', 'B');
    await pAssertPaletteHue(component, 176);
    await pAssertPreviewBgColor(component, 'rgb(0, 238, 221)');

    RepresentingUtils.assertComposedValue(
      component,
      '#00EEDD'
    );

  });

  context('TINY-9819, force_hex_color option set to default (false)', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
    }, []);

    it('should not affect data-mce-style attribute', () => {
      const editor = hook.editor();
      assert.isFalse(editor.options.get('force_hex_color'), 'force_hex_color must be false');

      editor.setContent('<p>colour me</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'color me'.length);

      const hexColor = '#E03E2D';
      editor.execCommand('mceApplyTextcolor', 'forecolor' as any, hexColor);

      const outerHTML = editor.dom.getOuterHTML(editor.getBody());
      const dataMceStyle = outerHTML.match(/data-mce-style="[^"]+"/)?.[0];
      assert.isString(dataMceStyle, `Can't find data-mce-style in "${outerHTML}"`);
      const expectedColor = 'color: rgb(224, 62, 45);';
      expect(dataMceStyle).to.include(expectedColor, `"${dataMceStyle}" does not include expected color: "${expectedColor}".`);
    });
  });

  context('TINY-9819, force_hex_color option set to true', () => {
    const color_map = [ '#E03E2D', 'Red' ];
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      force_hex_color: true,
      toolbar: 'forecolor',
      color_map,
    }, []);

    it('force_hex_color option will always set data-mce-style colors to hex', () => {
      const editor = hook.editor();
      assert.isTrue(editor.options.get('force_hex_color'), 'force_hex_color must be true');

      editor.setContent('<p>colour me</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 'color me'.length);

      editor.execCommand('mceApplyTextcolor', 'forecolor' as any, color_map[0]);

      const outerHTML = editor.dom.getOuterHTML(editor.getBody());
      const dataMceStyle = outerHTML.match(/data-mce-style="[^"]+"/)?.[0];
      const expectedColor = `color: ${color_map[0]};`;
      expect(dataMceStyle).to.include(expectedColor, `"${dataMceStyle}" does not include expected color: "${expectedColor}".`);
    });

    it('TINY-9819: changing fore-color with toolbar', async () => {
      const editor = hook.editor();

      TinyUiActions.clickOnToolbar(editor, '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, `div[data-mce-color="${color_map[0]}"]`);

      const outerHTML = editor.dom.getOuterHTML(editor.getBody());
      const dataMceStyle = outerHTML.match(/data-mce-style="[^"]+"/)?.[0];
      const expectedColor = `color: ${color_map[0]};`;
      expect(dataMceStyle).to.include(expectedColor, `"${dataMceStyle}" does not include expected color: "${expectedColor}".`);
    });
  });

  context('Force_hex_color option set to true without color_map', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      base_url: '/project/tinymce/js/tinymce',
      force_hex_color: true,
      toolbar: 'forecolor',
    }, []);

    it('TINY-9819: color should be hex', () => {
      const editor = hook.editor();
      assert.isFalse(editor.options.isSet('color_map'));

      const hexColor = '#00FF00';
      editor.execCommand('mceApplyTextcolor', 'forecolor' as any, hexColor);
      const outerHTML = editor.dom.getOuterHTML(editor.getBody());
      const dataMceStyle = outerHTML.match(/data-mce-style="[^"]+"/)?.[0];
      const expectedColor = `color: ${hexColor};`;
      expect(dataMceStyle).to.include(expectedColor, `"${dataMceStyle}" does not include expected color: "${expectedColor}".`);
    });

    it('TINY-9819: color will still be hex even with RGB value', () => {
      const editor = hook.editor();

      const rgbColor = 'rgb(55, 155, 55)';
      editor.execCommand('mceApplyTextcolor', 'forecolor' as any, rgbColor);
      const outerHTML = editor.dom.getOuterHTML(editor.getBody());
      const dataMceStyle = outerHTML.match(/data-mce-style="[^"]+"/)?.[0];
      const expectedColor = `color: ${Transformations.rgbaToHexString(rgbColor)};`;
      expect(dataMceStyle).to.include(expectedColor, `"${dataMceStyle}" does not include expected color: "${expectedColor}".`);
    });

    it('TINY-9819: changing fore-color with toolbar', async () => {
      const editor = hook.editor();

      const hexColor = '#E03E2D';
      TinyUiActions.clickOnToolbar(editor, '[aria-label^="Text color"] > .tox-tbtn + .tox-split-button__chevron');
      await TinyUiActions.pWaitForUi(editor, '.tox-swatches');
      TinyUiActions.clickOnUi(editor, `div[data-mce-color="${hexColor}"]`);

      const outerHTML = editor.dom.getOuterHTML(editor.getBody());
      const dataMceStyle = outerHTML.match(/data-mce-style="[^"]+"/)?.[0];
      const expectedColor = `color: ${hexColor};`;
      expect(dataMceStyle).to.include(expectedColor, `"${dataMceStyle}" does not include expected color: "${expectedColor}".`);
    });
  });
});
