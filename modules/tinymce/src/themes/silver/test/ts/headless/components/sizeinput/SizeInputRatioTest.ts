import { FocusTools, Mouse, UiFinder } from '@ephox/agar';
import { type AlloyComponent, GuiFactory, NativeEvents, Representing } from '@ephox/alloy';
import { Assert, beforeEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { Class, Focus, type SugarElement } from '@ephox/sugar';

import { renderSizeInput } from 'tinymce/themes/silver/ui/dialog/SizeInput';

import * as DomUtils from '../../../module/DomUtils';
import * as GuiSetup from '../../../module/GuiSetup';
import TestBackstage from '../../../module/TestBackstage';

describe('headless.tinymce.themes.silver.components.sizeinput.SizeInputRatioTest', () => {
  const backstage = TestBackstage();
  // A ratio of 2 means the width is twice the height
  let ratio: number | undefined = 2;
  const hook = GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderSizeInput({
      name: 'dimensions',
      context: 'any',
      label: Optional.some('size'),
      constrain: true,
      enabled: true,
      ratio: Optional.some(() => ratio)
    }, backstage.shared.providers)
  ));

  const widthSelector = '.tox-form__controls-h-stack > .tox-form__group:nth-child(1) input';
  const heightSelector = '.tox-form__controls-h-stack > .tox-form__group:nth-child(2) input';

  const setDimensions = (component: AlloyComponent, width: string, height: string) =>
    Representing.setValue(component, { width, height });

  const assertDimensions = (label: string, component: AlloyComponent, width: string, height: string) =>
    Assert.eq(label, { width, height }, Representing.getValue(component));

  const typeInto = (component: AlloyComponent, selector: string, value: string, root: SugarElement<Document> = hook.root()) => {
    FocusTools.setFocus(component.element, selector);
    FocusTools.setActiveValue(root, value);
    DomUtils.triggerEventOnFocused(component, NativeEvents.input());
  };

  const setLocked = (component: AlloyComponent, locked: boolean) => {
    const lock = UiFinder.findIn(component.element, '.tox-lock').getOrDie();
    if (Class.has(lock, 'tox-locked') !== locked) {
      Mouse.click(lock);
    }
  };

  beforeEach(() => {
    const component = hook.component();
    // Blur so the next focus works the ratio out from the new values
    Focus.active().each(Focus.blur);
    setLocked(component, true);
    ratio = 2;
    setDimensions(component, '', '');
  });

  it('TINYMCE-9866: should leave the blank field blank when typing into the field with a value', () => {
    const component = hook.component();
    setDimensions(component, '100', '');
    typeInto(component, widthSelector, '150');
    assertDimensions('Height should stay blank', component, '150', '');
  });

  it('TINYMCE-9866: should use the ratio when typing into a blank height', () => {
    const component = hook.component();
    setDimensions(component, '100', '');
    typeInto(component, heightSelector, '30');
    assertDimensions('Width should be the height times the ratio', component, '60', '30');
  });

  it('TINYMCE-9866: should use the ratio when typing into a blank width', () => {
    const component = hook.component();
    setDimensions(component, '', '50px');
    typeInto(component, widthSelector, '40');
    assertDimensions('Height should be the width divided by the ratio, keeping its unit', component, '40', '20px');
  });

  it('TINYMCE-9866: should do nothing when both fields are blank', () => {
    const component = hook.component();
    typeInto(component, widthSelector, '40');
    assertDimensions('Height should stay blank', component, '40', '');
  });

  it('TINYMCE-9866: should use the ratio after a field is cleared and typed into again', () => {
    const component = hook.component();
    setDimensions(component, '100', '100');
    typeInto(component, heightSelector, '');
    assertDimensions('Clearing the height should not change the width', component, '100', '');
    Focus.active().each(Focus.blur);
    typeInto(component, heightSelector, '30');
    assertDimensions('Width should be the height times the ratio', component, '60', '30');
  });

  it('TINYMCE-9866: should keep the ratio between the fields when both have values', () => {
    const component = hook.component();
    setDimensions(component, '100', '100');
    typeInto(component, widthSelector, '50');
    assertDimensions('Height should follow the ratio between the fields, not the ratio option', component, '50', '50');
  });

  it('TINYMCE-9866: should not use the ratio when the lock is off', () => {
    const component = hook.component();
    setLocked(component, false);
    setDimensions(component, '100', '');
    typeInto(component, heightSelector, '30');
    assertDimensions('Width should not change', component, '100', '30');
  });

  it('TINYMCE-9866: should not use the ratio when the other field is a percentage', () => {
    const component = hook.component();
    setDimensions(component, '50%', '');
    typeInto(component, heightSelector, '30');
    assertDimensions('Width should not change', component, '50%', '30');
  });

  it('TINYMCE-9866: should not use the ratio when typing a percentage into the blank field', () => {
    const component = hook.component();
    setDimensions(component, '100', '');
    typeInto(component, heightSelector, '30%');
    assertDimensions('Width should not change', component, '100', '30%');
  });

  it('TINYMCE-9866: should read the ratio each time a field gets focus', () => {
    const component = hook.component();
    setDimensions(component, '100', '');
    ratio = 4;
    typeInto(component, heightSelector, '10');
    assertDimensions('Width should use the changed ratio', component, '40', '10');
  });

  it('TINYMCE-9866: should not use a ratio when the function returns undefined', () => {
    const component = hook.component();
    setDimensions(component, '100', '');
    ratio = undefined;
    typeInto(component, heightSelector, '10');
    assertDimensions('Width should not change', component, '100', '10');
  });

  Arr.each([ 0, -2, NaN, Infinity ], (invalidRatio) => {
    it(`TINYMCE-9866: should not use a ratio of ${invalidRatio}`, () => {
      const component = hook.component();
      setDimensions(component, '100', '');
      ratio = invalidRatio;
      typeInto(component, heightSelector, '10');
      assertDimensions('Width should not change', component, '100', '10');
    });
  });

  context('Number ratio', () => {
    const numberHook = GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
      renderSizeInput({
        name: 'dimensions',
        context: 'any',
        label: Optional.some('size'),
        constrain: true,
        enabled: true,
        ratio: Optional.some(0.5)
      }, backstage.shared.providers)
    ));

    it('TINYMCE-9866: should use a number ratio when typing into a blank width', () => {
      const component = numberHook.component();
      setDimensions(component, '', '100');
      typeInto(component, widthSelector, '30', numberHook.root());
      assertDimensions('Height should be the width divided by the ratio', component, '30', '60');
    });
  });
});
