import { Assert, UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';
import { Attr, Class, Css, DomEvent, Element, Html, Insert, Remove } from '@ephox/sugar';
import { Chain } from 'ephox/agar/api/Chain';
import * as Guard from 'ephox/agar/api/Guard';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as RealMouse from 'ephox/agar/api/RealMouse';
import { Step } from 'ephox/agar/api/Step';
import * as UiFinder from 'ephox/agar/api/UiFinder';
import { Cell } from '@ephox/katamari';
import { Assertions } from 'ephox/agar/api/Main';

UnitTest.asynctest('RealMouseTest', (success, failure) => {

  const detection = PlatformDetection.detect();

  // IE never passes unless watched and Safari/Edge 18 fails to hover on mousemove
  if (detection.browser.isIE() || detection.browser.isEdge() || detection.browser.isSafari()) {
    return success();
  }

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

  const clickMe = Element.fromTag('button');
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
        Assertions.assertEq(`button doesn't have ${RealMouse.BedrockIdAttribute} attribute`, false, Attr.has(button, RealMouse.BedrockIdAttribute));
      })
    ])
  ], () => {
    binder.unbind();
    Remove.remove(container);
    success();
  }, failure);
});
