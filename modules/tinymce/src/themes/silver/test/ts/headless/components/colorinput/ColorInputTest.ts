import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { AlloyComponent, AlloyTriggers, Container, GuiFactory, Invalidating, NativeEvents, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { SelectorFind, SugarDocument, Traverse } from '@ephox/sugar';
import { assert } from 'chai';

import { renderColorInput } from 'tinymce/themes/silver/ui/dialog/ColorInput';

import * as TestExtras from '../../../module/TestExtras';

type StringAssert = ReturnType<ApproxStructure.StringApi['is']>;
type ArrayAssert = ReturnType<ApproxStructure.ArrayApi['has']>;

describe('headless.tinymce.themes.silver.components.colorinput.ColorInputTest', () => {
  const extrasHook = TestExtras.bddSetup();

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        classes: [ 'colorinput-container' ]
      },
      components: [
        renderColorInput({
          name: 'alpha',
          storageKey: 'test',
          label: Optional.some('test-color-input')
        }, extrasHook.access().extras.backstages.popup.shared, {
          colorPicker: (_callback, _value) => {},
          hasCustomColors: Fun.always,
          getColors: () => [
            { type: 'choiceitem', text: 'Turquoise', value: '#18BC9B' },
            { type: 'choiceitem', text: 'Green', value: '#2FCC71' },
            { type: 'choiceitem', text: 'Blue', value: '#3598DB' },
            { type: 'choiceitem', text: 'Purple', value: '#9B59B6' },
            { type: 'choiceitem', text: 'Navy Blue', value: '#34495E' }
          ],
          getColorCols: Fun.constant(3)
        }, Optional.none())
      ]
    })
  ));

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    '.tox-textbox-field-invalid input { outline: 2px solid red; }',
    '.tox-color-input span { padding: 4px 8px; }',
    '.tox-swatch { padding: 8px 4px }'
  ]);

  const getInput = () => {
    const component = hook.component();
    return component.getSystem().getByDom(
      SelectorFind.descendant(component.element, 'input').getOrDie('Could not find input in colorinput')
    ).getOrDie();
  };

  const getLegend = () => {
    const component = hook.component();
    return component.getSystem().getByDom(
      // Intentionally, only finding direct child
      SelectorFind.descendant(component.element, 'span').getOrDie('Could not find legend in colorinput')
    ).getOrDie();
  };

  const setColorInputValue = (component: AlloyComponent, newValue: string) => {
    // Once we put more identifying marks on a colorinput, use that instead.
    const colorinput = component.components()[0];
    Representing.setValue(colorinput, newValue);
  };

  const pOpenPicker = async () => {
    Mouse.clickOn(getLegend().element, 'root:span');
    await UiFinder.pWaitFor(
      'Waiting for colorswatch to show up!',
      extrasHook.access().getPopupSink(),
      '.tox-swatches'
    );
  };

  const assertFocusedValue = (label: string, expected: string) => {
    const value = FocusTools.getActiveValue(
      extrasHook.access().getPopupSink()
    );
    assert.equal(value, expected, 'Checking value of focused element');
  };

  const assertLegendBackground = (label: string, f: ApproxStructure.Builder<StringAssert>) => Assertions.assertStructure(
    label + ': Checking background of legend button',
    ApproxStructure.build((s, str, arr) => s.element('span', {
      styles: {
        'background-color': f(s, str, arr)
      }
    })),
    getLegend().element
  );

  const pAssertContainerClasses = (label: string, f: ApproxStructure.Builder<ArrayAssert[]>) => Waiter.pTryUntil(
    label + ': Checking classes on container',
    () => Assertions.assertStructure(
      'Checking classes only',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: f(s, str, arr)
        // ignore children
      })),
      Traverse.parent(getInput().element).getOrDie('Could not find parent of input')
    )
  );

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, _str, _arr) => s.element('div', {
        children: [
          s.element('div', {
            children: [
              // Ignore other information because it is subject to change. No oxide example yet.
              s.element('label', {}),
              s.element('div', {
                children: [
                  s.element('input', {}),
                  s.element('span', {})
                ]
              })
            ]
          })
        ]
      })),
      hook.component().element
    );
  });

  it('Initially, the colour should not be invalid', () => {
    assert.isFalse(Invalidating.isInvalid(getInput()), 'Invalidating.isInvalid');
  });

  it('Type an invalid colour: "notblue"', async () => {
    const component = hook.component();
    const doc = hook.root();
    FocusTools.setFocus(component.element, 'input');
    FocusTools.setActiveValue(doc, 'notblue');
    AlloyTriggers.emit(getInput(), NativeEvents.input());

    await pAssertContainerClasses('Post: typing invalid colour (notblue)', (_s, _str, arr) => [ arr.has('tox-textbox-field-invalid') ]);
    assertLegendBackground('After typing invalid colour (notblue)', (_s, str, _arr) => str.none());
  });

  it('Type a valid colour', async () => {
    const component = hook.component();
    const doc = hook.root();
    FocusTools.setFocus(component.element, 'input');
    FocusTools.setActiveValue(doc, 'green');
    AlloyTriggers.emit(getInput(), NativeEvents.input());
    await pAssertContainerClasses('Post: typing colour (green)', (_s, _str, arr) => [ arr.not('tox-textbox-field-invalid') ]);
    assertLegendBackground('After typing colour (green)', (_s, str, _arr) => str.is('green'));
  });

  it('TBA: Check that pressing enter inside the picker refocuses the colorinput', async () => {
    const doc = hook.root();
    await pOpenPicker();
    await FocusTools.pTryOnSelector('Focus should be on a swatch', doc, 'div.tox-swatch');
    Keyboard.activeKeydown(doc, Keys.enter());
    await FocusTools.pTryOnSelector('Focus should be back on colorinput button (after escape)', doc, '.colorinput-container input');
    assertFocusedValue('After pressing <enter> in hex', '#18BC9B');
    UiFinder.notExists(
      extrasHook.access().getPopupSink(),
      '.tox-swatches'
    );
  });

  it('TBA: Check that pressing escape inside the picker refocuses the colorinput button', async () => {
    const doc = hook.root();
    await pOpenPicker();
    await FocusTools.pTryOnSelector('Focus should be on a swatch', doc, 'div.tox-swatch');
    Keyboard.activeKeyup(doc, Keys.escape());
    await FocusTools.pTryOnSelector('Focus should be back on colorinput button (after escape)', doc, '.colorinput-container > div:not(.mce-silver-sink) span');
    UiFinder.notExists(
      extrasHook.access().getPopupSink(),
      '.tox-swatches'
    );
  });

  it('TBA: Check that validating an empty string passes (first time)', async () => {
    const component = hook.component();
    setColorInputValue(component, '');
    await Waiter.pWait(50);
    UiFinder.notExists(component.element, '.tox-textbox-field-invalid');
  });

  it('TBA: Check that validating an incorrect value fails', async () => {
    const component = hook.component();
    setColorInputValue(component, 'dog');
    await Waiter.pWait(50);
    UiFinder.exists(component.element, '.tox-textbox-field-invalid');
  });

  it('TBA: Check that validating an empty is string passes', async () => {
    const component = hook.component();
    setColorInputValue(component, '');
    await Waiter.pWait(50);
    UiFinder.notExists(component.element, '.tox-textbox-field-invalid');
  });
});
