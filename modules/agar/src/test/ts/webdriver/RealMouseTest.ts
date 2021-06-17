import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, Class, Css, DomEvent, Html, Insert, Remove, SugarElement } from '@ephox/sugar';

import * as Assertions from 'ephox/agar/api/Assertions';
import { Chain } from 'ephox/agar/api/Chain';
import * as Guard from 'ephox/agar/api/Guard';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as RealMouse from 'ephox/agar/api/RealMouse';
import { Step } from 'ephox/agar/api/Step';
import * as UiFinder from 'ephox/agar/api/UiFinder';

UnitTest.asynctest('RealMouseTest', (success, failure) => {

  const detection = PlatformDetection.detect();

  // IE never passes unless watched and Safari/Edge 18 fails to hover on mousemove
  if (detection.browser.isIE() || detection.browser.isEdge() || detection.browser.isSafari()) {
    return success();
  }

  const style = document.createElement('style');
  style.innerHTML = 'button[data-test]:hover { background-color: blue; color: white; } button.other { background-color: blue; color: white; } button';
  document.head.appendChild(style);

  const container = SugarElement.fromTag('div');
  const button = SugarElement.fromTag('button');
  Attribute.set(button, 'data-test', 'true');
  Html.set(button, 'hover-button');
  Insert.append(container, button);

  const other = SugarElement.fromTag('button');
  Class.add(other, 'other');
  Html.set(other, 'other-button');
  Insert.append(container, other);

  const normal = SugarElement.fromTag('button');
  Html.set(normal, 'Normal');
  Insert.append(container, normal);

  Insert.append(SugarElement.fromDom(document.body), container);

  const clickMe = SugarElement.fromTag('button');
  Class.add(clickMe, 'click-me');
  Html.set(clickMe, 'Click me!');
  Insert.append(container, clickMe);

  const count = Cell(0);
  // add a MouseUp handler
  const binder = DomEvent.bind(clickMe, 'mouseup', () => {
    count.set(count.get() + 1);
  });

  Pipeline.async({}, [
    RealMouse.sMoveToOn('.other'),
    Step.wait(100),
    RealMouse.sMoveToOn('button[data-test]'),

    Chain.asStep(container, [
      UiFinder.cFindIn('button[data-test]'),
      Chain.control(
        Chain.op((button) => {
          Assert.eq('After hovering', Css.get(other, 'background-color'), Css.get(button, 'background-color'));
        }),
        Guard.tryUntil('Waiting for button to turn blue')
      ),
      Chain.inject(container),
      UiFinder.cFindIn('.click-me'),
      RealMouse.cClick(),
      Chain.op((button) => {
        Assertions.assertEq('mouseup event has fired', 1, count.get());
        Assertions.assertEq(`button doesn't have ${RealMouse.BedrockIdAttribute} attribute`, false, Attribute.has(button, RealMouse.BedrockIdAttribute));
      })
    ])
  ], () => {
    binder.unbind();
    Remove.remove(container);
    success();
  }, failure);
});
