import Assertions from 'ephox/agar/api/Assertions';
import Chain from 'ephox/agar/api/Chain';
import Guard from 'ephox/agar/api/Guard';
import Pipeline from 'ephox/agar/api/Pipeline';
import RealClipboard from 'ephox/agar/api/RealClipboard';
import RealKeys from 'ephox/agar/api/RealKeys';
import RealMouse from 'ephox/agar/api/RealMouse';
import Step from 'ephox/agar/api/Step';
import UiControls from 'ephox/agar/api/UiControls';
import UiFinder from 'ephox/agar/api/UiFinder';
import Waiter from 'ephox/agar/api/Waiter';
import { PlatformDetection } from '@ephox/sand';
import { Insert } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('Real Effects Test', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var head = Element.fromDom(document.head);
  var body = Element.fromDom(document.body);

  var container = Element.fromTag('div');

  var platform = PlatformDetection.detect();

  var sCreateWorld = Step.sync(function () {
    var input = Element.fromTag('input');
    Insert.append(container, input);

    var css = Element.fromTag('style');
    Html.set(css, 'button { border: 1px solid black; }\nbutton.test:hover { border: 1px solid white }');
    Insert.append(head, css);

    var button = Element.fromTag('button');
    Class.add(button, 'test');
    Html.set(button, 'Mouse over me');
    Insert.append(container, button);
    Insert.append(body, container);
  });

  var sCheckInput = function (label, expected) {
    return Chain.asStep(body, [
      Chain.control(
        UiFinder.cFindIn('input'),
        Guard.addLogging(label + '\nlooking for input to check expected')
      ),
      UiControls.cGetValue,
      Assertions.cAssertEq(label + '\nChecking the input value', expected)
    ]);
  };

  var sCheckButtonBorder = function (label, expected) {
    return Chain.asStep(body, [
      UiFinder.cFindIn('button.test'),
      Chain.mapper(function (button) {
        var prop = platform.browser.isFirefox() || platform.browser.isEdge() || platform.browser.isIE() ? 'border-right-color' : 'border-color';
        return Css.get(button, prop);
      }),
      Assertions.cAssertEq(label + '\nChecking color of button border', expected)
    ]);
  };

  Pipeline.async({}, [
    sCreateWorld,
    Step.wait(2000),
    RealKeys.sSendKeysOn('input', [
      RealKeys.text('I am typing thos')
    ]),
    sCheckInput('Initial typing', 'I am typing thos'),
    Step.wait(100),
    RealKeys.sSendKeysOn('input', [
      RealKeys.backspace(),
      RealKeys.backspace()
    ]),
    sCheckInput('After backspacing incorrect letters', 'I am typing th'),
    Step.wait(100),
    RealKeys.sSendKeysOn('input', [
      RealKeys.text('is')
    ]),
    sCheckInput('After correcting "this"', 'I am typing this'),
    Step.wait(100),
    RealKeys.sSendKeysOn('input', [
      RealKeys.combo({ ctrlKey: true }, 'a')
    ]),
    Step.wait(100),
    RealClipboard.sCopy('input'),
    sCheckInput('After triggering copy', 'I am typing this'),

    Step.wait(100),
    RealKeys.sSendKeysOn('input', [
      RealKeys.backspace()
    ]),
    sCheckInput('After pressing Backspace on Select All', ''),
    Step.wait(100),
    RealClipboard.sPaste('input'),
    sCheckInput('Post paste', 'I am typing this'),
    Step.wait(1000),
    RealMouse.sMoveToOn('input'),
    sCheckButtonBorder('Checking initial state of button border', 'rgb(0, 0, 0)'),

    RealMouse.sMoveToOn('button.test'),
    Waiter.sTryUntil(
      'Waiting for hovered state',
      sCheckButtonBorder('Checking hovered state of button border', 'rgb(255, 255, 255)'),
      100,
      1000
    )
  ], function () {
    Remove.remove(container);
    success();
  }, failure);
});

