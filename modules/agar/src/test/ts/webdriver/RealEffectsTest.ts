import { UnitTest } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { Class, Css, Html, Insert, Remove, SugarElement } from '@ephox/sugar';

import * as Assertions from 'ephox/agar/api/Assertions';
import { Chain } from 'ephox/agar/api/Chain';
import * as Guard from 'ephox/agar/api/Guard';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as RealClipboard from 'ephox/agar/api/RealClipboard';
import { RealKeys } from 'ephox/agar/api/RealKeys';
import * as RealMouse from 'ephox/agar/api/RealMouse';
import { Step } from 'ephox/agar/api/Step';
import * as UiControls from 'ephox/agar/api/UiControls';
import * as UiFinder from 'ephox/agar/api/UiFinder';
import * as Waiter from 'ephox/agar/api/Waiter';

UnitTest.asynctest('Real Effects Test', (success, failure) => {
  const platform = PlatformDetection.detect();

  const head = SugarElement.fromDom(document.head);
  const body = SugarElement.fromDom(document.body);

  const container = SugarElement.fromTag('div');

  const sCreateWorld = Step.sync(() => {
    const input = SugarElement.fromTag('input');
    Insert.append(container, input);

    const css = SugarElement.fromTag('style');
    Html.set(css, 'button { border: 1px solid black; }\nbutton.test:hover { border: 1px solid white }');
    Insert.append(head, css);

    const button = SugarElement.fromTag('button');
    Class.add(button, 'test');
    Html.set(button, 'Mouse over me');
    Insert.append(container, button);
    Insert.append(body, container);
  });

  const sCheckInput = (label, expected) =>
    Chain.asStep(body, [
      Chain.control(
        UiFinder.cFindIn('input'),
        Guard.addLogging(label + '\nlooking for input to check expected')
      ),
      UiControls.cGetValue,
      Assertions.cAssertEq(label + '\nChecking the input value', expected)
    ]);

  const sCheckButtonBorder = (label, expected) =>
    Chain.asStep(body, [
      UiFinder.cFindIn('button.test'),
      Chain.mapper((button) => {
        const prop = platform.browser.isFirefox() ? 'border-right-color' : 'border-color';
        return Css.get(button, prop);
      }),
      Assertions.cAssertEq(label + '\nChecking color of button border', expected)
    ]);

  Pipeline.async({}, [
    sCreateWorld,
    Step.wait(200),
    RealKeys.sSendKeysOn('input', [
      RealKeys.text('I am typing thos')
    ]),
    sCheckInput('Initial typing', 'I am typing thos'),
    Step.wait(50),
    RealKeys.sSendKeysOn('input', [
      RealKeys.backspace(),
      RealKeys.backspace()
    ]),
    sCheckInput('After backspacing incorrect letters', 'I am typing th'),
    Step.wait(50),
    RealKeys.sSendKeysOn('input', [
      RealKeys.text('is')
    ]),
    sCheckInput('After correcting "this"', 'I am typing this'),
    Step.wait(50),
    RealKeys.sSendKeysOn('input', [
      RealKeys.combo(platform.os.isMacOS() ? { metaKey: true } : { ctrlKey: true }, 'a')
    ]),
    Step.wait(50),
    RealClipboard.sCopy('input'),
    sCheckInput('After triggering copy', 'I am typing this'),

    Step.wait(50),
    RealKeys.sSendKeysOn('input', [
      RealKeys.backspace()
    ]),
    sCheckInput('After pressing Backspace on Select All', ''),
    Step.wait(50),
    RealClipboard.sPaste('input'),
    sCheckInput('Post paste', 'I am typing this'),
    Step.wait(100),
    RealMouse.sMoveToOn('input'),
    sCheckButtonBorder('Checking initial state of button border', 'rgb(0, 0, 0)'),
    RealMouse.sMoveToOn('button.test'),
    // Safari resets the mouse immediately after the move action so we can't do the assertion
    ...(platform.browser.isSafari() ? [] : [
      Waiter.sTryUntil(
        'Waiting for hovered state',
        sCheckButtonBorder('Checking hovered state of button border', 'rgb(255, 255, 255)')
      )
    ])
  ], () => {
    Remove.remove(container);
    success();
  }, failure);
});
