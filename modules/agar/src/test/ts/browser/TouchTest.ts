import { UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { DomEvent, Insert, Remove, SugarElement } from '@ephox/sugar';

import * as Assertions from 'ephox/agar/api/Assertions';
import { Chain } from 'ephox/agar/api/Chain';
import * as GeneralSteps from 'ephox/agar/api/GeneralSteps';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as Touch from 'ephox/agar/api/Touch';
import * as UiFinder from 'ephox/agar/api/UiFinder';

UnitTest.asynctest('TouchTest', (success, failure) => {
  const input = SugarElement.fromTag('input');
  const container = SugarElement.fromTag('container');

  const platform = PlatformDetection.detect();

  // Add to the DOM so focus calls happen
  Insert.append(SugarElement.fromDom(document.body), container);

  let repository = [];

  const handlers = Arr.bind([ 'touchstart', 'touchend', 'touchmove', 'focus' ], (evt) => [
    DomEvent.bind(container, evt, () => repository.push('container.' + evt)),
    DomEvent.bind(input, evt, () => repository.push('input.' + evt))
  ]);

  const clearRepository = Step.sync(() => repository = []);
  const assertRepository = (label, expected) => Step.sync(() => Assertions.assertEq(label, expected, repository));

  const runStep = (label, expected, step) => GeneralSteps.sequence([
    clearRepository,
    step,
    assertRepository(label, expected)
  ]);

  const isUnfocusedFirefox = () =>
    // Focus events are not fired until the window has focus: https://bugzilla.mozilla.org/show_bug.cgi?id=566671
    platform.browser.isFirefox() && !document.hasFocus();

  const trueTapEventOrder = (() => {
    if (isUnfocusedFirefox()) {
      return [
        'input.touchstart', 'container.touchstart',
        'input.touchend', 'container.touchend'
      ];
    } else {
      return [
        'input.focus',
        'input.touchstart', 'container.touchstart',
        'input.touchend', 'container.touchend'
      ];
    }
  })();

  Insert.append(container, input);

  Pipeline.async({}, [
    runStep('Initial test', [], Step.pass),

    runStep('point test', [ 'container.touchstart' ], Step.sync(() => Touch.point('touchstart', container, 0, 0))),

    runStep(
      'sTrueTapOn (container > input)',
      trueTapEventOrder,
      Touch.sTrueTapOn(container, 'input')
    ),

    runStep(
      'cTap input',
      [
        'input.touchstart', 'container.touchstart',
        'input.touchend', 'container.touchend'
      ],
      Chain.asStep(container, [
        UiFinder.cFindIn('input'),
        Touch.cTap
      ])
    ),

    runStep(
      'cTouchStart input',
      [ 'input.touchstart', 'container.touchstart' ],
      Chain.asStep(container, [
        UiFinder.cFindIn('input'),
        Touch.cTouchStart
      ])
    ),

    runStep(
      'cTouchEnd input',
      [ 'input.touchend', 'container.touchend' ],
      Chain.asStep(container, [
        UiFinder.cFindIn('input'),
        Touch.cTouchEnd
      ])
    ),

    runStep(
      'cTouchMove input',
      [ 'input.touchmove', 'container.touchmove' ],
      Chain.asStep(container, [
        UiFinder.cFindIn('input'),
        Touch.cTouchMove
      ])
    )

  ], () => {
    Arr.each(handlers, (h) => {
      h.unbind();
    });
    Remove.remove(container);
    success();
  }, (err) => {
    Arr.each(handlers, (h) => {
      h.unbind();
    });
    failure(err);
  });
});
