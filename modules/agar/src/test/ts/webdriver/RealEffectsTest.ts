import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';
import { Class, Css, Element, Html, Insert, Remove } from '@ephox/sugar';
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

UnitTest.asynctest('Real Effects Test', function (success, failure) {

  const platform = PlatformDetection.detect();

  // IE never passes unless watched and Edge 18 fails to hover on mousemove
  // the meta key on mac using chromedriver/safaridriver doesn't work (see https://github.com/webdriverio/webdriverio/issues/622)
  if (platform.browser.isIE() || platform.browser.isEdge() || platform.browser.isSafari() || (platform.os.isOSX() && platform.browser.isChrome())) {
    return success();
  }

  const head = Element.fromDom(document.head);
  const body = Element.fromDom(document.body);

  const container = Element.fromTag('div');

  const sCreateWorld = Step.sync(function () {
    const input = Element.fromTag('input');
    Insert.append(container, input);

    const css = Element.fromTag('style');
    Html.set(css, 'button { border: 1px solid black; }\nbutton.test:hover { border: 1px solid white }');
    Insert.append(head, css);

    const button = Element.fromTag('button');
    Class.add(button, 'test');
    Html.set(button, 'Mouse over me');
    Insert.append(container, button);
    Insert.append(body, container);
  });

  const sCheckInput = function (label, expected) {
    return Chain.asStep(body, [
      Chain.control(
        UiFinder.cFindIn('input'),
        Guard.addLogging(label + '\nlooking for input to check expected')
      ),
      UiControls.cGetValue,
      Assertions.cAssertEq(label + '\nChecking the input value', expected)
    ]);
  };

  const sCheckButtonBorder = function (label, expected) {
    return Chain.asStep(body, [
      UiFinder.cFindIn('button.test'),
      Chain.mapper(function (button) {
        const prop = platform.browser.isFirefox() || platform.browser.isEdge() || platform.browser.isIE() ? 'border-right-color' : 'border-color';
        return Css.get(button, prop);
      }),
      Assertions.cAssertEq(label + '\nChecking color of button border', expected)
    ]);
  };

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
      RealKeys.combo(platform.os.isOSX() ? { metaKey: true } : { ctrlKey: true }, 'a')
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
    Waiter.sTryUntil(
      'Waiting for hovered state',
      sCheckButtonBorder('Checking hovered state of button border', 'rgb(255, 255, 255)')
    )
  ], function () {
    Remove.remove(container);
    success();
  }, failure);
});
