import { FocusTools, Keyboard, Keys, RealKeys, UiControls, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Future, Result } from '@ephox/katamari';
import { Value } from '@ephox/sugar';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import { tieredMenu as TieredMenu } from 'ephox/alloy/api/ui/TieredMenu';
import { Typeahead } from 'ephox/alloy/api/ui/Typeahead';
import * as TestDropdownMenu from 'ephox/alloy/test/dropdown/TestDropdownMenu';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as Sinks from 'ephox/alloy/test/Sinks';
import TestTypeaheadSteps from 'ephox/alloy/test/typeahead/TestTypeaheadSteps';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Button } from 'ephox/alloy/api/ui/Button';

UnitTest.asynctest('ButtonSpaceTest (webdriver)', (success, failure) => {
  GuiSetup.setup((store, doc, body) => {
    const sink = Sinks.relativeSink();

    return GuiFactory.build(
      {
        dom: {
          tag: 'div'
        },
        components: [

          Button.sketch({
            dom: {
              tag: 'button',
              classes: [ 'test-button-for-space' ],
              innerHtml: 'Click me'
            },
            action: store.adder('clicked')
          }),
          Button.sketch({
            dom: {
              tag: 'span',
              classes: [ 'test-fake-button-for-space' ],
              innerHtml: 'Click me'
            },
            action: store.adder('clicked.fake')
          })
        ]
      }
    );

  }, (doc, body, gui, component, store) => {

    return [
      FocusTools.sSetFocus('Focusing <button>', component.element(), '.test-button-for-space'),
      RealKeys.sSendKeysOn('.test-button-for-space', [
        // Press space.
        RealKeys.text('\uE00D')
      ]),
      Step.wait(1000),
      store.sAssertEq('Clicked should only have fired once', [ 'clicked' ]),
      store.sClear,

      FocusTools.sSetFocus('Focusing <button>', component.element(), '.test-fake-button-for-space'),
      RealKeys.sSendKeysOn('.test-fake-button-for-space', [
        // Press space.
        RealKeys.text('\uE00D')
      ]),
      Step.wait(1000),
      store.sAssertEq('Clicked should only have fired once', [ 'clicked.fake' ])
    ];
  }, () => { success(); }, failure);
});
