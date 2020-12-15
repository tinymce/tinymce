import { FocusTools, RealKeys, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';

UnitTest.asynctest('ButtonSpaceTest (webdriver)', (success, failure) => {
  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
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
  ), (_doc, _body, _gui, component, store) => [
    FocusTools.sSetFocus('Focusing <button>', component.element, '.test-button-for-space'),
    RealKeys.sSendKeysOn('.test-button-for-space', [
      // Press space.
      RealKeys.text('\uE00D')
    ]),
    Step.wait(400),
    store.sAssertEq('Clicked should only have fired once', [ 'clicked' ]),
    store.sClear,

    FocusTools.sSetFocus('Focusing <button>', component.element, '.test-fake-button-for-space'),
    RealKeys.sSendKeysOn('.test-fake-button-for-space', [
      // Press space.
      RealKeys.text('\uE00D')
    ]),
    Step.wait(400),
    store.sAssertEq('Clicked should only have fired once', [ 'clicked.fake' ])
  ], success, failure);
});
