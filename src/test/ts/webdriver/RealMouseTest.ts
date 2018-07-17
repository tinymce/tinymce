import { UnitTest } from '@ephox/bedrock';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Class, Css, Element, Html, Insert, Remove } from '@ephox/sugar';
import { Chain } from 'ephox/agar/api/Chain';
import * as Guard from 'ephox/agar/api/Guard';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as RawAssertions from 'ephox/agar/api/RawAssertions';
import * as RealMouse from 'ephox/agar/api/RealMouse';
import * as Step from 'ephox/agar/api/Step';
import * as UiFinder from 'ephox/agar/api/UiFinder';

UnitTest.asynctest('RealMouseTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const detection = PlatformDetection.detect();

  const style = document.createElement('style');
  style.innerHTML = 'button[data-test]:hover { background-color: blue; color: white; } button.other { background-color: blue; color: white; } button';
  document.head.appendChild(style);

  const container = Element.fromTag('div');
  const button = Element.fromTag('button');
  Attr.set(button, 'data-test', 'true');
  Html.set(button, 'hover-button');
  Insert.append(container, button);

  const other = Element.fromTag('button');
  Class.add(other, 'other');
  Html.set(other, 'other-button');
  Insert.append(container, other);

  const normal = Element.fromTag('button');
  Html.set(normal, 'Normal');
  Insert.append(container, normal);

  Insert.append(Element.fromDom(document.body), container);

  Pipeline.async({}, [
    RealMouse.sMoveToOn('.other'),
    // Wait 1 second. Probably don't need to...
    Step.wait(1000),
    RealMouse.sMoveToOn('button[data-test]'),

    Chain.asStep(container, [
      UiFinder.cFindIn('button[data-test]'),
      Chain.control(
        Chain.op(function (button) {
          // Geckodriver does not have support for API actions yet.
          if (!detection.browser.isFirefox()) RawAssertions.assertEq('After hovering', Css.get(other, 'background-color'), Css.get(button, 'background-color'));
        }),
        Guard.tryUntil('Waiting for button to turn blue', 100, 2000)
      )
    ])
  ], function () {
    Remove.remove(container);
    success();
  }, failure);
});

